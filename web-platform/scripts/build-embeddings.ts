/**
 * Build all embeddings for the Palm AI chat system.
 *
 * Run: npx tsx scripts/build-embeddings.ts
 *
 * Generates OpenAI embeddings for:
 * - Stories, knowledge entries, services, profiles
 * - Interview segments, elder quotes (chunked)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase credentials')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const MODEL = 'text-embedding-3-small'

async function ensureTable() {
  console.log('Ensuring content_embeddings table exists...')

  // Check if table exists by trying a select
  const { error } = await supabase.from('content_embeddings').select('id').limit(1)
  if (!error) {
    console.log('  Table already exists')
    return
  }

  console.log('  Table missing, creating via SQL...')
  // Use Supabase SQL editor API (management API)
  // Since we can't run DDL via PostgREST, we need to create the table
  // via the Supabase Management API
  const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
  const projectRef = 'uaxhjzqrdotoahjnxmbj'

  if (!SUPABASE_ACCESS_TOKEN) {
    console.error('  SUPABASE_ACCESS_TOKEN not set. Please create the table manually:')
    console.error('  Go to https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql/new')
    console.error('  And run the migration in: supabase/migrations/20260219_content_embeddings.sql')
    process.exit(1)
  }

  const sql = `
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE IF NOT EXISTS content_embeddings (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      content_id text NOT NULL,
      content_type text NOT NULL,
      embedding vector(1536),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(content_id, content_type)
    );
    CREATE INDEX IF NOT EXISTS idx_content_embeddings_type ON content_embeddings(content_type);
  `

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    console.error('  Failed to create table:', await res.text())
    process.exit(1)
  }
  console.log('  Table created successfully')
}

async function embed(texts: string[]): Promise<number[][]> {
  const clean = texts.map(t => t.replace(/\s+/g, ' ').trim().substring(0, 8000))
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, input: clean })
  })
  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`)
  const data = await res.json()
  return data.data.map((d: any) => d.embedding)
}

async function upsertEmbeddings(items: { id: string; type: string; embedding: number[] }[]) {
  for (const item of items) {
    const { error } = await supabase
      .from('content_embeddings')
      .upsert({
        content_id: item.id,
        content_type: item.type,
        embedding: item.embedding,
        updated_at: new Date().toISOString()
      }, { onConflict: 'content_id,content_type' })
    if (error) console.error(`  Error upserting ${item.type}/${item.id}:`, error.message)
  }
}

async function processBatch(
  label: string,
  items: { id: string; text: string }[],
  contentType: string
) {
  if (items.length === 0) {
    console.log(`  ${label}: 0 items, skipping`)
    return
  }
  console.log(`  ${label}: ${items.length} items`)

  const BATCH = 20
  let done = 0
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH)
    const texts = batch.map(b => b.text)
    try {
      const embeddings = await embed(texts)
      await upsertEmbeddings(batch.map((b, idx) => ({
        id: b.id,
        type: contentType,
        embedding: embeddings[idx]
      })))
      done += batch.length
      process.stdout.write(`    ${done}/${items.length}\r`)
    } catch (err: any) {
      console.error(`    Batch error at ${i}: ${err.message}`)
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 200))
  }
  console.log(`    ${label}: ${done} embedded`)
}

async function main() {
  console.log('Building embeddings for Palm AI...\n')

  await ensureTable()

  // 1. Stories
  console.log('1. Stories')
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, content, summary')
    .eq('is_public', true)
  await processBatch('stories', (stories || []).map((s: any) => ({
    id: s.id,
    text: `${s.title}. ${s.summary || ''} ${(s.content || '').substring(0, 4000)}`
  })), 'story')

  // 2. Knowledge entries
  console.log('2. Knowledge entries')
  const { data: knowledge } = await supabase
    .from('knowledge_entries')
    .select('id, title, content, summary')
    .eq('is_public', true)
  await processBatch('knowledge', (knowledge || []).map((k: any) => ({
    id: k.id,
    text: `${k.title}. ${k.summary || ''} ${(k.content || '').substring(0, 4000)}`
  })), 'knowledge')

  // 3. Services
  console.log('3. Services')
  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, description, service_category')
    .eq('is_active', true)
  await processBatch('services', (services || []).map((s: any) => ({
    id: s.id,
    text: `${s.name}. ${s.description || ''} Category: ${s.service_category || ''}`
  })), 'service')

  // 4. Profiles/People
  console.log('4. Profiles')
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, bio, preferred_name, community_role, is_elder, expertise_areas')
  await processBatch('profiles', (profiles || []).filter((p: any) => p.full_name).map((p: any) => ({
    id: p.id,
    text: `${p.full_name}${p.preferred_name ? ` (${p.preferred_name})` : ''}. ${p.community_role ? `Role: ${p.community_role}. ` : ''}${p.is_elder ? 'Elder. ' : ''}${p.bio || ''}${p.expertise_areas ? ` Expertise: ${p.expertise_areas}` : ''}`
  })), 'person')

  // 5. Interview segments (chunked — group by interview)
  console.log('5. Interview segments')
  const { data: interviews } = await supabase
    .from('interviews')
    .select('id, interview_title, storyteller_id')
  const { data: segments } = await supabase
    .from('interview_segments')
    .select('id, interview_id, segment_text')

  if (interviews && segments) {
    // Group segments by interview, chunk into ~2000 char blocks
    const interviewMap = new Map(interviews.map((i: any) => [i.id, i]))
    const chunked: { id: string; text: string }[] = []

    const byInterview = new Map<string, any[]>()
    for (const seg of segments) {
      const list = byInterview.get(seg.interview_id) || []
      list.push(seg)
      byInterview.set(seg.interview_id, list)
    }

    for (const [interviewId, segs] of byInterview) {
      const interview = interviewMap.get(interviewId) as any
      const title = interview?.interview_title || 'Interview'
      let chunk = `Interview: ${title}.\n`
      let chunkIdx = 0

      for (const seg of segs) {
        if (chunk.length + (seg.segment_text || '').length > 2000) {
          chunked.push({ id: `${interviewId}_chunk_${chunkIdx}`, text: chunk })
          chunkIdx++
          chunk = `Interview: ${title} (continued).\n`
        }
        chunk += (seg.segment_text || '') + '\n'
      }
      if (chunk.length > 50) {
        chunked.push({ id: `${interviewId}_chunk_${chunkIdx}`, text: chunk })
      }
    }
    await processBatch('interview chunks', chunked, 'interview')
  }

  // 6. Elder quotes
  console.log('6. Elder quotes')
  const { data: quotes } = await supabase
    .from('elder_quotes')
    .select('id, text, speaker_name, speaker_role, theme, category')
  await processBatch('elder quotes', (quotes || []).filter((q: any) => q.text).map((q: any) => ({
    id: q.id,
    text: `"${q.text}" — ${q.speaker_name || 'Elder'}${q.speaker_role ? ` (${q.speaker_role})` : ''}. ${q.theme || ''} ${q.category || ''}`
  })), 'quote')

  // 7. Governance achievements
  console.log('7. Governance achievements')
  const { data: achievements } = await supabase
    .from('governance_achievements')
    .select('id, achievement_text, category, fiscal_year')
  await processBatch('achievements', (achievements || []).map((a: any) => ({
    id: a.id,
    text: `Achievement (FY${a.fiscal_year || 'N/A'}, ${a.category || 'general'}): ${a.achievement_text}`
  })), 'achievement')

  // 8. Annual financials
  console.log('8. Annual financials')
  const { data: financials } = await supabase
    .from('annual_financials')
    .select('*')
  await processBatch('financials', (financials || []).map((f: any) => {
    const fmt = (n: number) => `$${(n / 1000000).toFixed(2)}M`
    return {
      id: f.id,
      text: `PICC Financials FY${f.fiscal_year}: Total income ${fmt(f.total_income || 0)}, Labour costs ${fmt(f.labour_costs || 0)}, Assets ${fmt((f.current_assets || 0) + (f.non_current_assets || 0))}.${f.audited ? ' Audited.' : ''}`
    }
  }), 'financial')

  console.log('\nDone! Checking final counts...')
  const { data: final } = await supabase.from('content_embeddings').select('content_type')
  if (final) {
    const counts: Record<string, number> = {}
    for (const row of final) {
      counts[row.content_type] = (counts[row.content_type] || 0) + 1
    }
    console.log('\nEmbeddings by type:')
    for (const [type, count] of Object.entries(counts).sort()) {
      console.log(`  ${type}: ${count}`)
    }
    console.log(`  TOTAL: ${final.length}`)
  }
}

main().catch(console.error)
