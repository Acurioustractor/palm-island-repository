"""
FastAPI server for AI/ML services
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

from services.embeddings import generate_embedding, generate_story_embedding
from services.semantic_search import search_stories
from utils.qdrant_client import create_collection

load_dotenv()

app = FastAPI(
    title="Palm Island AI Services",
    description="AI/ML backend for semantic search and story analysis",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

class SearchResult(BaseModel):
    id: str
    score: float
    title: str
    content_preview: str
    story_type: str
    created_at: str

class EmbeddingRequest(BaseModel):
    text: str

class StoryEmbeddingRequest(BaseModel):
    title: str
    content: str

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting Palm Island AI Services...")

    # Create Qdrant collection if it doesn't exist
    try:
        create_collection()
        print("✅ Qdrant collection ready")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize Qdrant: {e}")
        print("   Make sure Qdrant is running: docker run -p 6333:6333 qdrant/qdrant")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Palm Island AI Services",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "api": "running",
            "embedding_model": "loaded",
            "qdrant": "connected"
        }
    }

@app.post("/api/search", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest):
    """
    Semantic search for stories

    Example:
        POST /api/search
        {
            "query": "fishing with grandfather",
            "limit": 10
        }
    """
    try:
        results = search_stories(request.query, limit=request.limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/embedding")
async def create_embedding(request: EmbeddingRequest):
    """
    Generate embedding for arbitrary text

    Example:
        POST /api/embedding
        {
            "text": "Traditional fishing methods"
        }
    """
    try:
        embedding = generate_embedding(request.text)
        return {
            "embedding": embedding,
            "dimension": len(embedding)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/story-embedding")
async def create_story_embedding(request: StoryEmbeddingRequest):
    """
    Generate embedding for a story (title + content)

    Example:
        POST /api/story-embedding
        {
            "title": "Fishing with Grandfather",
            "content": "A story about traditional fishing..."
        }
    """
    try:
        embedding = generate_story_embedding(request.title, request.content)
        return {
            "embedding": embedding,
            "dimension": len(embedding)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))

    uvicorn.run(app, host=host, port=port)
