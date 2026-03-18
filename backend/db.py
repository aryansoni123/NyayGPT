import sqlite3
from pathlib import Path


def init_db(sqlite_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(sqlite_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            checksum TEXT,
            content_type TEXT,
            file_data BLOB NOT NULL,
            uploaded_at TEXT NOT NULL,
            page_count INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id TEXT NOT NULL,
            page_index INTEGER NOT NULL,
            text_content TEXT NOT NULL,
            FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            page_index INTEGER NOT NULL,
            chunk_index INTEGER NOT NULL,
            text_content TEXT NOT NULL,
            metadata_json TEXT NOT NULL,
            FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_pages_document_id ON pages(document_id);
        CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
        CREATE INDEX IF NOT EXISTS idx_chunks_page_index ON chunks(page_index);
        """
    )

    columns = [row[1] for row in conn.execute("PRAGMA table_info(documents)").fetchall()]
    if "checksum" not in columns:
        conn.execute("ALTER TABLE documents ADD COLUMN checksum TEXT;")

    conn.execute("CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_documents_checksum ON documents(checksum);")
    conn.commit()