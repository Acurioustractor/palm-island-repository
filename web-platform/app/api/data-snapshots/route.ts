import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/client';

/**
 * GET /api/data-snapshots
 * Fetch data snapshots with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const { searchParams } = new URL(request.url);

    const serviceId = searchParams.get('service_id');
    const period = searchParams.get('period');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('data_snapshots')
      .select('*', { count: 'exact' })
      .order('snapshot_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    if (period && period !== 'all') {
      query = query.eq('snapshot_period', period);
    }
    if (dateFrom) {
      query = query.gte('snapshot_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('snapshot_date', dateTo);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching data snapshots:', error);
      return NextResponse.json(
        { error: 'Failed to fetch data snapshots' },
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
    console.error('Error in data snapshots API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data-snapshots
 * Create a new data snapshot
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const body = await request.json();

    const snapshotData = {
      organization_id: body.organization_id,
      snapshot_date: body.snapshot_date,
      snapshot_period: body.snapshot_period,
      service_id: body.service_id,
      service_name: body.service_name,
      metrics: body.metrics || {},
      highlights: body.highlights || [],
      challenges: body.challenges || [],
      community_feedback: body.community_feedback,
      chart_configs: body.chart_configs || [],
    };

    const { data, error } = await supabase
      .from('data_snapshots')
      .insert(snapshotData)
      .select()
      .single();

    if (error) {
      console.error('Error creating data snapshot:', error);
      return NextResponse.json(
        { error: 'Failed to create data snapshot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in data snapshots API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
