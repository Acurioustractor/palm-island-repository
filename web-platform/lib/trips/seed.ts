/**
 * Static seed for the Atherton Tablelands trip — used when the trips table
 * hasn't been migrated yet, so the planner page renders in read-only
 * preview mode for demos. Mirrors the seed in
 * supabase/migrations/20260512_trips.sql.
 */

export interface TripMilestone {
  id: string
  text: string
  date: string
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
}

export interface TripBudgetRow {
  id: string
  item: string
  source: string
  amount_min: number
  amount_max: number
  status: 'estimating' | 'requested' | 'approved' | 'paid' | 'rejected'
  notes: string
}

export interface TripIdea {
  id: string
  text: string
}

export interface TripData {
  milestones: TripMilestone[]
  budget: TripBudgetRow[]
  ideas: TripIdea[]
  attendee_names: string[]
  notes: string
}

export interface Trip {
  id: string
  slug: string
  name: string
  description: string | null
  location: string | null
  target_start: string | null
  target_end: string | null
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  origin_meeting_id: string | null
  data: TripData
  created_at?: string
  updated_at?: string
}

export const ATHERTON_TABLELANDS_SEED: Trip = {
  id: 'seed-atherton-tablelands',
  slug: 'atherton-tablelands-2026',
  name: 'Atherton Tablelands Cultural Trip',
  description:
    'Cultural connection trip with the Elders Group — visiting sites, ranger programs, and bush food gardens across the Atherton Tablelands region. Possibly extending to Adnapa Homestead near Alice Springs.',
  location: 'Atherton · Mareeba · Ravenshoe (and potentially Adnapa Homestead, Alice Springs)',
  target_start: '2026-10-01',
  target_end: '2026-10-14',
  status: 'planning',
  origin_meeting_id: null,
  data: {
    milestones: [
      { id: 'm1', text: 'Submit Indigenous Language and Arts grant application', date: '2026-05-30', status: 'in_progress' },
      { id: 'm2', text: 'Confirm October dates with all attending Elders', date: '2026-06-15', status: 'open' },
      { id: 'm3', text: 'Research cultural sites and ranger connections in the Tablelands', date: '2026-07-01', status: 'open' },
      { id: 'm4', text: 'Confirm accommodation across the region', date: '2026-08-01', status: 'open' },
      { id: 'm5', text: 'Lock final itinerary and brief the group', date: '2026-09-15', status: 'open' },
      { id: 'm6', text: 'Trip begins', date: '2026-10-01', status: 'open' },
    ],
    budget: [
      { id: 'b1', item: 'Indigenous Language and Arts grant', source: 'Commonwealth', amount_min: 20000, amount_max: 200000, status: 'requested', notes: 'Using Hull River trip film + Snake presentation as supporting material' },
      { id: 'b2', item: 'Accommodation (1-2 weeks across region)', source: 'TBD', amount_min: 0, amount_max: 0, status: 'estimating', notes: '' },
      { id: 'b3', item: 'Vehicle / fuel', source: 'TBD', amount_min: 0, amount_max: 0, status: 'estimating', notes: '' },
      { id: 'b4', item: 'Cultural site entry / ranger fees', source: 'TBD', amount_min: 0, amount_max: 0, status: 'estimating', notes: '' },
    ],
    ideas: [
      { id: 'i1', text: 'Visit cultural sites in Atherton, Mareeba and Ravenshoe area' },
      { id: 'i2', text: 'Connect with regional Indigenous rangers' },
      { id: 'i3', text: 'See bush food gardens' },
      { id: 'i4', text: 'Possibly extend trip to Adnapa Homestead near Alice Springs' },
      { id: 'i5', text: 'Use Hull River trip film + Snake presentation as supporting material for grant' },
      { id: 'i6', text: 'Document the trip with photos + video for next annual report' },
    ],
    attendee_names: ['Aunty Iris May Whitey', 'Uncle Frank Daniel Anderson', 'Benjamin Knight'],
    notes:
      'Origin: Elders Group Meeting — Room Naming, Grant Opportunity & Tablelands Trip Planning (16 Feb 2026). The trip is the practical realisation of three threads: (1) cultural connection across country, (2) supporting the grant story with a documented expedition, (3) connecting with other Indigenous communities (rangers, Adnapa Homestead).',
  },
}
