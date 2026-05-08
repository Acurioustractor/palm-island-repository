import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPiccProjects, getPiccProject } from '@/lib/empathy-ledger/el-projects';

export const runtime = 'nodejs'

// Server-side Supabase client with service role (bypasses RLS).
// Still used by POST/PATCH/DELETE (writes to legacy PICC table — Phase 5
// drops those after read migration is verified live).
function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

export async function GET(request: NextRequest) {
  // Phase 1 canonical migration: read projects from Empathy Ledger v2
  // (see thoughts/shared/plans/2026-05-08-el-canonical-migration.md).
  // Response shape preserved as { data: [...] } so existing callers don't
  // break. EL fields are mapped onto the legacy column names callers expect.
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '100');

    let projects;
    if (slug) {
      const single = await getPiccProject(slug);
      projects = single ? [single] : [];
    } else {
      // Map ?status into EL's status filter (active|completed|all). Anything
      // else falls back to 'all' so callers asking for 'planning' / 'on_hold'
      // still get rows; we filter locally below.
      const elStatus =
        status === 'active' || status === 'completed' ? status : 'all';
      projects = await getPiccProjects({ status: elStatus });
      if (status && status !== elStatus) {
        projects = projects.filter((p) => p.status === status);
      }
    }

    const data = projects.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      status: p.status,
      project_type: p.project_type,
      // EL collapses tags + impact_areas into themes[]; expose both for
      // any caller that still differentiates.
      tags: p.themes,
      impact_areas: p.themes,
      hero_image_url: p.cover_image_url,
      location: p.location,
      start_date: p.start_date,
      end_date: p.end_date,
      target_completion_date: p.end_date,
      photo_count: p.photo_count,
      updated_at: p.updated_at,
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 });
    }

    const supabase = getServerClient();
    const body = await request.json();

    // Determine which table to use
    const table = body._table || 'projects';

    const projectData: Record<string, any> = {
      name: body.name,
      slug: body.slug,
      tagline: body.tagline || '',
      description: body.description || '',
      status: body.status || 'planning',
      project_type: body.project_type,
      start_date: body.start_date,
      target_completion_date: body.target_completion_date,
      hero_image_url: body.hero_image_url,
      is_public: body.is_public !== false,
      featured: body.featured === true,
    };

    // Remove undefined values (but keep empty strings for NOT NULL columns)
    Object.keys(projectData).forEach(key => {
      if (projectData[key as keyof typeof projectData] === undefined) {
        delete projectData[key as keyof typeof projectData];
      }
    });

    const { data, error } = await supabase
      .from(table)
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Project insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 });
    }

    const supabase = getServerClient();
    const body = await request.json();
    const { id, _table, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const table = _table || 'projects';

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Project update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 });
    }

    const supabase = getServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const table = searchParams.get('table') || 'projects';

    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
