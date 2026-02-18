#!/usr/bin/env python3
"""Extract embedded photos from PICC annual report PDFs using pdfimages (poppler)."""

import subprocess
import os
import shutil

PDF_DIR = "/Users/benknight/Code/Palm Island Reposistory/web-platform/public/documents/annual-reports"
OUT_DIR = "/Users/benknight/Code/Palm Island Reposistory/web-platform/public/annual-report-photos"
MIN_SIZE = 5120  # 5KB
MIN_DIMENSION = 100  # pixels

YEARS = [
    "2009-10", "2010-11", "2011-12", "2012-13", "2013-14",
    "2014-15", "2015-16", "2016-17", "2017-18", "2018-19",
    "2019-20", "2020-21", "2021-22", "2022-23", "2023-24",
]

print("=========================================")
print("PICC Annual Report Photo Extraction")
print("=========================================")
print()

total_kept = 0
total_filtered = 0

for year in YEARS:
    pdf = os.path.join(PDF_DIR, f"picc-annual-report-{year}.pdf")
    outdir = os.path.join(OUT_DIR, year)
    tmpdir = os.path.join(OUT_DIR, f".tmp-{year}")

    if not os.path.exists(pdf):
        print(f"SKIP: {year} - PDF not found")
        continue

    os.makedirs(outdir, exist_ok=True)
    os.makedirs(tmpdir, exist_ok=True)

    # Extract all embedded images
    subprocess.run(
        ["pdfimages", "-png", pdf, os.path.join(tmpdir, "img")],
        check=True, capture_output=True
    )

    raw_files = [f for f in os.listdir(tmpdir) if f.endswith(".png")]
    raw_count = len(raw_files)
    kept = 0
    filtered = 0

    for fname in raw_files:
        fpath = os.path.join(tmpdir, fname)
        filesize = os.path.getsize(fpath)

        if filesize < MIN_SIZE:
            filtered += 1
            os.remove(fpath)
            continue

        # Check dimensions using sips (macOS)
        try:
            w_out = subprocess.run(
                ["sips", "-g", "pixelWidth", fpath],
                capture_output=True, text=True
            ).stdout.strip().split("\n")[-1].split()[-1]
            h_out = subprocess.run(
                ["sips", "-g", "pixelHeight", fpath],
                capture_output=True, text=True
            ).stdout.strip().split("\n")[-1].split()[-1]
            width = int(w_out)
            height = int(h_out)

            if width < MIN_DIMENSION or height < MIN_DIMENSION:
                filtered += 1
                os.remove(fpath)
                continue

            # Filter extreme aspect ratios (borders/lines)
            if width > 0 and height > 0:
                ratio = max(width / height, height / width)
                if ratio > 15:
                    filtered += 1
                    os.remove(fpath)
                    continue
        except (ValueError, IndexError):
            pass  # Keep if we can't check dimensions

        # Keep - move to final directory
        shutil.move(fpath, os.path.join(outdir, fname))
        kept += 1

    # Clean up temp dir
    shutil.rmtree(tmpdir, ignore_errors=True)

    total_kept += kept
    total_filtered += filtered
    print(f"{year}: {raw_count} raw -> {kept} kept, {filtered} filtered out")

print()
print("=========================================")
print(f"TOTALS: {total_kept} photos kept, {total_filtered} filtered out")
print("=========================================")
print(f"Output: {OUT_DIR}")
