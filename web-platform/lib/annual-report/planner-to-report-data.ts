/**
 * Convert a planner configuration into ReportData for PDF generation.
 *
 * Takes the user's content selections from the planner and merges them
 * with the base report data fetched from Supabase, producing a ReportData
 * object ready for AnnualReportPDF.
 */

import type { ReportData } from './fetch-report-data'
import type { PlannerConfig, PhotoSlotValue, QuoteSlotValue, StatSlotValue, TextSlotValue } from './planner-types'

/**
 * Apply planner overrides to base report data.
 *
 * The planner lets users swap specific content slots. This function
 * takes the base data (from getReportData) and applies any overrides
 * from the planner config.
 */
export function applyPlannerOverrides(
  baseData: ReportData,
  config: PlannerConfig
): ReportData {
  // Deep clone the base data to avoid mutation
  const data: ReportData = JSON.parse(JSON.stringify(baseData))

  const pages = config.pages

  // ── Cover ──
  const cover = pages.cover
  if (cover) {
    const heroSlot = findSlotValue<PhotoSlotValue>(cover.slots, 'cover-hero', 'photo')
    if (heroSlot) {
      data.coverPhoto = { url: heroSlot.url, caption: heroSlot.caption }
    }
  }

  // ── Messages ──
  const messages = pages.messages
  if (messages) {
    // Override CEO photo
    const ceoPhoto = findSlotValue<PhotoSlotValue>(messages.slots, 'msg-ceo-photo', 'photo')
    if (ceoPhoto && data.leadershipMessages.length > 0) {
      const ceoIdx = data.leadershipMessages.findIndex(
        (m) => m.person_title?.toLowerCase().includes('ceo') || m.person_title?.toLowerCase().includes('chief executive')
      )
      if (ceoIdx >= 0) {
        data.leadershipMessages[ceoIdx].photo_url = ceoPhoto.url
      }
    }
    // Override Chair photo
    const chairPhoto = findSlotValue<PhotoSlotValue>(messages.slots, 'msg-chair-photo', 'photo')
    if (chairPhoto && data.leadershipMessages.length > 1) {
      const chairIdx = data.leadershipMessages.findIndex(
        (m) => m.person_title?.toLowerCase().includes('chair')
      )
      if (chairIdx >= 0) {
        data.leadershipMessages[chairIdx].photo_url = chairPhoto.url
      }
    }
  }

  // ── Numbers ──
  const numbers = pages.numbers
  if (numbers) {
    const heroPhoto = findSlotValue<PhotoSlotValue>(numbers.slots, 'numbers-hero', 'photo')
    if (heroPhoto && data.galleryPhotos.length > 0) {
      data.galleryPhotos[0] = { url: heroPhoto.url, caption: heroPhoto.caption }
    }

    // Override key stats
    const statSlots = ['numbers-key-1', 'numbers-key-2', 'numbers-key-3', 'numbers-key-4']
    statSlots.forEach((slotId, i) => {
      const sv = findSlotValue<StatSlotValue>(numbers.slots, slotId, 'stat')
      if (sv && data.statistics[i]) {
        data.statistics[i].stat_label = sv.label
        data.statistics[i].stat_value = sv.value
        if (sv.unit) data.statistics[i].stat_unit = sv.unit
      }
    })
  }

  // ── Photos ──
  const photos = pages.photos
  if (photos) {
    const largePhoto = findSlotValue<PhotoSlotValue>(photos.slots, 'photos-large', 'photo')
    if (largePhoto) {
      if (data.galleryPhotos.length > 0) {
        data.galleryPhotos[0] = { url: largePhoto.url, caption: largePhoto.caption }
      } else {
        data.galleryPhotos.push({ url: largePhoto.url, caption: largePhoto.caption })
      }
    }

    const gridSlots = ['photos-grid-1', 'photos-grid-2', 'photos-grid-3', 'photos-grid-4']
    gridSlots.forEach((slotId, i) => {
      const pv = findSlotValue<PhotoSlotValue>(photos.slots, slotId, 'photo')
      if (pv) {
        const targetIdx = i + 1 // gallery[0] is the large photo
        while (data.galleryPhotos.length <= targetIdx) {
          data.galleryPhotos.push({ url: '', caption: '' })
        }
        data.galleryPhotos[targetIdx] = { url: pv.url, caption: pv.caption }
      }
    })
  }

  // ── Community Voices ──
  const cv = pages.communityVoices
  if (cv) {
    const voiceSlots = ['cv-featured', 'cv-2', 'cv-3', 'cv-4', 'cv-5', 'cv-6']
    const overriddenVoices = voiceSlots
      .map((slotId) => findSlotValue<QuoteSlotValue>(cv.slots, slotId, 'quote'))
      .filter(Boolean)

    if (overriddenVoices.length > 0) {
      // Replace community voices with planner selections
      const newVoices = overriddenVoices.map((qv, i) => ({
        id: qv!.sourceId || `planner-cv-${i}`,
        type: 'story' as const,
        text: qv!.text,
        author: qv!.author,
        role: qv!.role,
        photo_url: qv!.photoUrl || null,
        category: null,
      }))
      // Keep any remaining voices from DB beyond what planner specifies
      const remaining = data.communityVoices.slice(newVoices.length)
      data.communityVoices = [...newVoices, ...remaining]
    }
  }

  // ── Financials ──
  const fin = pages.financials
  if (fin) {
    const income = findSlotValue<StatSlotValue>(fin.slots, 'fin-income', 'stat')
    const expenditure = findSlotValue<StatSlotValue>(fin.slots, 'fin-expenditure', 'stat')
    const net = findSlotValue<StatSlotValue>(fin.slots, 'fin-net', 'stat')

    if ((income || expenditure || net) && data.financials) {
      if (income) data.financials.total_income = parseFloat(income.value.replace(/[^0-9.-]/g, ''))
      if (expenditure) data.financials.total_expenditure = parseFloat(expenditure.value.replace(/[^0-9.-]/g, ''))
      if (net) data.financials.net_result = parseFloat(net.value.replace(/[^0-9.-]/g, ''))
    }
  }

  // ── Next Twenty ──
  const next = pages.nextTwenty
  if (next) {
    const ceoText = findSlotValue<TextSlotValue>(next.slots, 'next-ceo', 'text')
    if (ceoText) {
      data.report.looking_forward = ceoText.content
    }
  }

  return data
}

// ── Helpers ─────────────────────────────────────────────

function findSlotValue<T>(
  slots: { id: string; value: unknown }[] | undefined,
  slotId: string,
  expectedType: string
): T | null {
  if (!slots) return null
  const slot = slots.find((s) => s.id === slotId)
  if (!slot?.value) return null
  const val = slot.value as Record<string, unknown>
  if (val.type !== expectedType) return null
  return val as unknown as T
}
