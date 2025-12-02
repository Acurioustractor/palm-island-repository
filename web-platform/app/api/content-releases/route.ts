import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/client';

// Type assertion for new Living Ledger tables (until database types are regenerated)
type SupabaseClientAny = ReturnType<typeof createServerSupabase>;

/**
 * GET /api/content-releases
 * Fetch content releases with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const releaseType = searchParams.get('type');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('content_releases')
      .select('*', { count: 'exact' })
      .order('release_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (releaseType && releaseType !== 'all') {
      query = query.eq('release_type', releaseType);
    }
    if (year) {
      query = query.eq('annual_report_year', parseInt(year));
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching content releases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content releases' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in content releases API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content-releases
 * Create a new content release
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const body = await request.json();

    // Generate slug from title
    const slug = body.release_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const releaseData = {
      release_type: body.release_type,
      release_title: body.release_title,
      release_slug: slug,
      release_date: body.release_date,
      organization_id: body.organization_id,
      service_ids: body.service_ids || [],
      story_ids: body.story_ids || [],
      executive_summary: body.executive_summary,
      community_context: body.community_context,
      impact_highlight: body.impact_highlight,
      looking_ahead: body.looking_ahead,
      cover_image_url: body.cover_image_url,
      annual_report_year: body.annual_report_year || new Date().getFullYear(),
      status: 'draft',
    };

    const { data, error } = await supabase
      .from('content_releases')
      .insert(releaseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating content release:', error);
      return NextResponse.json(
        { error: 'Failed to create content release' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in content releases API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
