/**
 * Pre-populate planner slots from existing ReportData.
 *
 * GET /api/report-planner/prefill?fiscalYear=2024-25
 *
 * Returns a pre-filled PageConfig record that maps existing report data
 * into the planner slot structure, so users start with current content
 * rather than empty slots.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getReportData } from '@/lib/annual-report/fetch-report-data'
import { getDefaultPageConfigs } from '@/lib/annual-report/planner-config'
import type { PageConfig, SlotValue, PhotoSlotValue, QuoteSlotValue, StatSlotValue, TextSlotValue, PersonSlotValue } from '@/lib/annual-report/planner-types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fiscalYear = searchParams.get('fiscalYear') || '2024-25'

  try {
    const data = await getReportData(fiscalYear)
    const pages = getDefaultPageConfigs()

    // ── Cover ──
    if (data.coverPhoto) {
      setSlot(pages, 'cover', 'cover-hero', {
        type: 'photo',
        mediaFileId: '',
        url: data.coverPhoto.url,
        caption: data.coverPhoto.caption,
      })
    }

    // ── Acknowledgement ──
    if (data.report.acknowledgments) {
      setSlot(pages, 'acknowledgement', 'ack-text', {
        type: 'text',
        content: data.report.acknowledgments,
      })
    }

    // ── Messages (CEO + Chair) ──
    for (const msg of data.leadershipMessages) {
      const isCeo = msg.role === 'ceo' ||
        msg.person_title?.toLowerCase().includes('ceo') ||
        msg.person_title?.toLowerCase().includes('chief executive')
      const prefix = isCeo ? 'msg-ceo' : 'msg-chair'

      if (msg.person_name) {
        setSlot(pages, 'messages', prefix, {
          type: 'person',
          personId: msg.id,
          name: msg.person_name,
          role: msg.person_title,
          photoUrl: msg.photo_url,
        })
      }
      if (msg.photo_url) {
        setSlot(pages, 'messages', `${prefix}-photo`, {
          type: 'photo',
          mediaFileId: '',
          url: msg.photo_url,
          caption: msg.person_name,
        })
      }
      if (msg.message_title) {
        setSlot(pages, 'messages', `${prefix}-title`, {
          type: 'text',
          content: msg.message_title,
        })
      }
      if (msg.message_content) {
        setSlot(pages, 'messages', `${prefix}-body`, {
          type: 'text',
          content: msg.message_content,
        })
      }
      if (msg.featured_quote) {
        setSlot(pages, 'messages', `${prefix}-quote`, {
          type: 'quote',
          sourceTable: 'stories',
          sourceId: msg.id,
          text: msg.featured_quote,
          author: msg.person_name,
          role: msg.person_title,
        })
      }
    }

    // ── Numbers ──
    const keyMetrics = data.statistics.filter(s => s.is_key_metric).slice(0, 4)
    keyMetrics.forEach((stat, i) => {
      const slotId = i === 0 ? 'numbers-hero-stat' : `numbers-stat-${i}`
      setSlot(pages, 'numbers', slotId, {
        type: 'stat',
        label: stat.stat_label,
        value: stat.stat_value,
        unit: stat.stat_unit,
        sourceStatId: stat.id,
      })
    })
    // Fill remaining key metric slots
    const remainingStats = data.statistics.filter(s => !s.is_key_metric).slice(0, 4)
    remainingStats.forEach((stat, i) => {
      setSlot(pages, 'numbers', `numbers-key-${i + 1}`, {
        type: 'stat',
        label: stat.stat_label,
        value: stat.stat_value,
        unit: stat.stat_unit,
        sourceStatId: stat.id,
      })
    })

    // ── Photos (gallery) ──
    if (data.galleryPhotos.length > 0) {
      setSlot(pages, 'photos', 'photos-large', {
        type: 'photo',
        mediaFileId: '',
        url: data.galleryPhotos[0].url,
        caption: data.galleryPhotos[0].caption,
      })
      data.galleryPhotos.slice(1, 5).forEach((photo, i) => {
        setSlot(pages, 'photos', `photos-grid-${i + 1}`, {
          type: 'photo',
          mediaFileId: '',
          url: photo.url,
          caption: photo.caption,
        })
      })
    }

    // ── Community Voices ──
    const voices = data.communityVoices.slice(0, 6)
    const voiceSlotIds = ['cv-featured', 'cv-2', 'cv-3', 'cv-4', 'cv-5', 'cv-6']
    voices.forEach((voice, i) => {
      setSlot(pages, 'communityVoices', voiceSlotIds[i], {
        type: 'quote',
        sourceTable: voice.type === 'elder_quote' ? 'elder_quotes' :
                     voice.type === 'community_vision' ? 'community_visions' : 'stories',
        sourceId: voice.id,
        text: voice.text,
        author: voice.author,
        role: voice.role,
        photoUrl: voice.photo_url,
      })
    })

    // ── Governance (board members) ──
    const boardSlots = ['gov-chair', 'gov-dir-1', 'gov-dir-2', 'gov-dir-3', 'gov-dir-4', 'gov-dir-5', 'gov-dir-6']
    data.boardMembers.slice(0, 7).forEach((member, i) => {
      setSlot(pages, 'governance', boardSlots[i], {
        type: 'person',
        personId: member.id,
        name: member.full_name,
        role: member.position,
        photoUrl: member.photo_url,
      })
    })

    // ── Compliance ──
    if (data.compliance) {
      if (data.compliance.icn_number) {
        setSlot(pages, 'compliance', 'comp-icn', {
          type: 'stat', label: 'ICN', value: data.compliance.icn_number,
        })
      }
      if (data.compliance.members_count) {
        setSlot(pages, 'compliance', 'comp-members', {
          type: 'stat', label: 'Members', value: String(data.compliance.members_count),
        })
      }
      if (data.compliance.agm_date) {
        setSlot(pages, 'compliance', 'comp-agm', {
          type: 'stat', label: 'AGM Date', value: data.compliance.agm_date,
        })
      }
      if (data.compliance.board_meetings_held) {
        setSlot(pages, 'compliance', 'comp-meetings', {
          type: 'stat', label: 'Board Meetings', value: String(data.compliance.board_meetings_held),
        })
      }
      if (data.compliance.auditor_firm || data.compliance.auditor_name) {
        setSlot(pages, 'compliance', 'comp-auditor', {
          type: 'text',
          content: [data.compliance.auditor_firm, data.compliance.auditor_name].filter(Boolean).join(' — '),
        })
      }
    }

    // ── Financials ──
    if (data.financials) {
      setSlot(pages, 'financials', 'fin-income', {
        type: 'stat', label: 'Total Income',
        value: `$${(data.financials.total_income / 1_000_000).toFixed(1)}M`,
      })
      setSlot(pages, 'financials', 'fin-expenditure', {
        type: 'stat', label: 'Total Expenditure',
        value: `$${(data.financials.total_expenditure / 1_000_000).toFixed(1)}M`,
      })
      setSlot(pages, 'financials', 'fin-net', {
        type: 'stat', label: 'Net Result',
        value: `$${(data.financials.net_result / 1_000_000).toFixed(1)}M`,
      })
    }

    // ── Next Twenty ──
    if (data.report.looking_forward) {
      setSlot(pages, 'nextTwenty', 'next-ceo', {
        type: 'text',
        content: data.report.looking_forward,
      })
    }

    // ── Services ──
    const totalStaff = data.services.reduce((sum, s) => sum + (s.staff_count || 0), 0)
    const totalClients = data.services.reduce((sum, s) => sum + (s.clients_served_annual || 0), 0)
    if (totalStaff > 0) {
      setSlot(pages, 'services', 'svc-total-staff', {
        type: 'stat', label: 'Total Staff', value: String(totalStaff),
      })
    }
    if (totalClients > 0) {
      setSlot(pages, 'services', 'svc-total-clients', {
        type: 'stat', label: 'Total Clients', value: String(totalClients),
      })
    }

    return NextResponse.json({ config: pages, prefilled: true })
  } catch (err) {
    console.error('Prefill failed:', err)
    return NextResponse.json({ config: getDefaultPageConfigs(), prefilled: false })
  }
}

/** Helper to set a slot value in the page config record */
function setSlot(
  pages: Record<string, PageConfig>,
  pageKey: string,
  slotId: string,
  value: SlotValue,
) {
  const page = pages[pageKey]
  if (!page) return
  const slot = page.slots.find(s => s.id === slotId)
  if (slot) {
    slot.value = value
  }
}
