#!/usr/bin/env python3
"""
Script to delete and recreate the Qdrant collection with correct dimensions
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.qdrant_client import get_qdrant_client, COLLECTION_NAME, EMBEDDING_DIMENSION
from qdrant_client.models import Distance, VectorParams

def main():
    """Delete old collection and create new one with correct dimensions"""
    print(f"🔧 Recreating Qdrant collection with {EMBEDDING_DIMENSION} dimensions...")
    print()

    client = get_qdrant_client()

    # Check if collection exists
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME in collection_names:
        print(f"❌ Deleting old collection: {COLLECTION_NAME}")
        client.delete_collection(collection_name=COLLECTION_NAME)
        print(f"✅ Deleted successfully")
        print()

    # Create new collection with correct dimensions
    print(f"📦 Creating new collection with {EMBEDDING_DIMENSION} dimensions...")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=EMBEDDING_DIMENSION,
            distance=Distance.COSINE
        )
    )
    print(f"✅ Collection created: {COLLECTION_NAME}")
    print()
    print(f"🎯 Ready to generate embeddings!")
    print(f"   Run: python scripts/embed_existing_stories.py")

if __name__ == "__main__":
    main()
