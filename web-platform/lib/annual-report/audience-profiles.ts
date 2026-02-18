/**
 * Audience profiles for PICC Annual Report print customization.
 *
 * Each profile defines which sections to show/hide and emphasis levels
 * for different stakeholder audiences.
 */

export type AudienceType = 'government' | 'community' | 'funder' | 'board' | 'supporter';

export interface AudienceProfile {
  id: AudienceType;
  label: string;
  description: string;
  /** Sections to include (all others hidden) */
  sections: SectionConfig[];
}

export interface SectionConfig {
  id: string;
  label: string;
  /** Whether this section is shown by default for this audience */
  defaultVisible: boolean;
  /** Emphasis level: high sections appear first/larger */
  emphasis: 'high' | 'medium' | 'low';
}

const allSections: SectionConfig[] = [
  { id: 'cover', label: 'Cover Page', defaultVisible: true, emphasis: 'high' },
  { id: 'toc', label: 'Table of Contents', defaultVisible: true, emphasis: 'medium' },
  { id: 'chair-report', label: "Chair's Report", defaultVisible: true, emphasis: 'high' },
  { id: 'ceo-report', label: "CEO's Report", defaultVisible: true, emphasis: 'high' },
  { id: 'about', label: 'About PICC', defaultVisible: true, emphasis: 'medium' },
  { id: 'history', label: 'Our History', defaultVisible: true, emphasis: 'medium' },
  { id: 'services', label: 'Our 16 Services', defaultVisible: true, emphasis: 'high' },
  { id: 'highlights', label: 'Key Highlights', defaultVisible: true, emphasis: 'high' },
  { id: 'health-impact', label: 'Health Service Impact', defaultVisible: true, emphasis: 'high' },
  { id: 'community-services', label: 'Community Services', defaultVisible: true, emphasis: 'medium' },
  { id: 'financials', label: 'Financial Overview', defaultVisible: true, emphasis: 'high' },
  { id: 'people', label: 'Our People', defaultVisible: true, emphasis: 'medium' },
  { id: 'board', label: 'Board of Directors', defaultVisible: true, emphasis: 'medium' },
  { id: 'governance', label: 'Governance Structure', defaultVisible: true, emphasis: 'medium' },
  { id: 'stories', label: 'Community Stories', defaultVisible: true, emphasis: 'medium' },
  { id: 'photos', label: 'Photo Gallery', defaultVisible: true, emphasis: 'low' },
  { id: 'cultural', label: 'Cultural Programs', defaultVisible: true, emphasis: 'medium' },
  { id: 'partners', label: 'Our Partners', defaultVisible: true, emphasis: 'low' },
  { id: 'looking-ahead', label: 'Looking Ahead', defaultVisible: true, emphasis: 'medium' },
  { id: 'acknowledgments', label: 'Acknowledgments', defaultVisible: true, emphasis: 'low' },
  { id: 'community-voices', label: 'Community Voices', defaultVisible: true, emphasis: 'medium' },
  { id: 'youth-voices', label: 'Youth Voices', defaultVisible: true, emphasis: 'medium' },
  { id: 'compliance', label: 'Compliance & Registration', defaultVisible: true, emphasis: 'medium' },
  { id: 'directors-report', label: "Directors' Report", defaultVisible: true, emphasis: 'medium' },
  { id: 'financial-detail', label: 'Revenue by Funder', defaultVisible: true, emphasis: 'medium' },
  { id: 'journey-timeline', label: 'Journey Timeline', defaultVisible: true, emphasis: 'medium' },
  { id: 'next-twenty', label: 'Next 20 Years', defaultVisible: true, emphasis: 'medium' },
  { id: 'resilience', label: 'Community Resilience', defaultVisible: true, emphasis: 'medium' },
  { id: 'flood-stories', label: 'Flood Stories', defaultVisible: true, emphasis: 'medium' },
];

function withOverrides(
  overrides: Partial<Record<string, { defaultVisible?: boolean; emphasis?: 'high' | 'medium' | 'low' }>>
): SectionConfig[] {
  return allSections.map((s) => {
    const o = overrides[s.id];
    if (!o) return s;
    return { ...s, ...o };
  });
}

