#!/bin/bash

echo "Checking for available PICC Annual Report PDFs..."
echo ""

for year in {2009..2024}; do
  year1=$year
  year2=$((year + 1))
  short_year2=${year2:2:2}
  url="https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-${year1}-${short_year2}-annual-report.pdf"

  echo -n "Checking ${year1}-${short_year2}: "

  # Check if URL exists
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$status" = "200" ]; then
    echo "✅ FOUND - $url"
  else
    echo "❌ Not found (HTTP $status)"
  fi
done
