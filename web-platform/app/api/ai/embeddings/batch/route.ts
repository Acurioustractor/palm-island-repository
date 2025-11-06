import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { batchGenerateStoryEmbeddings } from '@/lib/openai/embeddings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit = 50 } = body;

    const supabase = createClient();

    // Get stories that don't have embeddings yet
    const { data: stories, error: fetchError } = await supabase
      .from('stories')
      .select('id')
      .is('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch stories: ${fetchError.message}`);
    }

    if (!stories || stories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stories to process',
        processed: 0,
        successful: 0,
        failed: 0
      });
    }

    // Filter out stories that already have embeddings
    const { data: existingEmbeddings } = await supabase
      .from('story_embeddings')
      .select('story_id');

    const existingIds = new Set(existingEmbeddings?.map(e => e.story_id) || []);
    const storiesToProcess = stories
      .filter(s => !existingIds.has(s.id))
      .map(s => s.id);

    if (storiesToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All stories already have embeddings',
        processed: 0,
        successful: 0,
        failed: 0
      });
    }

    // Generate embeddings in batch
    const result = await batchGenerateStoryEmbeddings(storiesToProcess);

    return NextResponse.json({
      success: true,
      message: `Processed ${storiesToProcess.length} stories`,
      processed: storiesToProcess.length,
      successful: result.successful.length,
      failed: result.failed.length,
      failedIds: result.failed
    });
  } catch (error: any) {
    console.error('Error in batch embedding generation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get statistics
    const { count: totalStories } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .is('is_published', true);

    const { count: embeddedStories } = await supabase
      .from('story_embeddings')
      .select('story_id', { count: 'exact', head: true });

    return NextResponse.json({
      totalStories: totalStories || 0,
      embeddedStories: embeddedStories || 0,
      remaining: (totalStories || 0) - (embeddedStories || 0),
      percentageComplete: totalStories ? Math.round((embeddedStories || 0) / totalStories * 100) : 0
    });
  } catch (error: any) {
    console.error('Error fetching embedding stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
