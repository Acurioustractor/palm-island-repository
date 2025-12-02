/**
 * PICC Knowledge Scraper
 *
 * AI-powered web scraping and RAG system for Palm Island Community Company
 */

// Scraper clients
export { scrapeUrl, crawlSite, mapSite } from './firecrawl-client'
export type { ScrapeResult, CrawlResult } from './firecrawl-client'

export { jinaFetch, jinaSearch } from './jina-client'
export type { JinaResult } from './jina-client'

// Content processing
export { chunkContent, chunkMultiple, estimateTokens } from './chunker'
export type { Chunk, ChunkOptions } from './chunker'

// Deduplication
export {
  contentHash,
  chunkHash,
  minHashSignature,
  minHashSimilarity,
  cosineSimilarity,
  isNearDuplicate,
  isSemanticDuplicate,
  normalizeContent,
  checkDuplication
} from './deduplication'
export type { DeduplicationResult } from './deduplication'

// Embeddings
export {
  voyageEmbeddings,
  openaiEmbeddings,
  generateEmbeddings,
  batchEmbeddings
} from './embeddings'
export type { EmbeddingResult } from './embeddings'

// Main scraper service
export {
  scrapeAndStore,
  runScrapeJob,
  getSourcesDueForScraping,
  runScheduledScrapes
} from './scraper-service'
export type { ScrapeJobResult, ScraperConfig } from './scraper-service'

// RAG search
export {
  textSearch,
  hybridSearch,
  buildRAGContext,
  getRAGContext,
  findRelatedContent,
  getCorpusStats
} from './rag-search'
export type { SearchResult, SearchOptions } from './rag-search'
