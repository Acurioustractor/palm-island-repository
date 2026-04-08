// Domain imports
import { searchStories, findQuotes, getInterview, getImmersiveStories } from './stories'
import { getServiceInfo, getServiceMetrics, submitServiceUpdate } from './services'
import { exploreTimeline, getDeepHistory } from './history'
import { getPhotoGallery, getPhotoCollections } from './media'
import { submitCommunityVision, getCommunityVisions, escalateToHuman, collectContactDetails } from './community'
import { getFinancialSummary, getContentReadiness, getAnnualReportArchive, getPublications, getImpactIndicators } from './reports'
import { exploreKnowledgeGraph, getInnovationProjects, suggestDataEnrichment, getBoardAndLeadership } from './knowledge'
import { submitMeetingNote, getGrantsAndPartnerships, getJobOpportunities } from './admin'

// Re-export all individual tools
export { searchStories, findQuotes, getInterview, getImmersiveStories }
export { getServiceInfo, getServiceMetrics, submitServiceUpdate }
export { exploreTimeline, getDeepHistory }
export { getPhotoGallery, getPhotoCollections }
export { submitCommunityVision, getCommunityVisions, escalateToHuman, collectContactDetails }
export { getFinancialSummary, getContentReadiness, getAnnualReportArchive, getPublications, getImpactIndicators }
export { exploreKnowledgeGraph, getInnovationProjects, suggestDataEnrichment, getBoardAndLeadership }
export { submitMeetingNote, getGrantsAndPartnerships, getJobOpportunities }

// Re-export shared utilities for any external consumers
export { defineTool, getSupabase, buildPublicUrl, resolveMediaUrl } from './_shared'

// ─── Aggregated tools object ────────────────────────────────────────────────

export const exploreTools = {
  searchStories,
  getServiceInfo,
  getInnovationProjects,
  exploreTimeline,
  findQuotes,
  getPhotoGallery,
  exploreKnowledgeGraph,
  submitCommunityVision,
  getCommunityVisions,
  getServiceMetrics,
  getFinancialSummary,
  submitServiceUpdate,
  submitMeetingNote,
  getContentReadiness,
  suggestDataEnrichment,
  getBoardAndLeadership,
  getInterview,
  getPhotoCollections,
  getAnnualReportArchive,
  getPublications,
  getDeepHistory,
  getImpactIndicators,
  getImmersiveStories,
  getGrantsAndPartnerships,
  getJobOpportunities,
  escalateToHuman,
  collectContactDetails,
}
