import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/client';

/**
 * GET /api/conversations/[id]/insights
 * Fetch insights for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase() as any;
    const conversationId = params.id;

    const { data, error } = await supabase
      .from('community_insights')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('priority_level', { ascending: true })
      .order('mentioned_by_count', { ascending: false });

    if (error) {
      console.error('Error fetching insights:', error);
      return NextResponse.json(
        { error: 'Failed to fetch insights' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/insights
 * Add a new insight to a conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase() as any;
    const conversationId = params.id;
    const body = await request.json();

    const insightData = {
      conversation_id: conversationId,
      insight_type: body.insight_type,
      insight_text: body.insight_text,
      supporting_quotes: body.supporting_quotes || [],
      mentioned_by_count: body.mentioned_by_count || 1,
      priority_level: body.priority_level || 'medium',
      category: body.category,
      service_area: body.service_area,
      is_material_issue: body.is_material_issue || false,
      action_status: 'pending',
    };

    const { data, error } = await supabase
      .from('community_insights')
      .insert(insightData)
      .select()
      .single();

    if (error) {
      console.error('Error creating insight:', error);
      return NextResponse.json(
        { error: 'Failed to create insight' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
