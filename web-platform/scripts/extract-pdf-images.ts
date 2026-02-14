/**
 * Extract images from historical PICC annual report PDFs.
 *
 * Uses `pdfimages` (poppler) to pull embedded images, then `magick` (ImageMagick)
 * to resize/crop them. Uploads to Supabase storage and creates media_files entries
 * tagged with the correct fiscal year.
 *
 * Requirements (brew install):
 *   - poppler (provides pdfimages)
 *   - imagemagick (provides magick)
 *
 * Usage:
 *   npx tsx scripts/extract-pdf-images.ts                     # all PDFs
 *   npx tsx scripts/extract-pdf-images.ts --year 2023-24      # single year
 *   npx tsx scripts/extract-pdf-images.ts --dry-run            # preview only
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'story-media';

const PDF_DIR = path.join(__dirname, '../../annual-reports/source-pdfs');
const TMP_DIR = path.join(__dirname, '../.tmp-pdf-images');

// Minimum dimensions — skip tiny icons/logos
const MIN_WIDTH = 150;
const MIN_HEIGHT = 150;

// Max output dimension
const MAX_DIM = 1600;

interface ExtractedImage {
  sourcePdf: string;
  fyLabel: string;
  pageNum: number;
  imgIndex: number;
  localPath: string;
  width: number;
  height: number;
}

function getFyLabel(filename: string): string | null {
  const match = filename.match(/(\d{4}-\d{2})/);
  return match ? match[1] : null;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getImageDimensions(filepath: string): { width: number; height: number } {
  try {
    const output = execSync(`magick identify -format "%w %h" "${filepath}"`, {
      encoding: 'utf8',
      timeout: 10000,
    }).trim();
    const [w, h] = output.split(' ').map(Number);
    return { width: w || 0, height: h || 0 };
  } catch {
    return { width: 0, height: 0 };
  }
}

function resizeImage(input: string, output: string): boolean {
  try {
    execSync(
      `magick "${input}" -resize "${MAX_DIM}x${MAX_DIM}>" -quality 85 "${output}"`,
      { timeout: 30000 }
    );
    return true;
  } catch (e) {
    console.error(`  Failed to resize ${input}:`, e);
    return false;
  }
}

function extractImagesFromPdf(pdfPath: string, outputDir: string): string[] {
  ensureDir(outputDir);
  try {
    // Extract all embedded images as PNG
    execSync(`pdfimages -png "${pdfPath}" "${outputDir}/img"`, { timeout: 120000 });
  } catch (e) {
    console.error(`  pdfimages failed for ${pdfPath}:`, e);
    return [];
  }

  // List extracted files
  return fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.png') || f.endsWith('.ppm') || f.endsWith('.jpg'))
    .map(f => path.join(outputDir, f))
    .sort();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const yearFlag = args.indexOf('--year');
  const targetYear = yearFlag >= 0 ? args[yearFlag + 1] : null;

  console.log('=== PICC Annual Report Image Extractor ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  if (targetYear) console.log(`Target year: ${targetYear}`);

  // Find PDFs
  const pdfFiles = fs.readdirSync(PDF_DIR)
    .filter(f => f.endsWith('.pdf'))
    .filter(f => {
      if (!targetYear) return true;
      return f.includes(targetYear);
    })
    .sort();

  console.log(`\nFound ${pdfFiles.length} PDF(s) to process`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Clean tmp dir
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true });
  }
  ensureDir(TMP_DIR);

  let totalExtracted = 0;
  let totalUploaded = 0;
  let totalSkipped = 0;

  for (const pdfFile of pdfFiles) {
    const fyLabel = getFyLabel(pdfFile);
    if (!fyLabel) {
      console.log(`\nSkipping ${pdfFile} — no FY label found`);
      continue;
    }

    console.log(`\n--- Processing: ${pdfFile} (FY ${fyLabel}) ---`);

    const pdfPath = path.join(PDF_DIR, pdfFile);
    const pdfTmpDir = path.join(TMP_DIR, fyLabel);
    const resizedDir = path.join(pdfTmpDir, 'resized');
    ensureDir(resizedDir);

    // Extract raw images
    const rawImages = extractImagesFromPdf(pdfPath, pdfTmpDir);
    console.log(`  Extracted ${rawImages.length} raw images`);
    totalExtracted += rawImages.length;

    // Filter and resize
    const validImages: ExtractedImage[] = [];
    for (let i = 0; i < rawImages.length; i++) {
      const rawPath = rawImages[i];
      const dims = getImageDimensions(rawPath);

      if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
        totalSkipped++;
        continue;
      }

      const outName = `annual-report-${fyLabel}-img-${String(i).padStart(3, '0')}.jpg`;
      const outPath = path.join(resizedDir, outName);

      if (!dryRun) {
        const ok = resizeImage(rawPath, outPath);
        if (!ok) {
          totalSkipped++;
          continue;
        }
      }

      const finalDims = dryRun ? dims : getImageDimensions(outPath);

      validImages.push({
        sourcePdf: pdfFile,
        fyLabel,
        pageNum: 0,
        imgIndex: i,
        localPath: outPath,
        width: finalDims.width,
        height: finalDims.height,
      });
    }

    console.log(`  Valid images (>= ${MIN_WIDTH}x${MIN_HEIGHT}): ${validImages.length}`);
    console.log(`  Skipped (too small): ${rawImages.length - validImages.length}`);

    if (dryRun) {
      validImages.forEach(img => {
        console.log(`    ${path.basename(img.localPath)} — ${img.width}x${img.height}`);
      });
      continue;
    }

    // Upload to Supabase
    for (const img of validImages) {
      const filename = path.basename(img.localPath);
      const storagePath = `annual-reports/${img.fyLabel}/${filename}`;

      try {
        const fileBuffer = fs.readFileSync(img.localPath);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`  Upload failed for ${filename}:`, uploadError.message);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

        // Check if media_files entry already exists
        const { data: existing } = await supabase
          .from('media_files')
          .select('id')
          .eq('filename', filename)
          .maybeSingle();

        if (existing) {
          console.log(`  Already exists: ${filename}`);
          totalSkipped++;
          continue;
        }

        // Insert media_files record
        const { error: insertError } = await supabase.from('media_files').insert({
          filename,
          file_path: storagePath,
          bucket_name: BUCKET,
          public_url: urlData.publicUrl,
          mime_type: 'image/jpeg',
          file_type: 'image',
          width: img.width,
          height: img.height,
          is_public: true,
          tags: [
            'annual-report',
            `fy:${img.fyLabel}`,
            'pdf-extract',
          ],
          alt_text: `Image from PICC Annual Report ${img.fyLabel}`,
        });

        if (insertError) {
          console.error(`  DB insert failed for ${filename}:`, insertError.message);
          continue;
        }

        totalUploaded++;
        console.log(`  Uploaded: ${filename} (${img.width}x${img.height})`);
      } catch (e) {
        console.error(`  Error processing ${filename}:`, e);
      }
    }
  }

  // Cleanup tmp
  if (!dryRun && fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true });
  }

  console.log('\n=== Summary ===');
  console.log(`PDFs processed: ${pdfFiles.length}`);
  console.log(`Images extracted: ${totalExtracted}`);
  console.log(`Images uploaded: ${totalUploaded}`);
  console.log(`Images skipped: ${totalSkipped}`);
}

main().catch(console.error);
