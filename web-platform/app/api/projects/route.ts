import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'

// Server-side Supabase client with service role (bypasses RLS)
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
  try {
    const supabase = getServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '100');

    // First try 'projects' table, then 'innovation_projects' if that fails
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (slug) {
      query = query.eq('slug', slug);
    }
    if (status) {
      query = query.eq('status', status);
    }

    let { data, error } = await query;

    // If projects table doesn't exist, try innovation_projects
    if (error && (error.code === 'PGRST205' || error.message.includes('does not exist'))) {
      let innovationQuery = supabase
        .from('innovation_projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (slug) {
        innovationQuery = innovationQuery.eq('slug', slug);
      }
      if (status) {
        innovationQuery = innovationQuery.eq('status', status);
      }

      const innovationResult = await innovationQuery;
      data = innovationResult.data;
      error = innovationResult.error;
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
