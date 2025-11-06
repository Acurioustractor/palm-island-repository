import { NextRequest, NextResponse } from 'next/server';
import { searchStories, searchDocuments } from '@/lib/openai/embeddings';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, searchType = 'all', limit = 20 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const results: any = {
      query,
      stories: [],
      documents: [],
      totalResults: 0
    };

    // Search stories
    if (searchType === 'all' || searchType === 'stories') {
      try {
        const storyResults = await searchStories(query, limit);

        // Fetch full story details
        if (storyResults.length > 0) {
          const supabase = createClient();
          const storyIds = storyResults.map(r => r.story_id);

          const { data: stories } = await supabase
            .from('stories')
            .select(`
              id,
              title,
              summary,
              content,
              created_at,
              storyteller_id,
              profiles:storyteller_id (
                id,
                full_name,
                preferred_name
              )
            `)
            .in('id', storyIds);

          // Merge similarity scores with story data
          results.stories = stories?.map(story => {
            const result = storyResults.find(r => r.story_id === story.id);
            return {
              ...story,
              similarity: result?.similarity || 0
            };
          }).sort((a, b) => b.similarity - a.similarity) || [];
        }
      } catch (error) {
        console.error('Error searching stories:', error);
      }
    }

    // Search documents
    if (searchType === 'all' || searchType === 'documents') {
      try {
        const docResults = await searchDocuments(query, limit);

        // Fetch full document details
        if (docResults.length > 0) {
          const supabase = createClient();
          const docIds = docResults.map(r => r.document_id);

          const { data: documents } = await supabase
            .from('documents')
            .select('*')
            .in('id', docIds);

          // Merge similarity scores with document data
          results.documents = documents?.map(doc => {
            const result = docResults.find(r => r.document_id === doc.id);
            return {
              ...doc,
              similarity: result?.similarity || 0
            };
          }).sort((a, b) => b.similarity - a.similarity) || [];
        }
      } catch (error) {
        console.error('Error searching documents:', error);
      }
    }

    results.totalResults = results.stories.length + results.documents.length;

    // Record search in history
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('search_history').insert({
          user_id: user.id,
          query,
          search_type: 'semantic',
          results_count: results.totalResults
        });
      }
    } catch (error) {
      console.error('Error recording search history:', error);
    }

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error: any) {
    console.error('Error in semantic search:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
