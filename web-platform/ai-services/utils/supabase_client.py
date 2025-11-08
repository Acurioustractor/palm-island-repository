"""
Supabase client for accessing story data
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    """Create and return Supabase client"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing Supabase credentials. "
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file"
        )

    return create_client(url, key)

def get_all_stories(limit: int = 1000):
    """
    Fetch all public stories from Supabase

    Args:
        limit: Maximum number of stories to fetch

    Returns:
        List of story objects with id, title, content, etc.
    """
    client = get_supabase_client()

    response = client.table('stories') \
        .select('id, title, content, story_type, created_at') \
        .limit(limit) \
        .execute()

    return response.data

def update_story_embedding(story_id: str, embedding: list):
    """
    Update a story's embedding in the database

    Args:
        story_id: UUID of the story
        embedding: List of floats representing the embedding vector
    """
    client = get_supabase_client()

    response = client.table('stories') \
        .update({'content_embedding': embedding}) \
        .eq('id', story_id) \
        .execute()

    return response.data
