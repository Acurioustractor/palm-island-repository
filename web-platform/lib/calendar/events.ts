/**
 * Cultural Calendar & Events System
 *
 * Track community events, cultural dates, and milestones.
 */

import { createClient } from '@/lib/supabase/server'

export interface CulturalEvent {
  id: string
  title: string
  description?: string
  date: string // ISO date string
  endDate?: string
  type: EventType
  isRecurring: boolean
  recurrenceRule?: string // iCal RRULE format
  location?: string
  organizer?: string
  relatedStoryIds?: string[]
  relatedKnowledgeIds?: string[]
  culturalSignificance?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export type EventType =
  | 'community'      // Community gatherings, meetings
  | 'cultural'       // Cultural ceremonies, practices
  | 'national'       // NAIDOC, Sorry Day, etc.
  | 'local'          // Palm Island specific
  | 'health'         // Health programs, clinics
  | 'education'      // School events, training
  | 'sports'         // Sports events
  | 'memorial'       // Memorial days, anniversaries
  | 'celebration'    // Celebrations, achievements

// Pre-defined national/cultural dates
export const NATIONAL_DATES: Omit<CulturalEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'NAIDOC Week',
    description: 'National NAIDOC Week celebrates and recognises the history, culture and achievements of Aboriginal and Torres Strait Islander peoples.',
    date: '2024-07-07', // First Sunday in July
    endDate: '2024-07-14',
    type: 'national',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=7;BYDAY=1SU',
    culturalSignificance: 'A time to celebrate Aboriginal and Torres Strait Islander culture and heritage, and to recognise the contributions of Indigenous Australians.',
    isPublic: true
  },
  {
    title: 'National Sorry Day',
    description: 'A day to acknowledge the mistreatment of Aboriginal and Torres Strait Islander people who were forcibly removed from their families and communities.',
    date: '2024-05-26',
    type: 'national',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=5;BYMONTHDAY=26',
    culturalSignificance: 'Remembering the Stolen Generations and committing to healing.',
    isPublic: true
  },
  {
    title: 'National Reconciliation Week',
    description: 'A time for all Australians to learn about shared histories, cultures, and achievements, and to explore how each of us can contribute to reconciliation.',
    date: '2024-05-27',
    endDate: '2024-06-03',
    type: 'national',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=5;BYMONTHDAY=27',
    culturalSignificance: 'Bookended by two significant dates: the 1967 referendum anniversary (27 May) and Mabo Day (3 June).',
    isPublic: true
  },
  {
    title: 'Mabo Day',
    description: 'Anniversary of the Mabo decision, which recognised native title in Australia.',
    date: '2024-06-03',
    type: 'national',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=3',
    culturalSignificance: 'Commemorates Eddie Koiki Mabo and the landmark High Court decision recognising native title.',
    isPublic: true
  },
  {
    title: 'Coming of the Light',
    description: 'Celebrates the arrival of the London Missionary Society to the Torres Strait Islands on 1 July 1871.',
    date: '2024-07-01',
    type: 'cultural',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=1',
    culturalSignificance: 'A significant day for Torres Strait Islander people, celebrating faith and culture.',
    isPublic: true
  },
  {
    title: 'International Day of the World\'s Indigenous Peoples',
    description: 'UN-designated day to promote and protect the rights of indigenous peoples worldwide.',
    date: '2024-08-09',
    type: 'national',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=8;BYMONTHDAY=9',
    culturalSignificance: 'Global recognition of indigenous rights and cultures.',
    isPublic: true
  },
  {
    title: 'National Aboriginal and Torres Strait Islander Children\'s Day',
    description: 'A day to celebrate Aboriginal and Torres Strait Islander children.',
    date: '2024-08-04',
    type: 'national',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=8;BYMONTHDAY=4',
    culturalSignificance: 'Celebrating the strengths and culture of Aboriginal and Torres Strait Islander children.',
    isPublic: true
  },
  {
    title: 'Anniversary of Apology to Stolen Generations',
    description: 'Anniversary of Prime Minister Kevin Rudd\'s formal apology to the Stolen Generations.',
    date: '2024-02-13',
    type: 'memorial',
    isRecurring: true,
    recurrenceRule: 'FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=13',
    culturalSignificance: 'A milestone in the reconciliation journey.',
    isPublic: true
  }
]

