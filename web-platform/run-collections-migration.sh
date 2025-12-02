#!/bin/bash

cd "/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform"

# Get service key from env
SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d"=" -f2)

if [ -z "$SERVICE_KEY" ]; then
  echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
  exit 1
fi

echo "=== Running Photo Collections & Smart Folders Migration ==="
echo ""

# Method 1: Try using Supabase CLI
echo "Attempting to run via Supabase CLI..."
ACCESS_TOKEN=$(grep "^SUPABASE_ACCESS_TOKEN=" .env.local | cut -d"=" -f2)

if [ -n "$ACCESS_TOKEN" ]; then
  export SUPABASE_ACCESS_TOKEN="$ACCESS_TOKEN"
  npx supabase db execute --project-ref uaxhjzqrdotoahjnxmbj -f migrations/photo_collections_and_smart_folders.sql

  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully via Supabase CLI!"
    exit 0
  else
    echo "⚠️ Supabase CLI method failed, trying alternative..."
  fi
fi

# Method 2: Check if tables were created
echo ""
echo "Checking if tables exist..."
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections?limit=0" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ photo_collections table exists!"
else
  echo "❌ photo_collections table does not exist - please run SQL manually in Supabase Dashboard"
  echo ""
  echo "SQL file location: migrations/photo_collections_and_smart_folders.sql"
  echo ""
  echo "To run manually:"
  echo "1. Go to https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql/new"
  echo "2. Copy the contents of migrations/photo_collections_and_smart_folders.sql"
  echo "3. Paste and run"
  exit 1
fi

curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/collection_items?limit=0" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ collection_items table exists!"
else
  echo "❌ collection_items table missing"
fi

curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/smart_folders?limit=0" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ smart_folders table exists!"
else
  echo "❌ smart_folders table missing"
fi

echo ""
echo "=== Migration Status Check Complete ==="
