/**
 * Wiki Semantic Search API
 *
 * Provides AI-powered search across:
 * - Stories (with vector embeddings)
 * - Knowledge entries
 * - Profiles/People
 * - Services
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hybridSearch, textSearch } from '@/lib/scraper/rag-search';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all'; // all, stories, people, services, knowledge
  const limit = parseInt(searchParams.get('limit') || '10');
  const useSemanticSearch = searchParams.get('semantic') !== 'false';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({
      error: 'Query must be at least 2 characters'
    }, { status: 400 });
  }

  try {
    const results: {
      stories: any[];
      people: any[];
      services: any[];
      knowledge: any[];
      ragChunks: any[];
    } = {
      stories: [],
      people: [],
      services: [],
      knowledge: [],
      ragChunks: []
    };

    // Parallel search across different content types
    const searchPromises: Promise<void>[] = [];

    // Stories search
    if (type === 'all' || type === 'stories') {
      searchPromises.push(
        searchStories(query, limit).then(data => { results.stories = data; })
      );
    }

    // People search
    if (type === 'all' || type === 'people') {
      searchPromises.push(
        searchPeople(query, limit).then(data => { results.people = data; })
      );
    }

    // Services search
    if (type === 'all' || type === 'services') {
      searchPromises.push(
        searchServices(query, limit).then(data => { results.services = data; })
      );
    }

    // Knowledge entries search
    if (type === 'all' || type === 'knowledge') {
      searchPromises.push(
        searchKnowledge(query, limit).then(data => { results.knowledge = data; })
      );
    }

    // RAG semantic search (if enabled)
    if (useSemanticSearch && (type === 'all' || type === 'semantic')) {
      searchPromises.push(
        hybridSearch(query, { limit, includeKnowledgeBase: true })
          .then(data => {
            results.ragChunks = data.chunks;
            // Merge knowledge results if not already searched
            if (type === 'semantic') {
              results.knowledge = data.knowledgeEntries;
            }
          })
          .catch(() => {
            // Fallback to text search if semantic fails
            return textSearch(query, { limit })
              .then(data => { results.ragChunks = data; });
          })
      );
    }

    await Promise.all(searchPromises);

    // Calculate total results
    const totalResults =
      results.stories.length +
      results.people.length +
      results.services.length +
      results.knowledge.length;

    return NextResponse.json({
      query,
      totalResults,
      results
    });

  } catch (error) {
    console.error('Wiki search error:', error);
    return NextResponse.json({
      error: 'Search failed'
    }, { status: 500 });
  }
}

async function searchStories(query: string, limit: number) {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      summary,
      story_category,
      created_at,
      storyteller:storyteller_id (
        full_name,
        preferred_name,
        profile_image_url
      )
    `)
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Stories search error:', error);
    return [];
  }

  return (data || []).map(story => ({
    ...story,
    type: 'story',
    url: `/stories/${story.id}`
  }));
}

async function searchPeople(query: string, limit: number) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      preferred_name,
      bio,
      profile_image_url,
      storyteller_type,
      is_elder
    `)
    .eq('show_in_directory', true)
    .or(`full_name.ilike.%${query}%,preferred_name.ilike.%${query}%,bio.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('People search error:', error);
    return [];
  }

  return (data || []).map(person => ({
    ...person,
    type: 'person',
    url: `/wiki/people/${person.id}`
  }));
}

async function searchServices(query: string, limit: number) {
  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      service_name,
      description,
      service_category
    `)
    .or(`service_name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Services search error:', error);
    return [];
  }

  return (data || []).map(service => ({
    ...service,
    type: 'service',
    url: `/wiki/services/${service.id}`
  }));
}

async function searchKnowledge(query: string, limit: number) {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select(`
      id,
      slug,
      title,
      summary,
      entry_type,
      category
    `)
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Knowledge search error:', error);
    return [];
  }

  return (data || []).map(entry => ({
    ...entry,
    type: 'knowledge',
    url: `/wiki/${entry.slug || entry.id}`
  }));
}

// POST endpoint for more complex semantic queries
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, filters = {}, limit = 10 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        error: 'Query must be at least 2 characters'
      }, { status: 400 });
    }

    // Use hybrid search for semantic understanding
    const { chunks, knowledgeEntries } = await hybridSearch(query, {
      limit,
      includeKnowledgeBase: true,
      ...filters
    });

    // Search stories with potential semantic matching
    const stories = await searchStories(query, limit);

    return NextResponse.json({
      query,
      results: {
        stories,
        knowledge: knowledgeEntries,
        semanticChunks: chunks.map(chunk => ({
          text: chunk.chunkText,
          score: chunk.score,
          source: chunk.sourceTitle || chunk.sourceUrl
        }))
      },
      metadata: {
        searchMethod: 'hybrid',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Wiki semantic search error:', error);
    return NextResponse.json({
      error: 'Search failed'
    }, { status: 500 });
  }
}
