/**
 * AI Services Index
 *
 * Centralized exports for all AI-powered features:
 * - Query Expansion: Improve search queries
 * - Summarization: Auto-generate summaries
 * - Reranking: Score and reorder search results
 * - Related Content: Find semantically related items
 * - Knowledge Graph: Entity relationships
 * - PDF Processing: Extract and analyze documents
 * - Vision: Image analysis and OCR
 */

// Query Expansion
export {
  expandQuery,
  expandQueriesBatch,
  extractKeywords,
  type ExpandedQuery
} from './query-expansion'

// Summarization
export {
  summarizeContent,
  extractMetadata,
  generateOneLiner,
  batchSummarize,
  categorizeContent,
  type SummaryResult,
  type ContentMetadata
} from './summarization'

// Reranking
export {
  rerankResults,
  hybridRerank,
  quickScore
} from './reranking'

// Related Content
export {
  findRelatedContent,
  discoverConnections
} from './related-content'

// Knowledge Graph
export {
  buildKnowledgeGraph,
  getNodeNeighborhood
} from './knowledge-graph'

// PDF Processing
export {
  extractPDFText,
  processPDFWithVision,
  analyzeAnnualReport,
  extractReportInfo,
  compareReports
} from './pdf-processing'

// Vision
export {
  analyzeImage,
  analyzeCulturalContent,
  extractTextFromImage,
  generateAltText,
  compareImages,
  batchAnalyzeImages
} from './vision'

// Cache
export {
  aiCache,
  withCache,
  CACHE_TTL
} from './cache'

// Rate Limiting
export {
  rateLimiter,
  getClientId,
  withRateLimit
} from './rate-limit'
