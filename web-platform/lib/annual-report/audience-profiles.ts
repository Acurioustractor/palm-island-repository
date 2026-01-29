/**
 * Audience profiles for PICC Annual Report print customization.
 *
 * Each profile defines which sections to show/hide and emphasis levels
 * for different stakeholder audiences.
 */

export type AudienceType = 'government' | 'community' | 'funder' | 'board';

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
      stories: { defaultVisible: false, emphasis: 'low' },
      photos: { defaultVisible: false, emphasis: 'low' },
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

export { allSections };
