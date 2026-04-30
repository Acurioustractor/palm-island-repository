/**
 * /api/notify/question-answered — POST handler that fires a GHL webhook
 * when an admin publishes an answer in /picc/voices/questions.
 *
 * Configuration:
 *   GHL_QUESTION_ANSWERED_WEBHOOK_URL  — GoHighLevel inbound webhook URL.
 *                                         When unset, this endpoint is a
 *                                         no-op (returns 204) so the admin
 *                                         flow doesn't fail in dev / when
 *                                         GHL isn't wired yet.
 *
 * Payload to GHL:
 *   {
 *     question_id, question_text, answer_text, topic,
 *     asker_name (or null), answered_at, public_url
 *   }
 *
 * GHL takes care of any downstream actions (newsletter, board digest,
 * notification to a Slack channel, email-the-team, etc.) via its own
 * workflow builder. This endpoint just fires the event.
 *
 * Note: /voices/ask doesn't currently capture asker email — anonymous
 * by default. If PICC adds optional email later, include it in the
 * payload here so GHL can email the asker directly.
 */
import { NextRequest, NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://picc.com.au'

interface NotifyPayload {
  question_id: string
  question_text: string
  answer_text: string
  topic?: string | null
  asker_name?: string | null
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GHL_QUESTION_ANSWERED_WEBHOOK_URL
  if (!webhookUrl) {
    // Graceful no-op when GHL isn't configured
    return new NextResponse(null, { status: 204 })
  }

  let body: NotifyPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!body.question_id || !body.question_text || !body.answer_text) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const payload = {
    event: 'question_answered',
    question_id: body.question_id,
    question_text: body.question_text,
    answer_text: body.answer_text,
    topic: body.topic ?? null,
    asker_name: body.asker_name ?? null,
    answered_at: new Date().toISOString(),
    public_url: `${SITE_URL}/voices/questions`,
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8_000)
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      console.warn('[notify/question-answered] GHL webhook returned', res.status)
      return NextResponse.json({ ok: false, status: res.status }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.warn('[notify/question-answered] GHL webhook failed', err)
    return NextResponse.json({ ok: false, error: 'webhook_failed' }, { status: 502 })
  }
}
