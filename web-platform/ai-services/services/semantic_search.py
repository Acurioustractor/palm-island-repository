"""
Semantic search service for stories
"""
from typing import List, Dict, Any
from services.embeddings import generate_embedding
from utils.qdrant_client import search_similar_stories

def search_stories(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Search for stories using semantic similarity

    Args:
        query: Search query (e.g., "fishing with grandfather")
        limit: Maximum number of results

    Returns:
        List of search results with scores and metadata
    """
    # Generate embedding for the search query
    query_embedding = generate_embedding(query)

    # Search Qdrant for similar stories
    results = search_similar_stories(query_embedding, limit=limit)

    # Format results
    formatted_results = []
    for result in results:
        formatted_results.append({
            "id": result.id,
            "score": result.score,
            "title": result.payload.get("title", ""),
            "content_preview": result.payload.get("content_preview", ""),
            "story_type": result.payload.get("story_type", ""),
            "created_at": result.payload.get("created_at", "")
        })

    return formatted_results

def get_similar_stories(story_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Find stories similar to a given story

    Args:
        story_id: ID of the story to find similar ones for
        limit: Maximum number of results

    Returns:
        List of similar stories
    """
    # This would require fetching the story's embedding from Qdrant first
    # For now, we'll implement a simpler version
    # In production, you'd fetch the embedding and search with it
    pass
