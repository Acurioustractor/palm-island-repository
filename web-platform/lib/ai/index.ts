/**
 * AI Services Index
 *
 * Centralized exports for all AI-powered features:
 * - Query Expansion: Improve search queries
 * - Summarization: Auto-generate summaries
 * - More coming: Related content, auto-tagging, etc.
 */

export {
  expandQuery,
  expandQueriesBatch,
  extractKeywords,
  type ExpandedQuery
} from './query-expansion'

export {
  summarizeContent,
  extractMetadata,
  generateOneLiner,
  batchSummarize,
  categorizeContent,
  type SummaryResult,
  type ContentMetadata
} from './summarization'
