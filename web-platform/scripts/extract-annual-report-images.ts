/**
 * PDF Image Extraction Script
 *
 * Extracts all images from PICC annual report PDFs and saves them with metadata.
 * Images are organized by year and tagged for import into the media library.
 */

import { config } from 'dotenv'
import { resolve, join, dirname } from 'path'
import { promises as fs } from 'fs'
import { createWriteStream } from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createHash } from 'crypto'
import sharp from 'sharp'

config({ path: resolve(__dirname, '../.env.local') })

// ============================================================================
// Configuration
// ============================================================================

const PDF_DIR = resolve(__dirname, '../public/documents/annual-reports')
const OUTPUT_DIR = resolve(__dirname, '../public/documents/annual-reports/images')
const METADATA_FILE = resolve(__dirname, '../public/documents/annual-reports/images-metadata.json')

// Minimum image size to extract (skip tiny logos/icons)
const MIN_IMAGE_WIDTH = 100
const MIN_IMAGE_HEIGHT = 100

// Image formats to extract
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg']

// ============================================================================
// Types
// ============================================================================

interface ImageMetadata {
  id: string
  fiscalYear: string
  pdfPath: string
  pageNumber: number
  imageIndex: number
  fileName: string
  filePath: string
  width: number
  height: number
  format: string
  fileSize: number
  hash: string
  extractedAt: string
  knowledgeEntrySlug: string
}

interface ExtractionResult {
  totalPDFs: number
  totalImages: number
  totalSize: number
  byYear: Record<string, number>
  errors: string[]
}

// ============================================================================
// Helper Functions
// ============================================================================

