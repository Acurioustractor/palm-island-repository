import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/client';

/**
 * GET /api/conversations
 * Fetch community conversations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('community_conversations')
      .select('*', { count: 'exact' })
      .order('session_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (type && type !== 'all') {
      query = query.eq('conversation_type', type);
    }
    if (year) {
      query = query.eq('report_year', parseInt(year));
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
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
    console.error('Error in conversations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new community conversation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const body = await request.json();

    const conversationData = {
      conversation_title: body.conversation_title,
      conversation_type: body.conversation_type,
      session_date: body.session_date,
      session_start_time: body.session_start_time,
      session_end_time: body.session_end_time,
      location: body.location,
      location_details: body.location_details,
      facilitator_ids: body.facilitator_ids || [],
      organization_id: body.organization_id,
      service_ids: body.service_ids || [],
      report_year: body.report_year || new Date().getFullYear(),
      questions_posed: body.questions_posed || [],
      agenda: body.agenda,
      elder_present: body.elder_present || false,
      cultural_protocols_followed: body.cultural_protocols_followed ?? true,
      status: 'planned',
    };

    const { data, error } = await supabase
      .from('community_conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
