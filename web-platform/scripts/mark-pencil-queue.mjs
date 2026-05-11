#!/usr/bin/env node
/**
 * mark-pencil-queue.mjs — flip queue entries from pending → processed.
 *
 * Usage:
 *   node scripts/mark-pencil-queue.mjs --processed=<id1>,<id2>,...
 *   node scripts/mark-pencil-queue.mjs --all
 *   node scripts/mark-pencil-queue.mjs --failed=<id> --error="..."
 */
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const QUEUE_PATH = join(__dirname, '..', '.pencil-push-queue.json')

const args = process.argv.slice(2)
const processedArg = args.find((a) => a.startsWith('--processed='))
const failedArg = args.find((a) => a.startsWith('--failed='))
const errorArg = args.find((a) => a.startsWith('--error='))
const allFlag = args.includes('--all')

const processedIds = processedArg ? new Set(processedArg.split('=')[1].split(',')) : new Set()
const failedIds = failedArg ? new Set(failedArg.split('=')[1].split(',')) : new Set()
const errorMsg = errorArg ? errorArg.split('=').slice(1).join('=') : undefined

if (!existsSync(QUEUE_PATH)) {
  console.log('Queue empty — nothing to mark.')
  process.exit(0)
}

const data = JSON.parse(await readFile(QUEUE_PATH, 'utf8'))
const now = new Date().toISOString()

let marked = 0
for (const entry of data.entries ?? []) {
  if (entry.status !== 'pending') continue
  if (allFlag || processedIds.has(entry.id)) {
    entry.status = 'processed'
    entry.processed_at = now
    marked++
  } else if (failedIds.has(entry.id)) {
    entry.status = 'failed'
    entry.processed_at = now
    if (errorMsg) entry.error = errorMsg
    marked++
  }
}

await writeFile(QUEUE_PATH, JSON.stringify(data, null, 2))
console.log(`Marked ${marked} entr${marked === 1 ? 'y' : 'ies'}.`)