/**
 * Get events for a date range
 */
export async function getEvents(options: {
  startDate?: string
  endDate?: string
  types?: EventType[]
  includeNational?: boolean
  limit?: number
}): Promise<CulturalEvent[]> {
  const {
    startDate = new Date().toISOString().split('T')[0],
    endDate,
    types,
    includeNational = true,
    limit = 50
  } = options

  const supabase = await createClient()

  let query = supabase
    .from('cultural_events')
    .select('*')
    .gte('date', startDate)
    .order('date', { ascending: true })
    .limit(limit)

  if (endDate) {
    query = query.lte('date', endDate)
  }

  if (types && types.length > 0) {
    query = query.in('type', types)
  }

  const { data: dbEvents, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
  }

  let events: CulturalEvent[] = (dbEvents || []) as CulturalEvent[]

  // Add national dates if requested
  if (includeNational) {
    const year = new Date(startDate).getFullYear()
    const nationalEvents = NATIONAL_DATES.map(event => ({
      ...event,
      id: `national-${event.title.toLowerCase().replace(/\s+/g, '-')}`,
      date: event.date.replace(/^\d{4}/, year.toString()),
      endDate: event.endDate?.replace(/^\d{4}/, year.toString()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })).filter(event => {
      const eventDate = new Date(event.date)
      const start = new Date(startDate)
      const end = endDate ? new Date(endDate) : new Date(start.getFullYear() + 1, 0, 1)
      return eventDate >= start && eventDate <= end
    })

    events = [...events, ...nationalEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  return events
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(count: number = 5): Promise<CulturalEvent[]> {
  const today = new Date().toISOString().split('T')[0]
  const threeMonthsLater = new Date()
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)

  return getEvents({
    startDate: today,
    endDate: threeMonthsLater.toISOString().split('T')[0],
    limit: count
  })
}

/**
 * Get events for a specific month
 */
export async function getEventsForMonth(
  year: number,
  month: number
): Promise<CulturalEvent[]> {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  return getEvents({ startDate, endDate })
}

/**
 * Create a new event
 */
export async function createEvent(
  event: Omit<CulturalEvent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CulturalEvent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cultural_events')
    .insert({
      ...event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    return null
  }

  return data as CulturalEvent
}

/**
 * Update an event
 */
export async function updateEvent(
  id: string,
  updates: Partial<CulturalEvent>
): Promise<CulturalEvent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cultural_events')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating event:', error)
    return null
  }

  return data as CulturalEvent
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cultural_events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event:', error)
    return false
  }

  return true
}

/**
 * Get events related to a story
 */
export async function getEventsForStory(storyId: string): Promise<CulturalEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cultural_events')
    .select('*')
    .contains('related_story_ids', [storyId])
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching story events:', error)
    return []
  }

  return (data || []) as CulturalEvent[]
}

/**
 * Get today's cultural significance
 */
export async function getTodaySignificance(): Promise<{
  events: CulturalEvent[]
  message: string | null
}> {
  const today = new Date().toISOString().split('T')[0]

  const events = await getEvents({
    startDate: today,
    endDate: today
  })

  // Check for national dates
  const nationalEvent = events.find(e => e.type === 'national' || e.type === 'cultural')

  return {
    events,
    message: nationalEvent?.culturalSignificance || null
  }
}

/**
 * Format event for display
 */
export function formatEventDate(event: CulturalEvent): string {
  const start = new Date(event.date)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }

  if (event.endDate) {
    const end = new Date(event.endDate)
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`
    }
    return `${start.toLocaleDateString('en-AU', options)} - ${end.toLocaleDateString('en-AU', options)}`
  }

  return start.toLocaleDateString('en-AU', {
    ...options,
    year: 'numeric'
  })
}

/**
 * Get event type color
 */
export function getEventTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    community: 'bg-blue-100 text-blue-800',
    cultural: 'bg-purple-100 text-purple-800',
    national: 'bg-yellow-100 text-yellow-800',
    local: 'bg-green-100 text-green-800',
    health: 'bg-red-100 text-red-800',
    education: 'bg-indigo-100 text-indigo-800',
    sports: 'bg-orange-100 text-orange-800',
    memorial: 'bg-gray-100 text-gray-800',
    celebration: 'bg-pink-100 text-pink-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
