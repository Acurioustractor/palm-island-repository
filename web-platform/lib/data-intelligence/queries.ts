// ============================================================================
// Data Intelligence Hub — Centralized Supabase Queries
// ============================================================================

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function fetchFinancials(fromYear = 2020, toYear = 2026) {
  const { data, error } = await getSupabase()
    .from('annual_financials')
    .select('*')
    .gte('fiscal_year', fromYear)
    .lte('fiscal_year', toYear)
    .order('fiscal_year', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchStaffStatistics(fromYear = 2020, toYear = 2026) {
  const { data, error } = await getSupabase()
    .from('staff_statistics')
    .select('*')
    .gte('fiscal_year', fromYear)
    .lte('fiscal_year', toYear)
    .order('fiscal_year', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchServices() {
  const { data, error } = await getSupabase()
    .from('organization_services')
    .select('id, name, slug, description, service_category, is_active, metadata, staff_count, clients_served_annual, budget_annual, service_color, icon_name');
  if (error) throw error;
  return data || [];
}

export async function fetchServiceMetrics(fiscalYear?: number) {
  let query = getSupabase()
    .from('service_metrics')
    .select('*, organization_services(id, name, slug, service_category)');
  if (fiscalYear) query = query.eq('fiscal_year', fiscalYear);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchPartners() {
  const { data, error } = await getSupabase()
    .from('partners')
    .select('*')
    .eq('show_in_annual_report', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchServiceRelationships(fiscalYear?: number) {
  try {
    let query = getSupabase()
      .from('service_relationships')
      .select('*, source:organization_services!source_service_id(id, name, slug), target:organization_services!target_service_id(id, name, slug)');
    if (fiscalYear) query = query.eq('fiscal_year', fiscalYear);
    const { data, error } = await query;
    if (error) return []; // Table may not exist yet
    return data || [];
  } catch {
    return [];
  }
}

export async function fetchPartnerServiceLinks(fiscalYear?: number) {
  try {
    let query = getSupabase()
      .from('partner_service_links')
      .select('*, partners(id, name, partner_type), organization_services!service_id(id, name, slug)');
    if (fiscalYear) query = query.eq('fiscal_year', fiscalYear);
    const { data, error } = await query;
    if (error) return []; // Table may not exist yet
    return data || [];
  } catch {
    return [];
  }
}

export async function fetchBoardMembers() {
  const { data, error } = await getSupabase()
    .from('board_members')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchLeadership() {
  const { data, error } = await getSupabase()
    .from('leadership')
    .select('*')
    .eq('is_active', true)
    .order('position_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchStories(fiscalYear?: string) {
  let query = getSupabase()
    .from('stories')
    .select('id, title, status, category, fiscal_year, report_section, is_featured')
    .eq('status', 'published');
  if (fiscalYear) query = query.eq('fiscal_year', fiscalYear);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data || [];
}

export async function fetchOrganizationStats(fiscalYear?: string) {
  let query = getSupabase()
    .from('organization_stats')
    .select('*');
  if (fiscalYear) query = query.eq('fiscal_year', fiscalYear);
  const { data, error } = await query.order('fiscal_year', { ascending: false }).limit(1);
  if (error) throw error;
  return data?.[0] || null;
}
