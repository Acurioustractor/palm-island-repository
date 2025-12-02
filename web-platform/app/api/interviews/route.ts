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
    const storytellerId = searchParams.get('storyteller_id');

    let query = supabase
      .from('interviews')
      .select('*')
      .order('interview_date', { ascending: false });

    if (storytellerId) {
      query = query.eq('storyteller_id', storytellerId);
    }

    const { data, error } = await query.limit(100);

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

    const interviewData = {
      storyteller_id: body.storyteller_id,
      interview_title: body.interview_title,
      interview_date: body.interview_date || new Date().toISOString().split('T')[0],
      interview_duration_minutes: body.interview_duration_minutes || null,
      raw_transcript: body.raw_transcript,
      interview_notes: body.interview_notes || null,
      video_url: body.video_url || null,
      audio_url: body.audio_url || null,
      status: body.status || 'raw',
      organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
    };

    const { data, error } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single();

    if (error) {
      console.error('Interview insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update storyteller interview count
    if (body.storyteller_id) {
      const { data: countData } = await supabase
        .from('interviews')
        .select('id')
        .eq('storyteller_id', body.storyteller_id);

      await supabase
        .from('profiles')
        .update({ interviews_completed: countData?.length || 1 })
        .eq('id', body.storyteller_id);
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
    const storytellerId = searchParams.get('storyteller_id');

    if (!id) {
      return NextResponse.json({ error: 'Interview ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update storyteller interview count
    if (storytellerId) {
      const { data: countData } = await supabase
        .from('interviews')
        .select('id')
        .eq('storyteller_id', storytellerId);

      await supabase
        .from('profiles')
        .update({ interviews_completed: countData?.length || 0 })
        .eq('id', storytellerId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
