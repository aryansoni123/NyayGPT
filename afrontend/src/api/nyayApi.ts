const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Citation {
  document_id: string;
  filename: string;
  page_index: number;
  chunk_index: number;
  snippet: string;
}

export interface ChatResponse {
  response: string;
  citations: Citation[];
}

export interface UploadResponse {
  status: string;
  document_id: string;
  filename: string;
  pages: number;
  chunks: number;
  message: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  page_count: number;
  uploaded_at: string;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details?.detail || "Failed to fetch response from NyayGPT API");
  }

  return response.json();
}

export async function uploadEvidencePdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details?.detail || "Upload failed");
  }

  return response.json();
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const response = await fetch(`${API_BASE_URL}/documents`);
  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details?.detail || "Failed to list documents");
  }
  return response.json();
}
