import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const supabase = getServerClient();
    const body = await request.json();

    // Determine which table to use
    const table = body._table || 'projects';

    const projectData = {
      name: body.name || body.title,
      title: body.title || body.name,
      slug: body.slug,
      description: body.description,
      status: body.status || 'planning',
      project_type: body.project_type,
      lead_organization_id: body.lead_organization_id || process.env.NEXT_PUBLIC_ORGANIZATION_ID,
      start_date: body.start_date,
      target_completion_date: body.target_completion_date,
      actual_completion_date: body.actual_completion_date,
      cover_image_url: body.cover_image_url,
      objectives: body.objectives,
      outcomes: body.outcomes,
      impact_metrics: body.impact_metrics,
      team_members: body.team_members,
      partners: body.partners,
      budget_allocated: body.budget_allocated,
      funding_sources: body.funding_sources,
      is_public: body.is_public !== false,
      is_featured: body.is_featured || false,
      tags: body.tags || [],
    };

    // Remove undefined values
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
