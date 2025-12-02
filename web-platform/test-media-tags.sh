#!/bin/bash

cd "/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform"

ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d"=" -f2)

echo "=== Media Files Tags Analysis ==="
echo ""

echo "Total media files:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/media_files?select=id&deleted_at=is.null&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep content-range

echo ""
echo "Files with tags:"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/media_files?select=id&deleted_at=is.null&tags=not.is.null&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep content-range

echo ""
echo "Sample 10 files (showing tags):"
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/media_files?select=id,filename,tags,quality_score&deleted_at=is.null&limit=10" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.[] | {filename: .filename[0:30], tags, quality_score}'

echo ""
echo "Files uploaded this month:"
MONTH_START=$(date -u +"%Y-%m-01T00:00:00Z")
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/media_files?select=id&deleted_at=is.null&created_at=gte.$MONTH_START&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" \
  -I 2>/dev/null | grep content-range
