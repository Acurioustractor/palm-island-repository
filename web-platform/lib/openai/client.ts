import OpenAI from 'openai';

// Initialize OpenAI client
// Make sure OPENAI_API_KEY is set in your environment variables
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Configuration
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;
export const CHAT_MODEL = 'gpt-4-turbo-preview';
export const MAX_TOKENS_FOR_EMBEDDING = 8191;

// Helper function to truncate text to fit within token limits
export function truncateText(text: string, maxTokens: number = MAX_TOKENS_FOR_EMBEDDING): string {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }
  return text.substring(0, maxChars) + '...';
}

// Helper function to prepare text for embedding
export function prepareTextForEmbedding(text: string): string {
  // Remove excessive whitespace
  let prepared = text.replace(/\s+/g, ' ').trim();

  // Truncate if needed
  prepared = truncateText(prepared);

  return prepared;
}
