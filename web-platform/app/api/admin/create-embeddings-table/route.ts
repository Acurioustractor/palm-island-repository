import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const statements = [
    `CREATE EXTENSION IF NOT EXISTS vector`,
    `CREATE TABLE IF NOT EXISTS content_embeddings (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      content_id text NOT NULL,
      content_type text NOT NULL,
      embedding vector(1536),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(content_id, content_type)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_content_embeddings_type ON content_embeddings(content_type)`,
  ]

  const matchFn = `
    CREATE OR REPLACE FUNCTION match_content_by_embedding(
      query_embedding vector(1536),
      match_threshold float DEFAULT 0.5,
      match_count int DEFAULT 10,
      content_types text[] DEFAULT NULL
    )
    RETURNS TABLE (
      id text,
      type text,
      title text,
      content text,
      summary text,
      similarity float,
      metadata jsonb
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        ce.content_id AS id,
        ce.content_type AS type,
        COALESCE(
          s.title,
          ke.title,
          os.name,
          p.full_name,
          ce.content_type || ':' || ce.content_id
        ) AS title,
        COALESCE(
          LEFT(s.content, 500),
          LEFT(ke.content, 500),
          os.description,
          p.bio,
          ''
        ) AS content,
        COALESCE(s.summary, ke.summary, '') AS summary,
        (1 - (ce.embedding <=> query_embedding))::float AS similarity,
        '{}'::jsonb AS metadata
      FROM content_embeddings ce
      LEFT JOIN stories s ON ce.content_type = 'story' AND ce.content_id = s.id::text
      LEFT JOIN knowledge_entries ke ON ce.content_type = 'knowledge' AND ce.content_id = ke.id::text
      LEFT JOIN organization_services os ON ce.content_type = 'service' AND ce.content_id = os.id::text
      LEFT JOIN profiles p ON ce.content_type = 'person' AND ce.content_id = p.id::text
      WHERE (1 - (ce.embedding <=> query_embedding)) > match_threshold
        AND (content_types IS NULL OR ce.content_type = ANY(content_types))
      ORDER BY ce.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$
  `

  const results: { step: string; ok: boolean; error?: string }[] = []

  for (const sql of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql }) as any
    if (error) {
      // Try alternate approach - direct SQL via pg
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      })
      results.push({ step: sql.substring(0, 60), ok: res.ok, error: res.ok ? undefined : await res.text() })
    } else {
      results.push({ step: sql.substring(0, 60), ok: true })
    }
  }

  // Create the match function
  const { error: fnError } = await supabase.rpc('exec_sql', { sql: matchFn }) as any
  results.push({ step: 'match_content_by_embedding function', ok: !fnError, error: fnError?.message })

  return NextResponse.json({ results })
}
