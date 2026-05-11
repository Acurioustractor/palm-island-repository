/**
 * /api/pencil/queue — read/write the Pencil push queue.
 *
 * The browser drops "push this photo into this Pencil frame" requests
 * here. The Claude Code agent (running with Pencil MCP) processes them
 * by reading this file and calling the MCP `batch_design` operation.
 *
 * Queue file: web-platform/.pencil-push-queue.json
 *
 * GET  → return current queue (pending + processed)
 * POST → append a new push request
 *        body: { nodeId: string, pencilPath: string, label?: string }
 * DELETE → clear processed entries (or all if ?all=true)
 */
import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const QUEUE_PATH = join(process.cwd(), '.pencil-push-queue.json')

interface QueueEntry {
  id: string
  nodeId: string
  pencilPath: string
  label?: string
  status: 'pending' | 'processed' | 'failed'
  queued_at: string
  processed_at?: string
  error?: string
}

interface Queue {
  entries: QueueEntry[]
}

async function loadQueue(): Promise<Queue> {
  if (!existsSync(QUEUE_PATH)) {
    return { entries: [] }
  }
  try {
    const txt = await readFile(QUEUE_PATH, 'utf8')
    return JSON.parse(txt) as Queue
  } catch {
    return { entries: [] }
  }
}

async function saveQueue(queue: Queue): Promise<void> {
  await mkdir(dirname(QUEUE_PATH), { recursive: true })
  await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2))
}

export async function GET() {
  const queue = await loadQueue()
  const pending = queue.entries.filter((e) => e.status === 'pending')
  const processed = queue.entries.filter((e) => e.status === 'processed')
  const failed = queue.entries.filter((e) => e.status === 'failed')
  return NextResponse.json({
    pending,
    processed,
    failed,
    counts: {
      pending: pending.length,
      processed: processed.length,
      failed: failed.length,
      total: queue.entries.length,
    },
  })
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { nodeId?: string; pencilPath?: string; label?: string }
  if (!body.nodeId || !body.pencilPath) {
    return NextResponse.json(
      { error: 'nodeId and pencilPath are required' },
      { status: 400 },
    )
  }

  const queue = await loadQueue()

  // De-dup: if there's already a pending push for this node with the same path, skip
  const existing = queue.entries.find(
    (e) =>
      e.status === 'pending' &&
      e.nodeId === body.nodeId &&
      e.pencilPath === body.pencilPath,
  )
  if (existing) {
    return NextResponse.json({ ok: true, deduped: true, entry: existing })
  }

  // Replace any pending push for the SAME node (keep the latest pick only)
  const cleaned = queue.entries.filter(
    (e) => !(e.status === 'pending' && e.nodeId === body.nodeId),
  )

  const entry: QueueEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nodeId: body.nodeId,
    pencilPath: body.pencilPath,
    label: body.label,
    status: 'pending',
    queued_at: new Date().toISOString(),
  }
  cleaned.push(entry)
  await saveQueue({ entries: cleaned })

  return NextResponse.json({ ok: true, entry })
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const all = url.searchParams.get('all') === 'true'
  const queue = await loadQueue()
  const next: Queue = {
    entries: all ? [] : queue.entries.filter((e) => e.status === 'pending'),
  }
  await saveQueue(next)
  return NextResponse.json({ ok: true, remaining: next.entries.length })
}
