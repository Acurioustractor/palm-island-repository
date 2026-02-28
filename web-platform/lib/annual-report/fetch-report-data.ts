/**
 * Fetch annual report data from Supabase with fallback to static data.
 *
 * Usage:
 *   const data = await getReportData('2023-24');
 *   // Returns same shape as getStaticReportData() from data-2024.ts
 */

import { createClient } from '@supabase/supabase-js';
import { getStaticReportData } from './data-2024';
import { getFinancials, parseFiscalYear } from '@/lib/financials/get-financials';
import { getPagePhotos, type PagePhotoMap } from './page-photos';
import { assignVoicesToPages, type VoiceAssignments } from './voice-assignments';

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface ComplianceData {
  auditor_name: string | null;
  auditor_firm: string | null;
  audit_opinion: string;
  icn_number: string | null;
  members_count: number | null;
  agm_date: string | null;
  board_meetings_held: number | null;
  directors_declaration: string | null;
  revenue_by_funder: Array<{ funder: string; amount: number; percentage: number }>;
  prior_year_financials: {
    total_income: number;
    total_expenditure: number;
    net_result: number;
  } | null;
}

export interface CommunityVoice {
  id: string;
  type: 'story' | 'elder_quote' | 'community_vision' | 'feedback';
  text: string;
  author: string | null;
  role: string | null;
  photo_url: string | null;
  category: string | null;
}

export interface ReportData {
  report: {
    id: string;
    report_year: number;
    title: string;
    status: string;
    executive_summary: string;
    looking_forward: string;
    acknowledgments: string;
  };
  compliance: ComplianceData;
  statistics: Array<{
    id: string;
    category: string;
    stat_label: string;
    stat_value: string;
    stat_unit?: string;
    stat_description?: string;
    comparison_previous_year?: string;
    comparison_type?: string;
    icon_name?: string | null;
    is_key_metric: boolean;
    display_order: number;
  }>;
  sections: Array<{
    id: string;
    section_type: string;
    section_title: string;
    section_content: string;
    display_order: number;
    featured_quote?: string | null;
    quote_author?: string | null;
    quote_author_title?: string | null;
  }>;
  boardMembers: Array<{
    id: string;
    full_name: string;
    position: string;
    bio: string | null;
    photo_url: string | null;
    display_order: number;
  }>;
  leadershipMessages: Array<{
    id: string;
    role: string;
    person_name: string;
    person_title: string;
    message_title: string;
    message_content: string;
    message_excerpt: string;
    featured_quote: string;
    photo_url: string | null;
    display_order: number;
  }>;
  highlights: Array<{
    id: string;
    highlight_type: string;
    title: string;
    subtitle: string;
    description: string;
    impact_achieved: string;
    metrics: Record<string, any>;
    is_featured: boolean;
    display_order: number;
    display_style: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description: string;
    service_category: string;
    staff_count: number | null;
    clients_served_annual: number | null;
  }>;
  coverPhoto: { url: string; caption?: string } | null;
  galleryPhotos: Array<{ url: string; caption?: string }>;
  financials: {
    total_income: number;
    total_expenditure: number;
    net_result: number;
    breakdown: Array<{ category: string; amount: number; percentage: number }>;
  } | null;
  innovationProjects: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    hero_image_url?: string | null;
    impact_summary?: string | null;
  }>;
  communityVoices: CommunityVoice[];
  historyEras: Array<{
    name: string;
    year_start: number;
    year_end: number | null;
    description: string;
    milestones: string[];
  }>;
  resilienceStories: {
    title: string;
    subtitle: string;
    gubbal: { text: string; attribution: string; culturalNote: string };
    traditionalWisdom: string[];
    timeline: Array<{ year: string; event: string; detail: string }>;
    magnificentSeven: Array<{ name: string; role: string }>;
    climateData: Array<{ metric: string; current: string; projected: string }>;
  } | null;
  pagePhotos: PagePhotoMap;
  voiceAssignments: VoiceAssignments;
}

