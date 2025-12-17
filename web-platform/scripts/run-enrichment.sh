#!/bin/bash
# Run the database enrichment script with environment variables loaded

set -e

cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env.local ]; then
  echo "Loading .env.local..."
  set -a
  source .env.local
  set +a
else
  echo "Error: .env.local not found"
  exit 1
fi

# Check required vars
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL not set"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: SUPABASE_SERVICE_ROLE_KEY not set"
  exit 1
fi

echo ""
echo "============================================"
echo "  Palm Island Database Enrichment"
echo "============================================"
echo ""
echo "Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:0:40}..."
echo ""
echo "Usage:"
echo "  ./scripts/run-enrichment.sh [options]"
echo ""
echo "Options:"
echo "  --dry-run       Preview changes without writing"
echo "  --phase=N       Run specific phase (1-5)"
echo "  --skip-backup   Skip backup phase"
echo "  --limit=N       Limit items per phase"
echo ""
echo "Phases:"
echo "  1: Backup existing data"
echo "  2: Catalog media from storage"
echo "  3: Analyze images with Vision AI"
echo "  4: Generate story embeddings"
echo "  5: Extract themes and quotes"
echo ""

# Run the script
npx tsx scripts/enrich-database.ts "$@"
