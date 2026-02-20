/**
 * Apply the match_content_by_embedding and match_knowledge_entries SQL functions
 * to the Supabase database.
 *
 * Run: npx tsx scripts/apply-match-functions.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase credentials')

const projectRef = 'uaxhjzqrdotoahjnxmbj'

async function runSQL(label: string, sql: string) {
  console.log(`Running: ${label}...`)

  // Try via Supabase Management API
  const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

  if (SUPABASE_ACCESS_TOKEN) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    })
    if (res.ok) {
      console.log(`  ✓ ${label} applied via Management API`)
      return true
    }
    console.log(`  Management API failed: ${res.status}`)
  }

  // Try via pg_net or direct SQL execution through PostgREST rpc
  // Supabase doesn't support DDL via PostgREST, so try the SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  })

  if (res.ok) {
    console.log(`  ✓ ${label} applied via exec_sql RPC`)
    return true
  }

  // Last resort: try pg HTTP API
  const pgRes = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (pgRes.ok) {
    console.log(`  ✓ ${label} applied via pg endpoint`)
    return true
  }

  console.error(`  ✗ ${label} failed. Status: ${res.status}`)
  return false
}

const matchContentFn = `
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
$$;
`

const matchKnowledgeFn = `
CREATE OR REPLACE FUNCTION match_knowledge_entries(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  match_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id text,
  slug text,
  title text,
  summary text,
  content text,
  entry_type text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id::text,
    ke.slug,
    ke.title,
    ke.summary,
    LEFT(ke.content, 1000),
    ke.entry_type,
    ke.category,
    (1 - (ce.embedding <=> query_embedding))::float AS similarity
  FROM content_embeddings ce
  JOIN knowledge_entries ke ON ce.content_type = 'knowledge' AND ce.content_id = ke.id::text
  WHERE (1 - (ce.embedding <=> query_embedding)) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
`

async function main() {
  console.log('Applying vector match functions to Supabase...\n')

  const r1 = await runSQL('match_content_by_embedding', matchContentFn)
  const r2 = await runSQL('match_knowledge_entries', matchKnowledgeFn)

  if (r1 && r2) {
    console.log('\n✓ Both functions applied successfully!')
  } else {
    console.log('\n⚠ Some functions failed. You may need to paste the SQL manually in the Supabase dashboard.')
    console.log('Dashboard URL: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql/new')
  }
}

main().catch(console.error)
