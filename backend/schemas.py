from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    top_k: int = Field(default=6, ge=2, le=20)


class Citation(BaseModel):
    document_id: str
    filename: str
    page_index: int
    chunk_index: int
    snippet: str


class ChatResponse(BaseModel):
    response: str
    citations: list[Citation]


class UploadResponse(BaseModel):
    status: str
    document_id: str
    filename: str
    pages: int
    chunks: int
    message: str


class DocumentItem(BaseModel):
    id: str
    filename: str
    page_count: int
    uploaded_at: datetime


class HealthResponse(BaseModel):
    status: str
    service: str
    openai_key_configured: bool
    indexed_chunks: int