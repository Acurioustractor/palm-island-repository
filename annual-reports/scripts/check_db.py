#!/usr/bin/env python3
"""Check what tables/data exist in Supabase."""

import os
from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client
except ImportError:
    print("Install: pip install supabase")
    exit(1)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not key:
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    print("⚠️ Using anon key")

print(f"Connecting to: {url}")
client = create_client(url, key)

# Try common tables
tables_to_check = [
    "profiles",
    "stories",
    "organizations",
    "organization_services",
    "storytellers",
    "people",
    "users",
]

print("\n📊 Checking available tables:")
print("-" * 50)

for table in tables_to_check:
    try:
        response = client.table(table).select("*", count="exact").limit(1).execute()
        count = response.count or len(response.data or [])
        print(f"  ✅ {table}: {count} records")

        # Show sample record structure
        if response.data:
            keys = list(response.data[0].keys())[:5]
            print(f"      Columns: {', '.join(keys)}...")
    except Exception as e:
        err = str(e)
        if "404" in err or "not found" in err.lower():
            print(f"  ❌ {table}: table doesn't exist")
        elif "403" in err:
            print(f"  🔒 {table}: access denied (RLS)")
        else:
            print(f"  ⚠️ {table}: {err[:50]}...")
