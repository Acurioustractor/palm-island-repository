#!/bin/bash

cd "/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform"

SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d"=" -f2)

echo "=== Verifying Collections & Smart Folders Tables ==="
echo ""

echo "📁 photo_collections table:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections?limit=0" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range

echo ""
echo "🔗 collection_items table:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/collection_items?limit=0" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range

echo ""
echo "⚡ smart_folders table:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/smart_folders?limit=0" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range

echo ""
echo "=== System Smart Folders (should have 6) ==="
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/smart_folders?select=name,slug,icon,color&is_system=eq.true&order=name" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" | jq -r '.[] | "  ✓ \(.name) (\(.icon))"'

echo ""
echo "✅ Verification complete!"
