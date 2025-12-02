#!/bin/bash

cd "/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform"

SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d"=" -f2)

echo "=== Checking System Smart Folders ==="
echo ""

curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/smart_folders?select=name,slug,icon,color,is_system&is_system=eq.true&order=name" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY"

echo ""
echo ""
echo "=== Checking Collections Count ==="
echo ""

curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/photo_collections?select=id&limit=1" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep -i content-range
