#!/bin/bash

# Official Supabase Migration Process
# Based on: https://supabase.com/docs/reference/cli/supabase-db-push

cd "/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform"

echo "=== Supabase Database Migration ===="
echo ""

# Set access token from .env.local
ACCESS_TOKEN=$(grep "^SUPABASE_ACCESS_TOKEN=" .env.local | cut -d"=" -f2)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ ERROR: SUPABASE_ACCESS_TOKEN not found in .env.local"
  echo "Please add your access token to .env.local"
  exit 1
fi

export SUPABASE_ACCESS_TOKEN="$ACCESS_TOKEN"

echo "✅ Access token loaded"
echo ""

# Step 1: Link to remote project
echo "=== Step 1: Linking to Remote Project ==="
npx supabase link --project-ref uaxhjzqrdotoahjnxmbj

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Link failed, but may already be linked. Continuing..."
fi

echo ""

# Step 2: Dry run
echo "=== Step 2: Preview Migration (Dry Run) ==="
npx supabase db push --dry-run

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Dry run failed. Please check the errors above."
  exit 1
fi

echo ""
echo "=== Dry run complete. Review the changes above. ==="
echo ""
read -p "Apply migration? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "❌ Migration cancelled"
  exit 0
fi

echo ""

# Step 3: Apply migration
echo "=== Step 3: Applying Migration ==="
npx supabase db push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration applied successfully!"
else
  echo ""
  echo "❌ Migration failed. Check errors above."
  exit 1
fi
