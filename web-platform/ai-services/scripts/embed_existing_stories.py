#!/usr/bin/env python3
"""
Script to generate embeddings for all existing stories in Supabase
and upload them to Qdrant for semantic search
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.embeddings import generate_story_embedding
from utils.supabase_client import get_all_stories, update_story_embedding
from utils.qdrant_client import create_collection, upsert_story_embedding

def main():
    """Main function to embed all stories"""
    print("🚀 Starting story embedding process...")
    print()

    # Step 1: Create Qdrant collection
    print("📦 Step 1: Setting up Qdrant collection...")
    create_collection()
    print()

    # Step 2: Fetch all stories from Supabase
    print("📚 Step 2: Fetching stories from Supabase...")
    stories = get_all_stories()
    print(f"   Found {len(stories)} stories")
    print()

    if len(stories) == 0:
        print("⚠️  No stories found. Add some stories to your database first!")
        return

    # Step 3: Generate embeddings and upload to Qdrant
    print(f"🧠 Step 3: Generating embeddings for {len(stories)} stories...")

    success_count = 0
    error_count = 0

    for i, story in enumerate(stories, 1):
        try:
            story_id = story['id']
            title = story.get('title', '')
            content = story.get('content', '')

            if not title or not content:
                print(f"   ⚠️  Skipping story {story_id}: missing title or content")
                error_count += 1
                continue

            # Generate embedding
            print(f"   [{i}/{len(stories)}] Processing: {title[:50]}...")
            embedding = generate_story_embedding(title, content)

            # Create content preview (first 200 chars)
            content_preview = content[:200] + "..." if len(content) > 200 else content

            # Metadata for Qdrant
            metadata = {
                "title": title,
                "content_preview": content_preview,
                "story_type": story.get('story_type', ''),
                "created_at": story.get('created_at', '')
            }

            # Upload to Qdrant
            upsert_story_embedding(story_id, embedding, metadata)

            # Update Supabase with embedding
            update_story_embedding(story_id, embedding)

            success_count += 1

        except Exception as e:
            print(f"   ❌ Error processing story {story_id}: {e}")
            error_count += 1

    print()
    print("=" * 60)
    print("✅ Embedding process complete!")
    print(f"   Successful: {success_count}")
    print(f"   Errors: {error_count}")
    print("=" * 60)
    print()
    print("🔍 You can now use semantic search!")
    print("   Start the API server: python main.py")
    print("   Then search: curl http://localhost:8000/api/search -d '{\"query\": \"fishing\"}'")

if __name__ == "__main__":
    main()
