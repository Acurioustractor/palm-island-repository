#!/bin/bash

cd "/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform"

SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d"=" -f2)
ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d"=" -f2)

echo "=========================================="
echo "COMPREHENSIVE COLLECTIONS SYSTEM TESTS"
echo "=========================================="
echo ""

# TEST 1: Table existence and counts
echo "=== TEST 1: Database Tables ==="
echo ""
echo "📁 photo_collections:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections?select=id&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range

echo ""
echo "🔗 collection_items:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/collection_items?select=id&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range

echo ""
echo "⚡ smart_folders:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/smart_folders?select=id&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range

echo ""
echo ""
echo "=== TEST 2: Smart Folders Configuration ==="
echo ""
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/smart_folders?select=name,slug,icon,color,is_system&is_system=eq.true&order=name" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq -r '.[] | "✓ \(.name) - slug:\(.slug) icon:\(.icon) color:\(.color)"'

echo ""
echo ""
echo "=== TEST 3: Query Rules Structure ==="
echo ""
echo "Elder Stories query rules:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/smart_folders?select=query_rules&slug=eq.elder-stories" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.[0].query_rules'

echo ""
echo ""
echo "=== TEST 4: Collections Data ==="
echo ""
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections?select=id,name,slug,item_count,is_public,created_at" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.'

echo ""
echo ""
echo "=== TEST 5: Collection Items ==="
echo ""
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/collection_items?select=id,collection_id,media_id,added_at" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.'

echo ""
echo ""
echo "=== TEST 6: Media Files Sample (for Smart Folders) ==="
echo ""
echo "Total media files:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/media_files?select=id&deleted_at=is.null&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range

echo ""
echo "Sample media with tags:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/media_files?select=id,filename,tags,quality_score,created_at&deleted_at=is.null&tags=not.is.null&limit=3" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.[] | {filename, tags, quality_score}'

echo ""
echo ""
echo "=== TEST 7: Permissions Check ==="
echo ""
echo "Anon key can SELECT collections:"
RESULT=$(curl -s -o /dev/null -w "%{http_code}" "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections?select=id&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY")
if [ "$RESULT" = "200" ]; then
  echo "✅ SUCCESS (HTTP 200)"
else
  echo "❌ FAILED (HTTP $RESULT)"
fi

echo ""
echo "Anon key can INSERT collections:"
RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","slug":"test-permission-check"}')
if [ "$RESULT" = "201" ]; then
  echo "✅ SUCCESS (HTTP 201)"
  # Clean up test collection
  curl -s -X DELETE "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections?slug=eq.test-permission-check" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" > /dev/null
elif [ "$RESULT" = "403" ]; then
  echo "⚠️  DENIED (HTTP 403) - RLS policy restricting inserts (expected for anon users)"
else
  echo "❌ UNEXPECTED (HTTP $RESULT)"
fi

echo ""
echo ""
echo "=== TEST 8: Indexes Exist ==="
echo ""
echo "Checking for performance indexes..."
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/pg_indexes?select=tablename,indexname&tablename=in.(photo_collections,collection_items,smart_folders)" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" | jq -r '.[] | "  ✓ \(.tablename).\(.indexname)"' || echo "  (Index query not available - using pg_indexes view)"

echo ""
echo ""
echo "=========================================="
echo "✅ ALL TESTS COMPLETE"
echo "=========================================="
