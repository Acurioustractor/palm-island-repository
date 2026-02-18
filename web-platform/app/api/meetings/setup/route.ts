import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

// POST - Create meeting_notes table (dev only)
export async function POST(request: NextRequest) {
  if (!isDev(request)) {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  // Use the Supabase pg_net extension or direct query via PostgREST RPC
  // Since we can't run DDL via PostgREST, we'll use the management API
  const projectRef = url.replace('https://', '').replace('.supabase.co', '')

  // Try via the SQL query endpoint
  try {
    const sql = `
      create table if not exists meeting_notes (
        id uuid primary key default gen_random_uuid(),
        title text not null,
        meeting_date date not null,
        location text default 'Palm Island',
        group_name text default 'Elders Group',
        transcript text,
        summary text,
        key_themes text[] default '{}',
        action_items text[] default '{}',
        attendees text[] default '{}',
        recorded_by text,
        is_public boolean default false,
        is_sensitive boolean default false,
        sensitivity_notes text,
        related_project_slug text,
        media_ids uuid[] default '{}',
        metadata jsonb default '{}',
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
      create index if not exists idx_meeting_notes_date on meeting_notes (meeting_date desc);
      create index if not exists idx_meeting_notes_group on meeting_notes (group_name);
      alter table meeting_notes enable row level security;
      do $$ begin
        create policy "meeting_notes_read" on meeting_notes for select using (true);
      exception when duplicate_object then null;
      end $$;
      do $$ begin
        create policy "meeting_notes_service_all" on meeting_notes for all using (auth.role() = 'service_role');
      exception when duplicate_object then null;
      end $$;
    `;

    // Use the database pooler connection with service role
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' },
    })

    // Try using the pg_net SQL function if available
    const { data, error } = await (supabase as any).rpc('exec_sql', { sql_string: sql })
    if (error && error.code === 'PGRST202') {
      return NextResponse.json({
        error: 'Cannot run DDL via PostgREST. Please run the SQL manually.',
        sql_file: 'supabase/migrations/20260216_meeting_notes.sql',
        dashboard_url: `https://supabase.com/dashboard/project/${projectRef}/sql`,
      }, { status: 422 })
    }
    if (error) throw error

    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    return NextResponse.json({
      error: err?.message || 'Setup failed',
      manual_steps: `Run the SQL at: supabase/migrations/20260216_meeting_notes.sql in https://supabase.com/dashboard/project/${projectRef}/sql`,
    }, { status: 500 })
  }
}