function log(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`, data || '')
}

function error(message: string, err?: any) {
  console.error(`❌ ERROR: ${message}`, err || '')
}

/**
 * Get fiscal year from filename
 * Examples: picc-annual-report-2023-24.pdf -> "2023-24"
 */
function getFiscalYearFromFilename(filename: string): string | null {
  const match = filename.match(/(\d{4})-(\d{2})/)
  if (match) {
    return `${match[1]}-${match[2]}`
  }
  return null
}

/**
 * Generate knowledge entry slug from fiscal year
 */
function getKnowledgeEntrySlug(fiscalYear: string): string {
  return `picc-annual-report-${fiscalYear}-full-pdf`
}

/**
 * Calculate hash of image data for deduplication
 */
function calculateHash(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex').substring(0, 16)
}

/**
 * Ensure directory exists
 */
async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (err: any) {
    if (err.code !== 'EEXIST') throw err
  }
}

/**
 * Format file size in human-readable format
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ============================================================================
// PDF Image Extraction
// ============================================================================

/**
 * Extract images from a single PDF page
 */
async function extractImagesFromPage(
  page: any,
  pageNumber: number,
  fiscalYear: string,
  pdfFilename: string,
  yearDir: string,
  seenHashes: Set<string>
): Promise<ImageMetadata[]> {
  const images: ImageMetadata[] = []

  try {
    const operatorList = await page.getOperatorList()
    const ops = operatorList.fnArray
    const args = operatorList.argsArray

    let imageIndex = 0

    for (let i = 0; i < ops.length; i++) {
      // Check for image operators
      if (ops[i] === pdfjsLib.OPS.paintImageXObject || ops[i] === pdfjsLib.OPS.paintJpegXObject) {
        try {
          const imageName = args[i][0]
          const image = await page.objs.get(imageName)

          if (!image) continue

          // Check if image meets minimum size requirements
          if (image.width < MIN_IMAGE_WIDTH || image.height < MIN_IMAGE_HEIGHT) {
            log(`  Skipping small image: ${image.width}x${image.height}`)
            continue
          }

          // Convert image data to buffer
          let imageBuffer: Buffer

          if (image.data && image.data.buffer) {
            // Raw image data
            imageBuffer = Buffer.from(image.data.buffer)
          } else if (image.bitmap) {
            imageBuffer = Buffer.from(image.bitmap.buffer)
          } else {
            log(`  Unable to extract image data for ${imageName}`)
            continue
          }

          // Calculate hash for deduplication
          const hash = calculateHash(imageBuffer)
          if (seenHashes.has(hash)) {
            log(`  Skipping duplicate image (hash: ${hash})`)
            continue
          }
          seenHashes.add(hash)

          // Determine format and convert if needed
          let format = 'jpeg'
          let outputBuffer = imageBuffer

          try {
            // Use sharp to process and optimize the image
            const sharpImage = sharp(imageBuffer)
            const metadata = await sharpImage.metadata()

            // Convert to JPEG if not already
            if (metadata.format !== 'jpeg' && metadata.format !== 'jpg') {
              outputBuffer = await sharpImage.jpeg({ quality: 90 }).toBuffer()
              format = 'jpeg'
            }
          } catch (sharpErr) {
            log(`  Warning: Could not process image with sharp, using raw data`)
          }

          // Generate filename
          const fileName = `page-${pageNumber.toString().padStart(2, '0')}-img-${imageIndex.toString().padStart(2, '0')}.jpg`
          const filePath = join(yearDir, fileName)

          // Save image
          await fs.writeFile(filePath, outputBuffer)

          const stats = await fs.stat(filePath)

          // Create metadata
          const metadata: ImageMetadata = {
            id: `${fiscalYear}-p${pageNumber}-i${imageIndex}`,
            fiscalYear,
            pdfPath: `/documents/annual-reports/${pdfFilename}`,
            pageNumber,
            imageIndex,
            fileName,
            filePath: `/documents/annual-reports/images/${fiscalYear}/${fileName}`,
            width: image.width,
            height: image.height,
            format,
            fileSize: stats.size,
            hash,
            extractedAt: new Date().toISOString(),
            knowledgeEntrySlug: getKnowledgeEntrySlug(fiscalYear)
          }

          images.push(metadata)
          imageIndex++

          log(`    ✅ Extracted: ${fileName} (${image.width}x${image.height}, ${formatSize(stats.size)})`)
        } catch (imgErr) {
          error(`    Failed to extract image from page ${pageNumber}:`, imgErr)
        }
      }
    }
  } catch (pageErr) {
    error(`  Failed to process page ${pageNumber}:`, pageErr)
  }

  return images
}

/**
 * Extract images from a single PDF file
 */
async function extractImagesFromPDF(
  pdfPath: string,
  fiscalYear: string,
  seenHashes: Set<string>
): Promise<ImageMetadata[]> {
  const allImages: ImageMetadata[] = []
  const pdfFilename = pdfPath.split('/').pop() || ''

  log(`\n📄 Processing: ${pdfFilename} (${fiscalYear})`)

  try {
    // Create output directory for this year
    const yearDir = join(OUTPUT_DIR, fiscalYear)
    await ensureDir(yearDir)

    // Load PDF
    const buffer = await fs.readFile(pdfPath)
    const data = new Uint8Array(buffer)  // Convert Buffer to Uint8Array
    const loadingTask = pdfjsLib.getDocument({ data })
    const pdfDoc = await loadingTask.promise

    log(`  Pages: ${pdfDoc.numPages}`)

    // Extract images from each page
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      const images = await extractImagesFromPage(
        page,
        pageNum,
        fiscalYear,
        pdfFilename,
        yearDir,
        seenHashes
      )

      allImages.push(...images)
    }

    log(`  ✅ Extracted ${allImages.length} images from ${pdfDoc.numPages} pages`)
  } catch (err) {
    error(`  Failed to process PDF: ${pdfFilename}`, err)
    throw err
  }

  return allImages
}

// ============================================================================
// Main Extraction Function
// ============================================================================

async function main() {
  log('🚀 Starting Annual Report Image Extraction')
  log(`PDF Directory: ${PDF_DIR}`)
  log(`Output Directory: ${OUTPUT_DIR}`)
  log('')

  // Ensure output directory exists
  await ensureDir(OUTPUT_DIR)

  // Find all PDF files
  const files = await fs.readdir(PDF_DIR)
  const pdfFiles = files.filter(f => f.endsWith('.pdf') && f.startsWith('picc-annual-report-'))

  log(`Found ${pdfFiles.length} annual report PDFs`)
  log('')

  const result: ExtractionResult = {
    totalPDFs: 0,
    totalImages: 0,
    totalSize: 0,
    byYear: {},
    errors: []
  }

  const allMetadata: ImageMetadata[] = []
  const seenHashes = new Set<string>()

  // Process each PDF
  for (const pdfFile of pdfFiles) {
    const fiscalYear = getFiscalYearFromFilename(pdfFile)

    if (!fiscalYear) {
      log(`⚠️  Skipping ${pdfFile}: Could not determine fiscal year`)
      result.errors.push(`Could not determine fiscal year for ${pdfFile}`)
      continue
    }

    try {
      const pdfPath = join(PDF_DIR, pdfFile)
      const images = await extractImagesFromPDF(pdfPath, fiscalYear, seenHashes)

      allMetadata.push(...images)
      result.totalPDFs++
      result.totalImages += images.length
      result.byYear[fiscalYear] = images.length

      // Calculate total size
      for (const img of images) {
        result.totalSize += img.fileSize
      }
    } catch (err: any) {
      error(`Failed to process ${pdfFile}`, err)
      result.errors.push(`Failed to process ${pdfFile}: ${err.message}`)
    }
  }

  // Save metadata to JSON file
  log('\n💾 Saving metadata...')
  await fs.writeFile(METADATA_FILE, JSON.stringify(allMetadata, null, 2))
  log(`Metadata saved to: ${METADATA_FILE}`)

  // Print summary
  log('\n' + '='.repeat(60))
  log('📊 EXTRACTION COMPLETE - SUMMARY')
  log('='.repeat(60))
  log(`PDFs Processed: ${result.totalPDFs}`)
  log(`Total Images: ${result.totalImages}`)
  log(`Total Size: ${formatSize(result.totalSize)}`)
  log('')
  log('Images by Year:')
  Object.entries(result.byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([year, count]) => {
      log(`  ${year}: ${count} images`)
    })

  if (result.errors.length > 0) {
    log('')
    log('⚠️  Errors:')
    result.errors.forEach(err => log(`  - ${err}`))
  }

  log('\n✅ Extraction complete!')
  log('')
  log('Next steps:')
  log('1. Review extracted images in: ' + OUTPUT_DIR)
  log('2. Run import script to add images to media library')
  log('3. Create "Annual Reports Images" collection')
}

// ============================================================================
// Run
// ============================================================================

main()
  .then(() => process.exit(0))
  .catch(err => {
    error('Fatal error', err)
    process.exit(1)
  })
