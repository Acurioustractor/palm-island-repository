#!/bin/bash
# Extract embedded photos from PICC annual report PDFs
# Uses pdfimages (poppler) to get actual embedded images, not page renders

PDF_DIR="/Users/benknight/Code/Palm Island Reposistory/web-platform/public/documents/annual-reports"
OUT_DIR="/Users/benknight/Code/Palm Island Reposistory/web-platform/public/annual-report-photos"
MIN_SIZE=5120  # 5KB minimum to filter out icons/decorations
MIN_DIMENSION=100  # minimum width/height in pixels

echo "========================================="
echo "PICC Annual Report Photo Extraction"
echo "========================================="
echo ""

YEARS=(
  "2009-10" "2010-11" "2011-12" "2012-13" "2013-14"
  "2014-15" "2015-16" "2016-17" "2017-18" "2018-19"
  "2019-20" "2020-21" "2021-22" "2022-23" "2023-24"
)

TOTAL_KEPT=0
TOTAL_FILTERED=0

for year in "${YEARS[@]}"; do
  pdf="$PDF_DIR/picc-annual-report-$year.pdf"
  outdir="$OUT_DIR/$year"
  tmpdir="$OUT_DIR/.tmp-$year"

  if [ ! -f "$pdf" ]; then
    echo "SKIP: $year - PDF not found"
    continue
  fi

  mkdir -p "$outdir"
  mkdir -p "$tmpdir"

  # Extract all embedded images to temp dir
  pdfimages -png "$pdf" "$tmpdir/img"

  raw_count=$(ls "$tmpdir"/*.png 2>/dev/null | wc -l | tr -d ' ')
  kept=0
  filtered=0

  for img in "$tmpdir"/*.png; do
    [ -f "$img" ] || continue

    # Check file size
    filesize=$(stat -f%z "$img" 2>/dev/null || stat --printf="%s" "$img" 2>/dev/null)

    if [ "$filesize" -lt "$MIN_SIZE" ]; then
      filtered=$((filtered + 1))
      rm "$img"
      continue
    fi

    # Check dimensions using sips (macOS) - filter very narrow images (borders/lines)
    width=$(sips -g pixelWidth "$img" 2>/dev/null | tail -1 | awk '{print $2}')
    height=$(sips -g pixelHeight "$img" 2>/dev/null | tail -1 | awk '{print $2}')

    if [ -n "$width" ] && [ -n "$height" ]; then
      if [ "$width" -lt "$MIN_DIMENSION" ] || [ "$height" -lt "$MIN_DIMENSION" ]; then
        filtered=$((filtered + 1))
        rm "$img"
        continue
      fi

      # Filter very narrow aspect ratios (likely borders/lines)
      if [ "$width" -gt 0 ] && [ "$height" -gt 0 ]; then
        ratio_w=$((width * 100 / height))
        ratio_h=$((height * 100 / width))
        if [ "$ratio_w" -gt 1500 ] || [ "$ratio_h" -gt 1500 ]; then
          filtered=$((filtered + 1))
          rm "$img"
          continue
        fi
      fi
    fi

    # Keep this image - move to final directory
    basename=$(basename "$img")
    mv "$img" "$outdir/$basename"
    kept=$((kept + 1))
  done

  # Clean up temp dir
  rm -rf "$tmpdir"

  TOTAL_KEPT=$((TOTAL_KEPT + kept))
  TOTAL_FILTERED=$((TOTAL_FILTERED + filtered))

  echo "$year: $raw_count raw → $kept kept, $filtered filtered out"
done

echo ""
echo "========================================="
echo "TOTALS: $TOTAL_KEPT photos kept, $TOTAL_FILTERED filtered out"
echo "========================================="
echo "Output: $OUT_DIR"
