# AI Legal Assistance System -- System Design Summary

## Project Goal

Build an **AI-powered legal assistant** designed for India (especially
rural users) that can: - Accept **voice or text queries in Hindi and
English** - Analyze **uploaded evidence (documents, screenshots,
receipts, chats)** - Use **RAG (Retrieval Augmented Generation)** to
retrieve relevant laws - Provide **legal explanations, next steps, and
confidence estimates** - Suggest **peaceful resolutions and nearby legal
help**

------------------------------------------------------------------------

# Core System Architecture

## High-Level Pipeline

User Input → Processing → Evidence Analysis → Query Fusion → RAG Engine
→ Legal Reasoning → Response

Steps:

1.  User Input (voice, text, documents)
2.  Speech/Text Processing
3.  Evidence Analyzer
4.  Query + Evidence Fusion
5.  Case Classification
6.  RAG Retrieval
7.  Legal Reasoning
8.  Confidence Engine
9.  Response Generation
10. Translation + Voice Output

------------------------------------------------------------------------

# Input Layer

Supported inputs:

-   Voice input
-   Text query
-   Evidence upload

Supported file formats:

-   JPG
-   PNG
-   PDF
-   DOCX
-   TXT
-   MP3
-   WAV

------------------------------------------------------------------------

# Voice Processing Pipeline

Used to support **rural accessibility**.

Pipeline:

Audio → Speech‑to‑Text → Language Detection → Translation

Tools:

-   Speech to Text: Faster‑Whisper
-   Language Detection: fastText
-   Translation: IndicTrans2
-   Text to Speech: Coqui TTS

------------------------------------------------------------------------

# Evidence Analyzer

The Evidence Analyzer converts uploaded files into **structured legal
signals**.

Pipeline:

File Upload → File Type Detection → OCR → Layout Analysis → Entity
Extraction → Evidence Classification → Timeline Generation → Evidence
Strength Scoring

Output: **Evidence Context Object**

Example:

    {
      evidence_summary,
      entities,
      timeline,
      evidence_types,
      relevance_score,
      evidence_strength
    }

------------------------------------------------------------------------

# Evidence Types

Defined evidence categories:

1.  Contract / Agreement
2.  Payment Proof
3.  Receipt / Invoice
4.  Communication (chat, email)
5.  Salary / Employment Document
6.  Legal Notice
7.  Property Document
8.  Identity Document

Each evidence type defines:

-   Supported formats
-   Extractable entities
-   Text patterns

Example entities:

-   names
-   dates
-   money
-   transaction IDs
-   addresses

------------------------------------------------------------------------

# Evidence Strength Model

Different evidence types have different legal strengths.

Example weights:

Contract = 0.9\
Payment Proof = 0.8\
Receipt = 0.6\
Communication = 0.5\
Verbal Claim = 0.2

This feeds into the **confidence engine**.

------------------------------------------------------------------------

# Query--Evidence Fusion

Evidence should not be processed separately from the user query.

Correct architecture:

Query + Evidence Context → Structured Legal Query

Example:

    {
      case_type: "rental dispute",
      query: "landlord not returning deposit",
      evidence: ["written contract","payment proof"]
    }

This improves retrieval accuracy.

------------------------------------------------------------------------

# Case Classification

The system classifies the dispute type.

Examples:

-   Consumer dispute
-   Rental dispute
-   Employment dispute
-   Cyber fraud
-   Property dispute
-   Domestic conflict

Possible models:

-   MiniLM
-   DistilBERT

------------------------------------------------------------------------

# RAG Legal Intelligence Engine

The RAG system retrieves relevant laws before generating responses.

Pipeline:

Query → Embedding → Vector Search → Retrieve Legal Documents → Context
Assembly → LLM Reasoning

Components:

Embedding Model: - bge-small

Vector Database: - FAISS

LLM Options: - Llama 3 - Mistral

Legal Data Sources:

-   Indian Penal Code
-   Consumer Protection Act
-   Labour Laws
-   Constitution Articles
-   Legal Aid Guidelines

------------------------------------------------------------------------

# Legal Reasoning Engine

The LLM produces:

-   Relevant legal sections
-   Explanation in simple language
-   Recommended next actions
-   Peaceful settlement suggestions

Example output sections:

1.  Case analysis
2.  Relevant law
3.  Evidence summary
4.  Next legal steps
5.  Settlement suggestions

------------------------------------------------------------------------

# Confidence / Legal Strength Meter

The system estimates case strength using:

-   Evidence strength
-   Law applicability
-   Documentation quality
-   Timeline validity

Example formula:

score = 0.3 \* evidence_strength + 0.25 \* law_match + 0.2 \*
documentation + 0.15 \* timeline_validity + 0.1 \* case_similarity

Output:

User Strength: 72%\
Opponent Strength: 38%

------------------------------------------------------------------------

# Fast Mode vs Pro Mode

Fast Mode: - Query → Classification → RAG → Quick advice - No evidence
analysis - \~2 seconds response

Pro Mode: - Query → Evidence Analyzer → Query Fusion → RAG → Reasoning →
Confidence score - Deeper legal analysis

------------------------------------------------------------------------

# Nearby Legal Help Service

Shows nearby institutions:

-   Police stations
-   Legal aid centers
-   Consumer courts
-   District courts

Possible APIs:

-   Google Maps API
-   OpenStreetMap

------------------------------------------------------------------------

# Backend Architecture

Suggested structure:

backend/

-   api/
-   voice/
-   rag/
-   evidence/
-   reasoning/
-   services/

Main framework:

-   FastAPI

------------------------------------------------------------------------

# Recommended Tech Stack

AI Layer: - Python - LangChain / LlamaIndex - FAISS - Transformers

Evidence Analyzer: - PaddleOCR - LayoutParser - spaCy

Voice Processing: - Faster‑Whisper - IndicTrans2 - Coqui TTS

Frontend:

-   React / NextJS or
-   Flutter

------------------------------------------------------------------------

# Key Design Principles

1.  Evidence should produce **structured facts**, not legal conclusions.
2.  Query and evidence must be **combined before retrieval**.
3.  Legal reasoning must rely on **retrieved law context**.
4.  The system should prioritize **accessibility for rural users**.
5.  Keep the system **modular and explainable**.

------------------------------------------------------------------------

# Final System Vision

The system combines:

-   Voice AI
-   Document AI
-   Evidence Analysis
-   RAG Legal Intelligence
-   Legal Reasoning
-   Confidence Estimation
-   Location‑based legal help

This results in an **AI-powered legal decision support system**, not
just a chatbot.
