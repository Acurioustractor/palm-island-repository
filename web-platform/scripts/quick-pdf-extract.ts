/**
 * Quick PDF to Image converter using pdf-to-img
 * This extracts each PDF page as a full image
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import { pdf } from 'pdf-to-img'

config({ path: resolve(__dirname, '../.env.local') })

const PDF_PATH = '/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform/public/documents/annual-reports/picc-annual-report-2009-10.pdf'
const OUTPUT_DIR = '/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform/public/documents/annual-reports/images/2009-10'

async function extractPDFImages() {
  console.log('Extracting images from PDF...')
  console.log('PDF:', PDF_PATH)
  console.log('Output:', OUTPUT_DIR)

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // Convert PDF to images
  const document = await pdf(PDF_PATH, { scale: 2.0 })

  let pageNum = 1
  for await (const image of document) {
    const outputPath = `${OUTPUT_DIR}/page-${String(pageNum).padStart(2, '0')}.jpg`
    await fs.writeFile(outputPath, image)
    console.log(`✅ Saved page ${pageNum}: ${outputPath}`)
    pageNum++
  }

  console.log(`\n✅ Extracted ${pageNum - 1} pages`)
}

extractPDFImages().catch(console.error)
