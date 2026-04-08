/**
 * Generate Theory of Change PDF
 * Usage: npx tsx scripts/generate-toc-pdf.ts
 */
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { writeFileSync } from 'fs'
import path from 'path'

async function main() {
  const { default: TheoryOfChangePDF } = await import(
    '../lib/pdf/templates/TheoryOfChangePDF'
  )

  console.log('Generating Theory of Change PDF...')
  const buffer = await renderToBuffer(
    React.createElement(TheoryOfChangePDF) as any
  )

  const outPath = path.join(process.cwd(), 'theory-of-change.pdf')
  writeFileSync(outPath, buffer)
  console.log(`Done — saved to ${outPath}`)
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
