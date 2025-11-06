import { openai, EMBEDDING_MODEL, prepareTextForEmbedding } from './client';
import { createClient } from '@/lib/supabase/client';

/**
 * Generate an embedding vector for the given text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const preparedText = prepareTextForEmbedding(text);

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: preparedText,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate and store embedding for a story
 */
export async function generateStoryEmbedding(storyId: string): Promise<void> {
  try {
    const supabase = createClient();

    // Fetch the story
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('id, title, content, summary')
      .eq('id', storyId)
      .single();

    if (fetchError || !story) {
      throw new Error(`Failed to fetch story: ${fetchError?.message}`);
    }

    // Combine title, summary, and content for embedding
    const textToEmbed = [
      story.title,
      story.summary || '',
      story.content || ''
    ].filter(Boolean).join('\n\n');

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);

    // Store embedding in database
    const { error: upsertError } = await supabase
      .from('story_embeddings')
      .upsert({
        story_id: storyId,
        embedding: JSON.stringify(embedding),
        model_version: EMBEDDING_MODEL,
        token_count: Math.ceil(textToEmbed.length / 4), // Rough estimate
      }, {
        onConflict: 'story_id'
      });

    if (upsertError) {
      throw new Error(`Failed to store embedding: ${upsertError.message}`);
    }

    console.log(`Generated embedding for story ${storyId}`);
  } catch (error) {
    console.error(`Error generating story embedding for ${storyId}:`, error);
    throw error;
  }
}

/**
 * Generate and store embedding for a document
 */
export async function generateDocumentEmbedding(documentId: string): Promise<void> {
  try {
    const supabase = createClient();

    // Fetch the document
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, title, description, author')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      throw new Error(`Failed to fetch document: ${fetchError?.message}`);
    }

    // Combine title, description, and author for embedding
    const textToEmbed = [
      document.title,
      document.description || '',
      document.author || ''
    ].filter(Boolean).join('\n\n');

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);

    // Store embedding in database
    const { error: upsertError } = await supabase
      .from('document_embeddings')
      .upsert({
        document_id: documentId,
        embedding: JSON.stringify(embedding),
        model_version: EMBEDDING_MODEL,
        token_count: Math.ceil(textToEmbed.length / 4),
      }, {
        onConflict: 'document_id'
      });

    if (upsertError) {
      throw new Error(`Failed to store embedding: ${upsertError.message}`);
    }

    console.log(`Generated embedding for document ${documentId}`);
  } catch (error) {
    console.error(`Error generating document embedding for ${documentId}:`, error);
    throw error;
  }
}

/**
 * Batch generate embeddings for multiple stories
 */
export async function batchGenerateStoryEmbeddings(storyIds: string[]): Promise<{
  successful: string[];
  failed: string[];
}> {
  const successful: string[] = [];
  const failed: string[] = [];

  for (const storyId of storyIds) {
    try {
      await generateStoryEmbedding(storyId);
      successful.push(storyId);

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to generate embedding for story ${storyId}:`, error);
      failed.push(storyId);
    }
  }

  return { successful, failed };
}

/**
 * Semantic search across stories
 */
export async function searchStories(query: string, limit: number = 10): Promise<any[]> {
  try {
    const supabase = createClient();

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Perform vector similarity search
    const { data, error } = await supabase.rpc('find_similar_stories', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error searching stories:', error);
    throw error;
  }
}

/**
 * Semantic search across documents
 */
export async function searchDocuments(query: string, limit: number = 10): Promise<any[]> {
  try {
    const supabase = createClient();

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Perform vector similarity search
    const { data, error } = await supabase.rpc('find_similar_documents', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}
