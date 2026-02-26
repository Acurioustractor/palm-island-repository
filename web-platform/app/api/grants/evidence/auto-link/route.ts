import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()
    const { outcomeId } = body

    if (!outcomeId) {
      return NextResponse.json({ error: 'outcomeId is required' }, { status: 400 })
    }

    // Get the outcome details
    const { data: outcome, error: outcomeErr } = await supabase
      .from('grant_outcomes')
      .select('*, service_grants(grant_name, service_id)')
      .eq('id', outcomeId)
      .single()

    if (outcomeErr || !outcome) {
      return NextResponse.json({ error: 'Outcome not found' }, { status: 404 })
    }

    const keywords = extractKeywords(
      `${outcome.outcome_name} ${outcome.outcome_description || ''}`
    )

    const linked: Array<{ type: string; id: string; title: string; score: number }> = []

    // Search stories for matching content
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, content')
      .limit(50)

    for (const story of stories || []) {
      const score = calculateRelevance(
        keywords,
        `${story.title} ${story.content || ''}`
      )
      if (score > 0.3) {
        const { error: linkErr } = await supabase
          .from('evidence_links')
          .insert({
            outcome_id: outcomeId,
            evidence_type: 'story',
            evidence_id: story.id,
            evidence_title: story.title,
            relevance_score: score,
            auto_linked: true,
          })
        if (!linkErr) linked.push({ type: 'story', id: story.id, title: story.title, score })
      }
    }

    // Search quotes
    const { data: quotes } = await supabase
      .from('extracted_quotes')
      .select('id, quote_text, speaker_name')
      .limit(50)

    for (const quote of quotes || []) {
      const score = calculateRelevance(
        keywords,
        `${quote.quote_text} ${quote.speaker_name || ''}`
      )
      if (score > 0.3) {
        const { error: linkErr } = await supabase
          .from('evidence_links')
          .insert({
            outcome_id: outcomeId,
            evidence_type: 'quote',
            evidence_id: quote.id,
            evidence_title: quote.quote_text?.slice(0, 100) || 'Quote',
            relevance_score: score,
            auto_linked: true,
          })
        if (!linkErr) linked.push({ type: 'quote', id: quote.id, title: quote.quote_text?.slice(0, 60) || '', score })
      }
    }

    // Create notification about auto-linking
    if (linked.length > 0) {
      await supabase.from('notifications').insert({
        type: 'grant',
        title: 'Evidence Auto-Linked',
        message: `${linked.length} evidence item(s) auto-linked to outcome: ${outcome.outcome_name}`,
        action_url: '/picc/grants/evidence',
        metadata: { outcomeId, linked_count: linked.length },
      })
    }

    return NextResponse.json({
      success: true,
      linked,
      total: linked.length,
    })
  } catch (err) {
    console.error('Auto-link error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'that', 'this', 'these',
    'those', 'it', 'its', 'not', 'no', 'nor', 'as', 'if', 'then', 'than',
  ])
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
}

function calculateRelevance(keywords: string[], text: string): number {
  const lowerText = text.toLowerCase()
  let matches = 0
  for (const kw of keywords) {
    if (lowerText.includes(kw)) matches++
  }
  return keywords.length > 0 ? Math.min(matches / keywords.length, 0.99) : 0
}
