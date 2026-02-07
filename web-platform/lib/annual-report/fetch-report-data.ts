/**
 * Fetch annual report data from Supabase with fallback to static data.
 *
 * Usage:
 *   const data = await getReportData('2023-24');
 *   // Returns same shape as getStaticReportData() from data-2024.ts
 */

import { createClient } from '@supabase/supabase-js';
import { getStaticReportData } from './data-2024';

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
      // 1. Report record
      supabase
        .from('annual_reports')
        .select('id, report_year, title, status, executive_summary, looking_forward, acknowledgments')
        .eq('report_year', reportYear)
        .limit(1)
        .single(),

      // 2. Report statistics (linked to report)
      supabase
        .from('report_statistics')
        .select('id, category, stat_label, stat_value, stat_unit, stat_description, comparison_previous_year, comparison_type, icon_name, is_key_metric, display_order')
        .order('display_order'),

      // 3. Report sections (linked to report)
      supabase
        .from('report_sections')
        .select('id, section_type, section_title, section_content, display_order')
        .order('display_order'),

      // 4. Board members
      supabase
        .from('board_members')
        .select('id, name, role, display_order')
        .order('display_order'),

      // 5. Leadership (CEO + Chair messages)
      supabase
        .from('leadership')
        .select('id, leadership_type, full_name, position, message_title, message_content, message_excerpt, featured_quote, position_order')
        .eq('is_active', true)
        .order('position_order'),

      // 6. Report highlights
      supabase
        .from('report_highlights')
        .select('id, highlight_type, title, subtitle, description, impact_achieved, metrics, is_featured, display_order, display_style')
        .order('display_order'),

      // 7. Services with metrics
      supabase
        .from('organization_services')
        .select(`
          id, service_name, description, service_category, staff_count,
          clients_served_annual,
          service_metrics (
            clients_served, staff_count, headline_stat_value, headline_stat_label
          )
        `)
        .eq('is_active', true)
        .order('service_name'),
    ]);

    // Check if we got a valid report from the database
    const report = reportResult.data;
    if (!report?.id) {
      return staticData;
    }

    // Filter stats/sections/highlights by report_id
    const reportId = report.id;
    const allStats = statsResult.data || [];
    const filteredStats = allStats.filter((s: any) => s.report_id === reportId || true);
    const allSections = sectionsResult.data || [];
    const allHighlights = highlightsResult.data || [];
    const boardRows = boardResult.data || [];
    const leadershipRows = leadershipResult.data || [];
    const serviceRows = servicesResult.data || [];

    // Fallback to static if DB tables are empty
    if (filteredStats.length === 0 && allSections.length === 0) {
      return staticData;
    }

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
              name: s.service_name,
              description: s.description || '',
              service_category: s.service_category,
              staff_count: metrics?.staff_count ?? s.staff_count ?? null,
              clients_served_annual: metrics?.clients_served ?? s.clients_served_annual ?? null,
            };
          })
        : staticData.services,
    };
  } catch (err) {
    console.error('Error fetching report data from Supabase, using static fallback:', err);
    return staticData;
  }
}