/**
 * Fetch all annual report data for a given fiscal year from Supabase.
 * Falls back to static data-2024.ts when the database is empty or unavailable.
 */
export async function getReportData(fiscalYear?: string): Promise<ReportData> {
  const staticData = getStaticReportData();
  const supabase = createServiceClient();

  if (!supabase) {
    return staticData;
  }

  // Determine report year from fiscal year string (e.g., '2023-24' -> 2024)
  const fy = fiscalYear || '2023-24';
  const reportYear = parseInt(fy.split('-')[0], 10) + 1;

  try {
    const [
      reportResult,
      statsResult,
      sectionsResult,
      boardResult,
      leadershipResult,
      highlightsResult,
      servicesResult,
    ] = await Promise.all([
      // 1. Report record (including compliance fields)
      supabase
        .from('annual_reports')
        .select('id, report_year, title, status, executive_summary, looking_forward, acknowledgments, auditor_name, auditor_firm, audit_opinion, icn_number, members_count, agm_date, board_meetings_held, directors_declaration, revenue_by_funder, prior_year_financials')
        .eq('report_year', reportYear)
        .limit(1)
        .single(),

      // 2. Report statistics (linked to report)
      supabase
        .from('report_statistics')
        .select('id, report_id, category, stat_label, stat_value, stat_unit, stat_description, comparison_previous_year, comparison_type, icon_name, is_key_metric, display_order')
        .order('display_order'),

      // 3. Report sections (linked to report)
      supabase
        .from('report_sections')
        .select('id, report_id, section_type, section_title, section_content, display_order')
        .order('display_order'),

      // 4. Board members
      supabase
        .from('board_members')
        .select('id, name, role, photo_url, display_order')
        .order('display_order'),

      // 5. Leadership (CEO + Chair messages)
      supabase
        .from('leadership')
        .select('id, leadership_type, full_name, position, photo_url, message_title, message_content, message_excerpt, featured_quote, position_order')
        .eq('is_active', true)
        .order('position_order'),

      // 6. Report highlights
      supabase
        .from('report_highlights')
        .select('id, report_id, highlight_type, title, subtitle, description, impact_achieved, metrics, is_featured, display_order, display_style')
        .order('display_order'),

      // 7. Services with metrics
      supabase
        .from('organization_services')
        .select(`
          id, name, description, service_category, staff_count,
          clients_served_annual,
          service_metrics (
            clients_served, staff_count, headline_stat_value, headline_stat_label
          )
        `)
        .eq('is_active', true)
        .order('name'),
    ]);

    // Check if we got a valid report from the database
    const report = reportResult.data;
    if (!report?.id) {
      return staticData;
    }

    // Filter stats/sections/highlights by report_id
    const reportId = report.id;
    const allStats = statsResult.data || [];
    const filteredStats = allStats.filter((s: any) => s.report_id === reportId);
    const allSections = (sectionsResult.data || []).filter((s: any) => s.report_id === reportId);
    const allHighlights = (highlightsResult.data || []).filter((h: any) => h.report_id === reportId);
    const boardRows = boardResult.data || [];
    const leadershipRows = leadershipResult.data || [];
    const serviceRows = servicesResult.data || [];

    // Fallback to static if DB tables are empty
    if (filteredStats.length === 0 && allSections.length === 0) {
      return staticData;
    }

    // Fetch additional data: cover photo, gallery, financials, innovation projects, community voices, history
    const [coverResult, galleryResult, financialsResult, innovationResult, storiesResult, elderQuotesResult, visionsResult, historyResult] = await Promise.all([
      // Cover photo — tagged 'annual-report-cover', prefer featured
      supabase
        .from('media_files')
        .select('storage_url, caption')
        .contains('tags', ['annual-report-cover'])
        .order('is_featured', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Gallery photos — tagged 'annual-report', featured first
      supabase
        .from('media_files')
        .select('storage_url, caption')
        .contains('tags', ['annual-report'])
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6),

      // Financials for the fiscal year — use shared module with correct integer conversion
      getFinancials({ fiscalYear: fy, limit: 1 }).then(records => ({
        data: records[0] ?? null,
        error: null,
      })),

      // Innovation projects
      supabase
        .from('projects')
        .select('id, name, description, status, hero_image_url, tagline')
        .in('status', ['active', 'Active', 'planning', 'Planning', 'in_progress', 'In Progress'])
        .order('name')
        .limit(8),

      // Report-worthy stories for community voices
      supabase
        .from('stories')
        .select('id, title, content, quote_text, quote_attribution, featured_image_url, category, excerpt')
        .eq('status', 'published')
        .eq('report_worthy', true)
        .order('quality_score', { ascending: false })
        .limit(6),

      // Elder quotes (validated, public) — column names: text, speaker_name, speaker_role
      supabase
        .from('elder_quotes')
        .select('id, text, speaker_name, speaker_role')
        .eq('is_validated', true)
        .eq('permission_level', 'public')
        .limit(6),

      // Community visions (approved)
      supabase
        .from('community_visions')
        .select('id, vision_text, author_name, author_role, category, is_approved')
        .eq('is_approved', true)
        .limit(6),

      // History eras for journey timeline
      supabase
        .from('organization_history')
        .select('id, era_name, year_start, year_end, description, milestones')
        .order('year_start'),
    ]);

    const coverPhoto = coverResult.data
      ? { url: coverResult.data.storage_url, caption: coverResult.data.caption || undefined }
      : null;

    const galleryPhotos = (galleryResult.data || []).map((p: any) => ({
      url: p.storage_url,
      caption: p.caption || undefined,
    }));

    const finRecord = financialsResult.data as import('@/lib/financials/get-financials').FinancialRecord | null
    const financials = finRecord
      ? {
          total_income: finRecord.total_income,
          total_expenditure: finRecord.total_expenditure,
          net_result: finRecord.net_result,
          breakdown: Object.entries(finRecord.expense_breakdown).map(([category, amount]) => ({
            category: category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            amount,
            percentage: finRecord.total_expenditure > 0
              ? Math.round((amount / finRecord.total_expenditure) * 100)
              : 0,
          })),
        }
      : null;

    const innovationProjects = (innovationResult.data || []).map((p: any) => ({
      id: p.id,
      title: p.name,
      description: p.description || '',
      status: p.status || 'active',
      hero_image_url: p.hero_image_url || null,
      impact_summary: p.tagline || null,
    }));

    // Build community voices from multiple sources
    const communityVoices: CommunityVoice[] = [
      ...(storiesResult.data || []).map((s: any) => ({
        id: s.id,
        type: 'story' as const,
        text: s.quote_text || s.excerpt || (s.content ? s.content.slice(0, 200) + '...' : s.title),
        author: s.quote_attribution || null,
        role: null,
        photo_url: s.featured_image_url || null,
        category: s.category || null,
      })),
      ...(elderQuotesResult.data || []).map((q: any) => ({
        id: q.id,
        type: 'elder_quote' as const,
        text: q.text,
        author: q.speaker_name || null,
        role: q.speaker_role || 'Elder',
        photo_url: null,
        category: null,
      })),
      ...(visionsResult.data || []).map((v: any) => ({
        id: v.id,
        type: 'community_vision' as const,
        text: v.vision_text,
        author: v.author_name || null,
        role: v.author_role || 'Community Member',
        photo_url: null,
        category: v.category || null,
      })),
    ];

    // Build compliance data from report record
    const compliance: ComplianceData = {
      auditor_name: report.auditor_name || null,
      auditor_firm: report.auditor_firm || null,
      audit_opinion: report.audit_opinion || 'unqualified',
      icn_number: report.icn_number || null,
      members_count: report.members_count || null,
      agm_date: report.agm_date || null,
      board_meetings_held: report.board_meetings_held || null,
      directors_declaration: report.directors_declaration || null,
      revenue_by_funder: report.revenue_by_funder || [],
      prior_year_financials: report.prior_year_financials || null,
    };

    // History eras
    const historyEras = (historyResult.data || []).map((e: any) => ({
      name: e.era_name,
      year_start: e.year_start,
      year_end: e.year_end || null,
      description: e.description || '',
      milestones: e.milestones || [],
    }));

    return {
      report: {
        id: report.id,
        report_year: report.report_year,
        title: report.title || staticData.report.title,
        status: report.status || 'published',
        executive_summary: report.executive_summary || staticData.report.executive_summary,
        looking_forward: report.looking_forward || staticData.report.looking_forward,
        acknowledgments: report.acknowledgments || staticData.report.acknowledgments,
      },

      statistics: filteredStats.length > 0
        ? filteredStats.map((s: any) => ({
            id: s.id,
            category: s.category,
            stat_label: s.stat_label,
            stat_value: s.stat_value,
            stat_unit: s.stat_unit,
            stat_description: s.stat_description,
            comparison_previous_year: s.comparison_previous_year,
            comparison_type: s.comparison_type,
            icon_name: s.icon_name,
            is_key_metric: s.is_key_metric,
            display_order: s.display_order,
          }))
        : staticData.statistics,

      sections: allSections.length > 0
        ? allSections.map((s: any) => ({
            id: s.id,
            section_type: s.section_type,
            section_title: s.section_title,
            section_content: s.section_content || '',
            display_order: s.display_order,
            featured_quote: null,
            quote_author: null,
            quote_author_title: null,
          }))
        : staticData.sections,

      boardMembers: boardRows.length > 0
        ? boardRows.map((b: any) => ({
            id: b.id,
            full_name: b.name,
            position: b.role,
            bio: null,
            photo_url: b.photo_url || null,
            display_order: b.display_order,
          }))
        : staticData.boardMembers,

      leadershipMessages: leadershipRows.length > 0
        ? leadershipRows.map((l: any) => ({
            id: l.id,
            role: l.leadership_type === 'executive' ? 'ceo' : 'chair',
            person_name: l.full_name,
            person_title: l.position,
            message_title: l.message_title || '',
            message_content: l.message_content || '',
            message_excerpt: l.message_excerpt || '',
            featured_quote: l.featured_quote || '',
            photo_url: l.photo_url || null,
            display_order: l.position_order,
          }))
        : staticData.leadershipMessages,

      highlights: allHighlights.length > 0
        ? allHighlights.map((h: any) => ({
            id: h.id,
            highlight_type: h.highlight_type,
            title: h.title,
            subtitle: h.subtitle || '',
            description: h.description || '',
            impact_achieved: h.impact_achieved || '',
            metrics: h.metrics || {},
            is_featured: h.is_featured,
            display_order: h.display_order,
            display_style: h.display_style || 'card',
          }))
        : staticData.highlights,

      services: serviceRows.length > 0
        ? serviceRows.map((s: any) => {
            const metrics = Array.isArray(s.service_metrics) ? s.service_metrics[0] : s.service_metrics;
            return {
              id: s.id,
              name: s.name,
              description: s.description || '',
              service_category: s.service_category,
              staff_count: metrics?.staff_count ?? s.staff_count ?? null,
              clients_served_annual: metrics?.clients_served ?? s.clients_served_annual ?? null,
            };
          })
        : staticData.services,

      coverPhoto,
      galleryPhotos,
      financials,
      innovationProjects,
      communityVoices,
      compliance,
      historyEras,
      resilienceStories: staticData.resilienceStories,
      pagePhotos: getPagePhotos(fy),
      voiceAssignments: assignVoicesToPages(communityVoices),
    };
  } catch (err) {
    console.error('Error fetching report data from Supabase, using static fallback:', err);
    return staticData;
  }
}
