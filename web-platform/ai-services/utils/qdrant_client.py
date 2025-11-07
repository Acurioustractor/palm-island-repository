"""
Qdrant vector database client for semantic search
"""
import os
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv

load_dotenv()

COLLECTION_NAME = "palm_island_stories"
EMBEDDING_DIMENSION = int(os.getenv("EMBEDDING_DIMENSION", "384"))

def get_qdrant_client() -> QdrantClient:
    """Create and return Qdrant client"""
    url = os.getenv("QDRANT_URL", "http://localhost:6333")
    api_key = os.getenv("QDRANT_API_KEY")

    if api_key:
        return QdrantClient(url=url, api_key=api_key)
    else:
        return QdrantClient(url=url)

def create_collection():
    """Create the stories collection if it doesn't exist"""
    client = get_qdrant_client()

    # Check if collection exists
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME not in collection_names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=EMBEDDING_DIMENSION,
                distance=Distance.COSINE
            )
        )
        print(f"✅ Created collection: {COLLECTION_NAME}")
    else:
        print(f"✅ Collection already exists: {COLLECTION_NAME}")

def upsert_story_embedding(story_id: str, embedding: List[float], metadata: Dict[str, Any]):
    """
    Insert or update a story embedding in Qdrant

    Args:
        story_id: UUID of the story
        embedding: Vector embedding
        metadata: Story metadata (title, content preview, etc.)
    """
    client = get_qdrant_client()

    point = PointStruct(
        id=story_id,
        vector=embedding,
        payload=metadata
    )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[point]
    )

def search_similar_stories(query_embedding: List[float], limit: int = 10):
    """
    Search for similar stories using vector similarity

    Args:
        query_embedding: Query vector
        limit: Maximum number of results

    Returns:
        List of search results with scores
    """
    client = get_qdrant_client()

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        limit=limit
    )

    return results

def delete_story_embedding(story_id: str):
    """Delete a story embedding from Qdrant"""
    client = get_qdrant_client()

    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=[story_id]
    )
