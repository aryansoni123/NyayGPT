import os
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db import ensure_schema, init_db
from rag_engine import HybridRAGEngine
from schemas import ChatRequest, ChatResponse, DocumentItem, HealthResponse


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SOURCE_DATA_DIR = BASE_DIR.parent / "Data"
UPLOAD_DIR = BASE_DIR / "uploads"
VECTOR_DIR = BASE_DIR / "vectorstore" / "db_faiss"
SQLITE_PATH = DATA_DIR / "nyaygpt.sqlite3"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_DIR.mkdir(parents=True, exist_ok=True)

db_conn = init_db(SQLITE_PATH)
ensure_schema(db_conn)

rag_engine = HybridRAGEngine(
    db_conn=db_conn,
    sqlite_path=SQLITE_PATH,
    upload_dir=UPLOAD_DIR,
    vector_dir=VECTOR_DIR,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    rag_engine.ingest_data_directory(SOURCE_DATA_DIR)
    yield


app = FastAPI(
    title="NyayGPT FastAPI RAG",
    version="2.0.0",
    description="Hybrid legal retrieval using BM25 + dense embeddings + rerank with page index metadata.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="NyayGPT FastAPI RAG",
        openai_key_configured=bool(os.getenv("OPENAI_API_KEY")),
        indexed_chunks=rag_engine.chunk_count,
        ingestion_mode="startup_data_directory",
        data_directory=str(SOURCE_DATA_DIR),
    )


@app.get("/documents", response_model=list[DocumentItem])
async def list_documents() -> list[DocumentItem]:
    return rag_engine.list_documents()


@app.post("/documents/upload")
async def upload_document_disabled() -> dict:
    return {
        "status": "disabled",
        "message": "Upload is disabled. Put PDF files in the workspace Data directory and restart backend.",
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured in environment.")

    try:
        response = rag_engine.answer(payload.message, top_k=payload.top_k)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat failed: {exc}") from exc

    return ChatResponse(**response)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
