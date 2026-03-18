import json
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from pypdf import PdfReader


class HybridRAGEngine:
    def __init__(
        self,
        db_conn: sqlite3.Connection,
        sqlite_path: Path,
        upload_dir: Path,
        vector_dir: Path,
        embedding_model: str = "text-embedding-3-small",
        llm_model: str = "gpt-4o-mini",
    ) -> None:
        self.db_conn = db_conn
        self.sqlite_path = sqlite_path
        self.upload_dir = upload_dir
        self.vector_dir = vector_dir
        self.embedding_model = embedding_model
        self.llm_model = llm_model
        self.chunk_count = 0

        self.embeddings = OpenAIEmbeddings(model=self.embedding_model)
        self.vectorstore: FAISS | None = None
        self.bm25_retriever: BM25Retriever | None = None

    def _tokenize(self, text: str) -> set[str]:
        return set(re.findall(r"[a-zA-Z0-9_]+", text.lower()))

    def _read_all_chunk_docs(self) -> list[Document]:
        rows = self.db_conn.execute(
            """
            SELECT document_id, filename, page_index, chunk_index, text_content, metadata_json
            FROM chunks
            ORDER BY id ASC
            """
        ).fetchall()

        docs: list[Document] = []
        for row in rows:
            metadata = json.loads(row["metadata_json"])
            docs.append(Document(page_content=row["text_content"], metadata=metadata))
        return docs

    def rebuild_retrievers_from_sqlite(self) -> None:
        docs = self._read_all_chunk_docs()
        self.chunk_count = len(docs)
        if not docs:
            self.vectorstore = None
            self.bm25_retriever = None
            return

        self.vectorstore = FAISS.from_documents(docs, self.embeddings)
        self.vectorstore.save_local(str(self.vector_dir))

        self.bm25_retriever = BM25Retriever.from_documents(docs)
        self.bm25_retriever.k = min(12, len(docs))

    def list_documents(self) -> list[dict]:
        rows = self.db_conn.execute(
            """
            SELECT id, filename, page_count, uploaded_at
            FROM documents
            ORDER BY uploaded_at DESC
            """
        ).fetchall()
        return [
            {
                "id": row["id"],
                "filename": row["filename"],
                "page_count": row["page_count"],
                "uploaded_at": row["uploaded_at"],
            }
            for row in rows
        ]

    def ingest_pdf(self, filename: str, file_bytes: bytes, content_type: str = "application/pdf") -> dict:
        document_id = str(uuid.uuid4())
        saved_path = self.upload_dir / f"{document_id}_{filename}"
        saved_path.write_bytes(file_bytes)

        reader = PdfReader(str(saved_path))
        if not reader.pages:
            raise ValueError("No readable pages found in PDF.")

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200,
            chunk_overlap=180,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

        uploaded_at = datetime.now(timezone.utc).isoformat()
        self.db_conn.execute(
            """
            INSERT INTO documents (id, filename, content_type, file_data, uploaded_at, page_count)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (document_id, filename, content_type, sqlite3.Binary(file_bytes), uploaded_at, len(reader.pages)),
        )

        all_chunks: list[Document] = []
        for page_idx, page in enumerate(reader.pages):
            page_text = (page.extract_text() or "").strip()
            if not page_text:
                continue

            self.db_conn.execute(
                """
                INSERT INTO pages (document_id, page_index, text_content)
                VALUES (?, ?, ?)
                """,
                (document_id, page_idx, page_text),
            )

            page_docs = splitter.create_documents([page_text])
            for chunk_idx, chunk_doc in enumerate(page_docs):
                metadata = {
                    "document_id": document_id,
                    "filename": filename,
                    "page_index": page_idx,
                    "pageIndex": page_idx,
                    "chunk_index": chunk_idx,
                    "source": f"{filename}:page-{page_idx + 1}:chunk-{chunk_idx + 1}",
                }

                self.db_conn.execute(
                    """
                    INSERT INTO chunks (document_id, filename, page_index, chunk_index, text_content, metadata_json)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        document_id,
                        filename,
                        page_idx,
                        chunk_idx,
                        chunk_doc.page_content,
                        json.dumps(metadata),
                    ),
                )

                all_chunks.append(Document(page_content=chunk_doc.page_content, metadata=metadata))

        self.db_conn.commit()

        if not all_chunks:
            raise ValueError("No extractable text found in uploaded PDF.")

        self.rebuild_retrievers_from_sqlite()

        return {
            "status": "success",
            "document_id": document_id,
            "filename": filename,
            "pages": len(reader.pages),
            "chunks": len(all_chunks),
            "message": "PDF stored in SQLite and indexed with hybrid RAG.",
        }

    def _fused_hybrid_retrieve(self, query: str, top_k: int) -> list[Document]:
        if self.vectorstore is None or self.bm25_retriever is None:
            return []

        dense_k = max(top_k * 2, 8)
        bm25_k = max(top_k * 2, 8)

        dense_docs = self.vectorstore.similarity_search(query, k=dense_k)
        self.bm25_retriever.k = bm25_k
        sparse_docs = self.bm25_retriever.invoke(query)

        rank_map: dict[str, dict] = {}
        rrf_k = 60.0

        def _doc_key(doc: Document) -> str:
            src = doc.metadata.get("source", "")
            return f"{src}|{hash(doc.page_content)}"

        for rank, doc in enumerate(dense_docs, start=1):
            key = _doc_key(doc)
            entry = rank_map.setdefault(key, {"doc": doc, "score": 0.0})
            entry["score"] += 1.0 / (rrf_k + rank)

        for rank, doc in enumerate(sparse_docs, start=1):
            key = _doc_key(doc)
            entry = rank_map.setdefault(key, {"doc": doc, "score": 0.0})
            entry["score"] += 1.0 / (rrf_k + rank)

        query_tokens = self._tokenize(query)
        for value in rank_map.values():
            doc = value["doc"]
            doc_tokens = self._tokenize(doc.page_content)
            overlap = len(query_tokens & doc_tokens)
            if query_tokens:
                value["score"] += 0.25 * (overlap / len(query_tokens))

            # Earlier pages often contain definitions/facts; keep a slight but not dominant bias.
            page_idx = int(doc.metadata.get("page_index", 0))
            value["score"] += 0.04 / (1 + page_idx)

        ranked = sorted(rank_map.values(), key=lambda item: item["score"], reverse=True)
        return [item["doc"] for item in ranked[:top_k]]

    def answer(self, query: str, top_k: int = 6) -> dict:
        if self.chunk_count == 0:
            raise RuntimeError("No indexed documents found. Upload at least one PDF first.")

        top_docs = self._fused_hybrid_retrieve(query=query, top_k=top_k)
        if not top_docs:
            raise RuntimeError("No relevant context found. Upload more case documents.")

        context_parts: list[str] = []
        citations: list[dict] = []
        for doc in top_docs:
            metadata = doc.metadata
            filename = str(metadata.get("filename", "Unknown"))
            page_index = int(metadata.get("page_index", 0))
            chunk_index = int(metadata.get("chunk_index", 0))
            document_id = str(metadata.get("document_id", ""))
            source = str(metadata.get("source", ""))

            context_parts.append(
                f"[{source}]\n"
                f"filename={filename}, pageIndex={page_index}, chunkIndex={chunk_index}\n"
                f"{doc.page_content}"
            )

            snippet = doc.page_content[:250].replace("\n", " ").strip()
            citations.append(
                {
                    "document_id": document_id,
                    "filename": filename,
                    "page_index": page_index,
                    "chunk_index": chunk_index,
                    "snippet": snippet,
                }
            )

        context_text = "\n\n".join(context_parts)

        prompt = (
            "You are NyayGPT, a legal research assistant for Indian law.\n"
            "Use ONLY the supplied retrieved context for factual claims.\n"
            "If context is missing for a claim, explicitly say what is missing.\n"
            "Include practical next steps and caution against acting without a licensed advocate.\n"
            "When citing facts, mention pageIndex and filename in plain text.\n\n"
            f"User question:\n{query}\n\n"
            f"Retrieved context:\n{context_text}"
        )

        llm = ChatOpenAI(model=self.llm_model, temperature=0.1)
        result = llm.invoke(prompt)
        answer_text = result.content if hasattr(result, "content") else str(result)
        return {
            "response": answer_text,
            "citations": citations,
        }