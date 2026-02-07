#!/usr/bin/env python3
"""Check what stories exist in Supabase."""

import os
from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client
except ImportError:
    print("Install: pip install supabase")
    exit(1)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# Prefer service role key for admin access
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not key:
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    print("⚠️ Using anon key - may have RLS restrictions")

if not url or not key:
    print("Missing credentials")
    print(f"URL: {'set' if url else 'missing'}")
    print(f"Key: {'set' if key else 'missing'}")
    exit(1)

print(f"Connecting to Supabase...")
print(f"URL: {url[:40]}...")
print(f"Key type: {'service_role' if 'SUPABASE_SERVICE_ROLE_KEY' in os.environ and os.environ.get('SUPABASE_SERVICE_ROLE_KEY') == key else 'anon'}")

client = create_client(url, key)

# Check stories table
print("\n📊 Stories Table Summary:")
print("-" * 50)

try:
    # Count all stories
    response = client.table("stories").select("id", count="exact").execute()
    total = response.count or len(response.data or [])
    print(f"Total stories: {total}")

    if total > 0:
        # Count by status
        for status in ["draft", "submitted", "under_review", "approved", "published", "archived"]:
            response = client.table("stories").select("id", count="exact").eq("status", status).execute()
            count = response.count or len(response.data or [])
            if count > 0:
                print(f"  {status}: {count}")

        # Get sample published stories
        print("\n📝 Sample Published Stories:")
        print("-" * 50)
        response = client.table("stories").select(
            "id, title, story_type, category, created_at"
        ).eq("status", "published").limit(10).execute()

        if response.data:
            for story in response.data:
                title = story.get("title", "Untitled")[:50]
                stype = story.get("story_type", "unknown")
                cat = story.get("category", "")
                print(f"  • {title}")
                print(f"    Type: {stype} | Category: {cat}")
        else:
            print("  No published stories found")

        # Check if annual_report columns exist
        print("\n🔍 Checking for annual report fields...")
        try:
            response = client.table("stories").select("annual_report_eligible").limit(1).execute()
            print("  ✅ annual_report_eligible column exists")
        except Exception as e:
            if "column" in str(e).lower() or "does not exist" in str(e).lower():
                print("  ❌ annual_report_eligible column NOT found - run migration first")
            else:
                print(f"  ⚠️ Error checking: {e}")
    else:
        print("  No stories in database yet")

except Exception as e:
    print(f"Error: {e}")
    print("\nThis might be due to:")
    print("  1. RLS policies blocking access (need service role key)")
    print("  2. Stories table doesn't exist yet")
    print("  3. Network/auth issues")
