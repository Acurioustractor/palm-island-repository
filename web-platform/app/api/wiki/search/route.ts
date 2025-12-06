/**
 * Wiki Semantic Search API
 *
 * Provides AI-powered search across:
 * - Stories (with vector embeddings)
 * - Knowledge entries
 * - Profiles/People
 * - Services
 *
 * Features:
 * - Query Expansion: AI rewrites queries for better results
 * - Hybrid Search: Vector + keyword search combined
 * - Multi-type Search: Stories, people, services, knowledge
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hybridSearch, textSearch } from '@/lib/scraper/rag-search';
import { expandQuery, extractKeywords } from '@/lib/ai/query-expansion';

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
  const useQueryExpansion = searchParams.get('expand') !== 'false';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({
      error: 'Query must be at least 2 characters'
    }, { status: 400 });
  }

  try {
    // Query Expansion: AI rewrites query for better results
    let searchQuery = query;
    let expandedQueryInfo = null;

    if (useQueryExpansion && query.length >= 3) {
      try {
        expandedQueryInfo = await expandQuery(query);
        // Use expanded query for searching
        searchQuery = expandedQueryInfo.expanded;
      } catch (e) {
        // Fall back to original query if expansion fails
        console.warn('Query expansion failed, using original:', e);
      }
    }

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

    // Stories search (using expanded query)
    if (type === 'all' || type === 'stories') {
      searchPromises.push(
        searchStories(searchQuery, limit).then(data => { results.stories = data; })
      );
    }

    // People search (using expanded query)
    if (type === 'all' || type === 'people') {
      searchPromises.push(
        searchPeople(searchQuery, limit).then(data => { results.people = data; })
      );
    }

    // Services search (using expanded query)
    if (type === 'all' || type === 'services') {
      searchPromises.push(
        searchServices(searchQuery, limit).then(data => { results.services = data; })
      );
    }

    // Knowledge entries search (using expanded query)
    if (type === 'all' || type === 'knowledge') {
      searchPromises.push(
        searchKnowledge(searchQuery, limit).then(data => { results.knowledge = data; })
      );
    }

    // RAG semantic search (if enabled, using expanded query)
    if (useSemanticSearch && (type === 'all' || type === 'semantic')) {
      searchPromises.push(
        hybridSearch(searchQuery, { limit, includeKnowledgeBase: true })
          .then(data => {
            results.ragChunks = data.chunks;
            // Merge knowledge results if not already searched
            if (type === 'semantic') {
              results.knowledge = data.knowledgeEntries;
            }
          })
          .catch(() => {
            // Fallback to text search if semantic fails
            return textSearch(searchQuery, { limit })
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
      searchQuery: searchQuery !== query ? searchQuery : undefined,
      totalResults,
      results,
      // Include query expansion metadata
      queryExpansion: expandedQueryInfo ? {
        original: expandedQueryInfo.original,
        expanded: expandedQueryInfo.expanded,
        keywords: expandedQueryInfo.keywords,
        intent: expandedQueryInfo.intent,
        correctedSpelling: expandedQueryInfo.correctedSpelling,
        confidence: expandedQueryInfo.confidence
      } : undefined
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

// POST endpoint for more complex semantic queries with query expansion
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, filters = {}, limit = 10, expand = true } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        error: 'Query must be at least 2 characters'
      }, { status: 400 });
    }

    // Query Expansion for better results
    let searchQuery = query;
    let expandedQueryInfo = null;

    if (expand && query.length >= 3) {
      try {
        expandedQueryInfo = await expandQuery(query);
        searchQuery = expandedQueryInfo.expanded;
      } catch (e) {
        console.warn('Query expansion failed:', e);
      }
    }

    // Use hybrid search for semantic understanding
    const { chunks, knowledgeEntries } = await hybridSearch(searchQuery, {
      limit,
      includeKnowledgeBase: true,
      ...filters
    });

    // Search stories with potential semantic matching
    const stories = await searchStories(searchQuery, limit);

    return NextResponse.json({
      query,
      searchQuery: searchQuery !== query ? searchQuery : undefined,
      results: {
        stories,
        knowledge: knowledgeEntries,
        semanticChunks: chunks.map(chunk => ({
          text: chunk.chunkText,
          score: chunk.score,
          source: chunk.sourceTitle || chunk.sourceUrl
        }))
      },
      queryExpansion: expandedQueryInfo ? {
        expanded: expandedQueryInfo.expanded,
        keywords: expandedQueryInfo.keywords,
        intent: expandedQueryInfo.intent,
        correctedSpelling: expandedQueryInfo.correctedSpelling
      } : undefined,
      metadata: {
        searchMethod: 'hybrid-with-expansion',
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
