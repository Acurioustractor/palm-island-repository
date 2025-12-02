import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/client';

/**
 * GET /api/feedback-loops
 * Fetch feedback loops (We Heard You items)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('feedback_loops')
      .select(`
        *,
        community_insights (
          id,
          insight_type,
          insight_text,
          supporting_quotes,
          mentioned_by_count,
          priority_level,
          category
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (year) {
      query = query.eq('reported_in_year', parseInt(year));
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching feedback loops:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback loops' },
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
    console.error('Error in feedback loops API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feedback-loops
 * Create a new feedback loop response
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const body = await request.json();

    const feedbackData = {
      insight_id: body.insight_id,
      original_feedback: body.original_feedback,
      feedback_date: body.feedback_date,
      feedback_source: body.feedback_source,
      response_action: body.response_action,
      action_owner_id: body.action_owner_id,
      investment_amount: body.investment_amount,
      investment_description: body.investment_description,
      reported_in_year: body.reported_in_year || new Date().getFullYear(),
      status: 'acknowledged',
    };

    const { data, error } = await supabase
      .from('feedback_loops')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback loop:', error);
      return NextResponse.json(
        { error: 'Failed to create feedback loop' },
        { status: 500 }
      );
    }

    // Update the insight to mark it as included in report
    if (body.insight_id) {
      await supabase
        .from('community_insights')
        .update({
          organization_response: body.response_action,
          action_status: 'in_progress',
        })
        .eq('id', body.insight_id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in feedback loops API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/feedback-loops
 * Update feedback loop status
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabase() as any;
    const body = await request.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback loop ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('feedback_loops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback loop:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback loop' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in feedback loops API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
