/**
 * POST /api/atlas/capture/media
 *
 * Lightweight upload endpoint for the atlas capture flow. Accepts a multipart
 * form with `file` (audio or image) and stores it in the `platform-media`
 * Supabase Storage bucket under `atlas-captures/{yyyy-mm}/{uuid}.{ext}`.
 *
 * Returns the public URL — the capture form attaches it to the
 * community_feedback row as a tag (media:<url>) so the inbox reviewer can
 * play the audio or open the photo before approving.
 *
 * No auth: anyone can submit. Storage path includes a random uuid so
 * filenames don't collide. The row stays status='pending' until staff
 * approve in /picc/inbox.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const BUCKET = 'platform-media'
const ALLOWED_MIME = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
])
const MAX_SIZE = 25 * 1024 * 1024 // 25 MB — enough for ~5 min of webm audio or a phone photo

function ext(mime: string): string {
  return (
    {
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
    }[mime] ?? 'bin'
  )
}

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 })
  }
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `mime type not allowed: ${file.type}` },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `file exceeds ${MAX_SIZE / 1024 / 1024} MB` },
      { status: 400 },
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'storage not configured' },
      { status: 500 },
    )
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const today = new Date()
  const month = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`
  const id = crypto.randomUUID()
  const path = `atlas-captures/${month}/${id}.${ext(file.type)}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (upErr) {
    return NextResponse.json(
      { error: upErr.message ?? 'upload failed' },
      { status: 500 },
    )
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({
    ok: true,
    url: pub.publicUrl,
    mime: file.type,
    bytes: file.size,
  })
}

export const dynamic = 'force-dynamic'
