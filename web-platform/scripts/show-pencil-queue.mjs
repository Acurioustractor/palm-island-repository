#!/usr/bin/env node
/**
 * show-pencil-queue.mjs — print the pending Pencil push queue in a
 * format the Claude Code agent can copy into a single batch_design call.
 *
 * Usage: node scripts/show-pencil-queue.mjs
 *
 * Output:
 *   - Pretty list of pending entries
 *   - A ready-to-paste `batch_design` input string
 *
 * The agent then runs the batch_design call against picc-annual-report.pen
 * and marks the queue as processed via:
 *   node scripts/mark-pencil-queue.mjs --processed=<id1>,<id2>,...
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const QUEUE_PATH = join(__dirname, '..', '.pencil-push-queue.json')

if (!existsSync(QUEUE_PATH)) {
  console.log('Queue empty — no .pencil-push-queue.json found.')
  process.exit(0)
}

const data = JSON.parse(await readFile(QUEUE_PATH, 'utf8'))
const pending = (data.entries ?? []).filter((e) => e.status === 'pending')
const processed = (data.entries ?? []).filter((e) => e.status === 'processed')

console.log(`Queue: ${pending.length} pending · ${processed.length} processed`)
console.log()

if (pending.length === 0) {
  console.log('Nothing to do.')
  process.exit(0)
}

console.log('=== PENDING PUSHES ===')
for (const e of pending) {
  console.log(`  ${e.nodeId.padEnd(8)} ← ${e.pencilPath}`)
  if (e.label) console.log(`    ${e.label}`)
  console.log(`    queued_at: ${e.queued_at} · id: ${e.id}`)
}

console.log()
console.log('=== READY-TO-PASTE batch_design INPUT ===')
console.log()
const ops = pending.map(
  (e) =>
    `U("${e.nodeId}",{fill:{type:"image",mode:"fill",enabled:true,url:"${e.pencilPath}"}})`,
)
console.log(ops.join('\n'))

console.log()
console.log('=== AFTER APPLYING, MARK PROCESSED ===')
console.log()
console.log(`node scripts/mark-pencil-queue.mjs --processed=${pending.map((e) => e.id).join(',')}`)
