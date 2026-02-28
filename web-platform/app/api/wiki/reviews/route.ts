import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artifact_id, story_id, chapter_ref, reviewer_name, review_type, content } = body;

    if (!reviewer_name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!review_type || !['correction', 'addition', 'sensitivity_flag', 'approval'].includes(review_type)) {
      return NextResponse.json({ error: 'Invalid review type' }, { status: 400 });
    }

    if (!content?.trim() && review_type !== 'approval') {
      return NextResponse.json({ error: 'Content is required for this review type' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('artifact_reviews')
      .insert({
        artifact_id: artifact_id || null,
        story_id: story_id || null,
        chapter_ref: chapter_ref || null,
        reviewer_name: reviewer_name.trim(),
        review_type,
        content: content?.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to submit review:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
