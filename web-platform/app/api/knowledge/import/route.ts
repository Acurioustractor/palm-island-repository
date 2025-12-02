import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PICC_KNOWLEDGE_BASE } from '@/lib/picc-knowledge-base'

// POST - Import PICC knowledge base data into the database
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results = {
    entries_created: 0,
    financial_records_created: 0,
    timeline_events_created: 0,
    sources_created: 0,
    errors: [] as string[]
  }

  try {
    const kb = PICC_KNOWLEDGE_BASE

    // 1. Create source for the knowledge base
    const { data: source, error: sourceError } = await supabase
      .from('research_sources')
      .insert({
        source_type: 'internal_document',
        title: 'PICC Knowledge Base - Initial Import',
        description: 'Comprehensive knowledge base for Palm Island Community Company compiled from annual reports, website, and public records',
        is_verified: true,
        is_primary_source: true,
        reliability_score: 90,
        accessed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sourceError) {
      results.errors.push(`Source creation error: ${sourceError.message}`)
    } else {
      results.sources_created = 1
    }

    const sourceId = source?.id

    // 2. Create organization entry
    const { error: orgError } = await supabase
      .from('knowledge_entries')
      .insert({
        slug: 'picc-organization',
        title: kb.organization.name,
        content: `${kb.organization.name} is a ${kb.organization.type} delivering vital services to the Palm Island community. ACN: ${kb.organization.acn}. Tagline: "${kb.organization.tagline}". Mission: ${kb.organization.mission}. Vision: ${kb.organization.vision}.`,
        summary: kb.organization.mission,
        entry_type: 'organization',
        category: 'About',
        location_name: 'Palm Island',
        location_type: 'palm_island',
        importance: 10,  // Max is 10
        is_featured: true,
        is_public: true,
        is_verified: true,
        structured_data: kb.organization
      })

    if (orgError) {
      if (!orgError.message.includes('duplicate')) {
        results.errors.push(`Organization entry error: ${orgError.message}`)
      }
    } else {
      results.entries_created++
    }

    // 3. Create history entries from key_dates
    const historyEntries = [
      {
        slug: 'hull-river-connection',
        title: 'Hull River Connection - Origins of Palm Island',
        content: `The Hull River Aboriginal Settlement was destroyed by a cyclone on ${kb.history.hull_river_connection.cyclone_date}. ${kb.history.hull_river_connection.cyclone_details}. This led to the forced relocation of Aboriginal people to Palm Island in ${kb.history.hull_river_connection.transfer_to_palm}. The original settlement was established in ${kb.history.hull_river_connection.established} on ${kb.history.hull_river_connection.built_on}.`,
        entry_type: 'history' as const,
        category: 'History',
        date_from: '1918-03-10',
        structured_data: kb.history.hull_river_connection
      },
      {
        slug: 'palm-island-reserve',
        title: 'Palm Island Reserve Gazetted',
        content: `Palm Island was gazetted as an Aboriginal reserve on ${kb.history.reserve_gazetted}. The traditional owners are the ${kb.history.traditional_owners}. Bwgcolman means "${kb.history.bwgcolman_meaning}".`,
        entry_type: 'history' as const,
        category: 'History',
        date_from: '1914-06-20',
        structured_data: {
          reserve_gazetted: kb.history.reserve_gazetted,
          traditional_owners: kb.history.traditional_owners,
          bwgcolman_meaning: kb.history.bwgcolman_meaning
        }
      },
      {
        slug: 'removals-history',
        title: 'Documented Removals to Palm Island',
        content: `Between ${kb.history.removals_documented.period}, ${kb.history.removals_documented.total_documented} people were documented as being removed to Palm Island. People came from as far as ${kb.history.removals_documented.furthest_origins.join(' and ')}, representing ${kb.history.removals_documented.language_groups} different language groups.`,
        entry_type: 'history' as const,
        category: 'History',
        date_from: '1918-01-01',
        date_to: '1972-12-31',
        structured_data: kb.history.removals_documented
      }
    ]

    for (const entry of historyEntries) {
      const { error } = await supabase
        .from('knowledge_entries')
        .insert({
          ...entry,
          location_name: 'Palm Island',
          location_type: 'palm_island',
          importance: 8,
          is_public: true,
          is_verified: true
        })

      if (error && !error.message.includes('duplicate')) {
        results.errors.push(`History entry error (${entry.slug}): ${error.message}`)
      } else if (!error) {
        results.entries_created++
      }
    }

    // 4. Create service entries
    for (const service of kb.services) {
      const slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const { error } = await supabase
        .from('knowledge_entries')
        .insert({
          slug: slug,
          title: service.name,
          content: service.description,
          summary: service.description,
          entry_type: 'service',
          category: service.category,
          location_name: 'Palm Island',
          location_type: 'palm_island',
          importance: 7,
          is_public: true,
          is_verified: true,
          structured_data: service
        })

      if (error && !error.message.includes('duplicate')) {
        results.errors.push(`Service entry error (${slug}): ${error.message}`)
      } else if (!error) {
        results.entries_created++
      }
    }

    // 5. Create leadership entries
    if (kb.leadership.board_members) {
      for (const leader of kb.leadership.board_members) {
        const slug = `leader-${leader.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        const { error } = await supabase
          .from('knowledge_entries')
          .insert({
            slug: slug,
            title: leader.name,
            content: `${leader.name} serves as ${leader.role} at Palm Island Community Company.`,
            entry_type: 'person',
            category: 'Leadership',
            importance: 6,
            is_public: true,
            is_verified: true,
            structured_data: leader
          })

        if (error && !error.message.includes('duplicate')) {
          results.errors.push(`Leader entry error (${leader.name}): ${error.message}`)
        } else if (!error) {
          results.entries_created++
        }
      }
    }

    // 6. Create CEO entry
    if (kb.leadership.ceo) {
      const { error } = await supabase
        .from('knowledge_entries')
        .insert({
          slug: 'ceo-rachel-atkinson',
          title: kb.leadership.ceo,
          content: `${kb.leadership.ceo} is the CEO of Palm Island Community Company.`,
          entry_type: 'person',
          category: 'Leadership',
          importance: 8,
          is_public: true,
          is_verified: true,
          structured_data: { role: 'CEO', name: kb.leadership.ceo }
        })

      if (error && !error.message.includes('duplicate')) {
        results.errors.push(`CEO entry error: ${error.message}`)
      } else if (!error) {
        results.entries_created++
      }
    }

    // 7. Create timeline events from key_dates
    if (kb.history.key_dates) {
      for (const keyDate of kb.history.key_dates) {
        const { error } = await supabase
          .from('timeline_events')
          .insert({
            title: keyDate.event,
            description: keyDate.event,
            event_date: `${keyDate.year}-01-01`,
            event_type: 'milestone',
            location_name: 'Palm Island',
            significance: 7
          })

        if (error && !error.message.includes('duplicate')) {
          results.errors.push(`Timeline event error (${keyDate.event}): ${error.message}`)
        } else if (!error) {
          results.timeline_events_created++
        }
      }
    }

    // 8. Create major timeline events
    const majorEvents = [
      {
        title: 'Hull River Cyclone',
        description: `The Hull River Aboriginal Settlement was destroyed by a ${kb.history.hull_river_connection.cyclone_details}`,
        event_date: '1918-03-10',
        event_type: 'disaster',
        location_name: 'Hull River, Queensland',
        significance: 10
      },
      {
        title: 'Transfer to Palm Island',
        description: 'Survivors of the Hull River cyclone were transferred to Palm Island',
        event_date: '1918-06-01',
        event_type: 'milestone',
        location_name: 'Palm Island',
        significance: 10
      },
      {
        title: 'PICC Community Control Transition',
        description: 'Palm Island Community Company transitioned to full community control',
        event_date: kb.organization.transition_to_community_control ? '2021-09-30' : '2021-01-01',
        event_type: 'milestone',
        location_name: 'Palm Island',
        significance: 9
      }
    ]

    for (const event of majorEvents) {
      const { error } = await supabase
        .from('timeline_events')
        .insert(event)

      if (error && !error.message.includes('duplicate')) {
        results.errors.push(`Major event error (${event.title}): ${error.message}`)
      } else if (!error) {
        results.timeline_events_created++
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Import completed. Created ${results.entries_created} entries, ${results.financial_records_created} financial records, ${results.timeline_events_created} timeline events.`
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}