export const audienceProfiles: Record<AudienceType, AudienceProfile> = {
  government: {
    id: 'government',
    label: 'Government',
    description: 'Compliance, governance, financials, metrics, and cultural protocols',
    sections: withOverrides({
      'chair-report': { emphasis: 'high' },
      'ceo-report': { emphasis: 'high' },
      services: { emphasis: 'high' },
      'health-impact': { emphasis: 'high' },
      financials: { emphasis: 'high' },
      governance: { emphasis: 'high' },
      board: { emphasis: 'high' },
      highlights: { emphasis: 'high' },
      stories: { defaultVisible: false, emphasis: 'low' },
      photos: { defaultVisible: false, emphasis: 'low' },
      cultural: { emphasis: 'medium' },
      'flood-stories': { defaultVisible: false, emphasis: 'low' },
    }),
  },

  community: {
    id: 'community',
    label: 'Community',
    description: 'Stories, photos, cultural content, and impact',
    sections: withOverrides({
      stories: { defaultVisible: true, emphasis: 'high' },
      photos: { defaultVisible: true, emphasis: 'high' },
      cultural: { emphasis: 'high' },
      'community-services': { emphasis: 'high' },
      'health-impact': { emphasis: 'high' },
      highlights: { emphasis: 'high' },
      resilience: { emphasis: 'high' },
      'flood-stories': { emphasis: 'high' },
      financials: { defaultVisible: false, emphasis: 'low' },
      governance: { defaultVisible: false, emphasis: 'low' },
      board: { emphasis: 'low' },
    }),
  },

  funder: {
    id: 'funder',
    label: 'Funder',
    description: 'ROI, outcomes, service delivery stats, and financials',
    sections: withOverrides({
      financials: { emphasis: 'high' },
      'health-impact': { emphasis: 'high' },
      highlights: { emphasis: 'high' },
      services: { emphasis: 'high' },
      'ceo-report': { emphasis: 'high' },
      people: { emphasis: 'high' },
      stories: { defaultVisible: false, emphasis: 'low' },
      photos: { defaultVisible: false, emphasis: 'low' },
      cultural: { defaultVisible: false, emphasis: 'low' },
      history: { defaultVisible: false, emphasis: 'low' },
      'flood-stories': { defaultVisible: false, emphasis: 'low' },
    }),
  },

  board: {
    id: 'board',
    label: 'Board',
    description: 'Strategic overview, risk, staffing, governance, and financials',
    sections: withOverrides({
      'chair-report': { emphasis: 'high' },
      'ceo-report': { emphasis: 'high' },
      governance: { emphasis: 'high' },
      financials: { emphasis: 'high' },
      people: { emphasis: 'high' },
      'looking-ahead': { emphasis: 'high' },
      board: { emphasis: 'high' },
      highlights: { emphasis: 'high' },
      compliance: { emphasis: 'high' },
      'directors-report': { emphasis: 'high' },
      'financial-detail': { emphasis: 'high' },
      stories: { defaultVisible: false, emphasis: 'low' },
      photos: { defaultVisible: false, emphasis: 'low' },
      'flood-stories': { defaultVisible: false, emphasis: 'low' },
    }),
  },

  supporter: {
    id: 'supporter',
    label: 'Supporter',
    description: 'Impact stories, community voices, innovation, and the 20-year journey',
    sections: withOverrides({
      'community-voices': { emphasis: 'high' },
      'youth-voices': { emphasis: 'high' },
      highlights: { emphasis: 'high' },
      photos: { defaultVisible: true, emphasis: 'high' },
      stories: { defaultVisible: true, emphasis: 'high' },
      resilience: { emphasis: 'high' },
      'flood-stories': { emphasis: 'high' },
      'journey-timeline': { emphasis: 'high' },
      'next-twenty': { emphasis: 'high' },
      financials: { defaultVisible: false, emphasis: 'low' },
      governance: { defaultVisible: false, emphasis: 'low' },
      compliance: { defaultVisible: false, emphasis: 'low' },
      'directors-report': { defaultVisible: false, emphasis: 'low' },
      'financial-detail': { defaultVisible: false, emphasis: 'low' },
      board: { defaultVisible: false, emphasis: 'low' },
    }),
  },
};

/** Get a profile by audience type, defaulting to full report (all sections visible) */
export function getAudienceProfile(audience?: string | null): AudienceProfile | null {
  if (!audience) return null;
  return audienceProfiles[audience as AudienceType] || null;
}

/** Get visible section IDs for a given audience */
export function getVisibleSections(audience?: string | null): Set<string> {
  const profile = getAudienceProfile(audience);
  if (!profile) {
    // No audience = show everything
    return new Set(allSections.map((s) => s.id));
  }
  return new Set(profile.sections.filter((s) => s.defaultVisible).map((s) => s.id));
}

/** Map from audience-profiles section IDs (kebab-case) to PDF page keys (camelCase) */
export const SECTION_TO_PDF_PAGE: Record<string, string> = {
  'cover': 'cover',
  'chair-report': 'messages',
  'ceo-report': 'messages',
  'services': 'services',
  'highlights': 'highlights',
  'financials': 'financials',
  'governance': 'governance',
  'board': 'governance',
  'photos': 'photos',
  'stories': 'communityVoices',
  'community-voices': 'communityVoices',
  'youth-voices': 'youthVoices',
  'compliance': 'compliance',
  'directors-report': 'directorsReport',
  'financial-detail': 'financialDetail',
  'journey-timeline': 'journey',
  'next-twenty': 'nextTwenty',
  'looking-ahead': 'nextTwenty',
  'acknowledgments': 'acknowledgement',
  'resilience': 'resilience',
  'flood-stories': 'floodStories',
};

/** Get PDF page keys that should be visible for an audience */
export function getPdfPagesForAudience(audience?: string | null): string[] | null {
  const visible = getVisibleSections(audience);
  if (!audience) return null; // null = show all
  const pages = new Set<string>();
  const visibleArr = Array.from(visible);
  for (let i = 0; i < visibleArr.length; i++) {
    const pdfPage = SECTION_TO_PDF_PAGE[visibleArr[i]];
    if (pdfPage) pages.add(pdfPage);
  }
  // Always include backCover and numbers
  pages.add('backCover');
  pages.add('numbers');
  pages.add('innovation');
  return Array.from(pages);
}

export { allSections };
