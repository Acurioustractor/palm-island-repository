/**
 * Organization Management Functions
 * Helper functions for working with organizations, services, and annual reports
 */

import { supabase } from './client';
import type {
  Organization,
  OrganizationWithStats,
  OrganizationService,
  OrganizationMember,
  AnnualReport,
  AnnualReportWithStats,
  AnnualReportStory,
  OrganizationStats,
  StoryForReport,
  CreateOrganizationInput,
  CreateServiceInput,
  CreateAnnualReportInput,
  SelectStoriesForReportParams,
  ReportTemplateDefinition,
} from './types-extended';

// ============================================================================
// ORGANIZATION CRUD
// ============================================================================

/**
 * Get organization by ID
 */
export async function getOrganization(orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (error) throw error;
  return data as Organization;
}

/**
 * Get organization by short name (e.g., 'PICC')
 */
export async function getOrganizationByShortName(shortName: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('short_name', shortName)
    .single();

  if (error) throw error;
  return data as Organization;
}

/**
 * Get organization overview with stats
 */
export async function getOrganizationOverview(orgId: string) {
  const { data, error } = await supabase
    .from('organization_overview')
    .select('*')
    .eq('id', orgId)
    .single();

  if (error) throw error;
  return data as OrganizationWithStats;
}

/**
 * Get all organizations (public ones)
 */
export async function getAllOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('empathy_ledger_enabled', true)
    .order('name');

  if (error) throw error;
  return data as Organization[];
}

/**
 * Create new organization
 */
export async function createOrganization(input: CreateOrganizationInput) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name: input.name,
      organization_type: input.organization_type,
      primary_location: input.primary_location,
      traditional_country: input.traditional_country,
      mission_statement: input.mission_statement,
      website: input.website,
      email: input.email,
      phone: input.phone,
      indigenous_controlled: input.indigenous_controlled ?? true,
      empathy_ledger_enabled: true,
      annual_reports_enabled: true,
      impact_tracking_enabled: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

/**
 * Update organization
 */
export async function updateOrganization(
  orgId: string,
  updates: Partial<Organization>
) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(orgId: string) {
  const { data, error } = await supabase.rpc('get_organization_stats', {
    org_uuid: orgId,
  });

  if (error) throw error;
  return data[0] as OrganizationStats;
}

// ============================================================================
// ORGANIZATION SERVICES
// ============================================================================

/**
 * Get all services for an organization
 */
export async function getOrganizationServices(orgId: string) {
  const { data, error } = await supabase
    .from('organization_services')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('service_name');

  if (error) throw error;
  return data as OrganizationService[];
}

/**
 * Get service by slug
 */
export async function getServiceBySlug(orgId: string, slug: string) {
  const { data, error } = await supabase
    .from('organization_services')
    .select('*')
    .eq('organization_id', orgId)
    .eq('service_slug', slug)
    .single();

  if (error) throw error;
  return data as OrganizationService;
}

/**
 * Create new service
 */
export async function createService(input: CreateServiceInput) {
  const { data, error } = await supabase
    .from('organization_services')
    .insert({
      organization_id: input.organization_id,
      service_name: input.service_name,
      service_slug: input.service_slug,
      service_category: input.service_category,
      description: input.description,
      service_color: input.service_color,
      icon_name: input.icon_name,
      is_active: true,
      staff_count: 0,
      story_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationService;
}

/**
 * Update service story count (called automatically by trigger, but can be used manually)
 */
export async function updateServiceStoryCount(serviceId: string) {
  const { count, error } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', serviceId);

  if (error) throw error;

  const { data: updateData, error: updateError } = await supabase
    .from('organization_services')
    .update({ story_count: count || 0 })
    .eq('id', serviceId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updateData as OrganizationService;
}

// ============================================================================
// ORGANIZATION MEMBERSHIP
// ============================================================================

/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(orgId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('role');

  if (error) throw error;
  return data;
}

/**
 * Add member to organization
 */
export async function addOrganizationMember(
  orgId: string,
  profileId: string,
  role: OrganizationMember['role'],
  permissions: {
    can_approve_stories?: boolean;
    can_manage_reports?: boolean;
    can_view_analytics?: boolean;
    can_manage_members?: boolean;
  } = {}
) {
  const { data, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: orgId,
      profile_id: profileId,
      role,
      ...permissions,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationMember;
}

/**
 * Check if user is member of organization
 */
export async function isOrganizationMember(orgId: string, profileId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('profile_id', profileId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Check if user can manage reports
 */
export async function canManageReports(orgId: string, profileId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('can_manage_reports')
    .eq('organization_id', orgId)
    .eq('profile_id', profileId)
    .eq('is_active', true)
    .single();

  if (error) return false;
  return data.can_manage_reports;
}

// ============================================================================
// ANNUAL REPORTS
// ============================================================================

/**
 * Get all reports for an organization
 */
export async function getOrganizationReports(orgId: string) {
  const { data, error } = await supabase
    .from('annual_reports_with_stats')
    .select('*')
    .eq('organization_id', orgId)
    .order('report_year', { ascending: false });

  if (error) throw error;
  return data as AnnualReportWithStats[];
}

/**
 * Get report by year
 */
export async function getReportByYear(orgId: string, year: number) {
  const { data, error } = await supabase
    .from('annual_reports')
    .select('*')
    .eq('organization_id', orgId)
    .eq('report_year', year)
    .single();

  if (error) throw error;
  return data as AnnualReport;
}

/**
 * Get report with stats
 */
export async function getReportWithStats(reportId: string) {
  const { data, error } = await supabase
    .from('annual_reports_with_stats')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;
  return data as AnnualReportWithStats;
}

/**
 * Create new annual report
 */
export async function createAnnualReport(input: CreateAnnualReportInput) {
  // Calculate reporting period (Jan 1 - Dec 31 of report year)
  const periodStart = `${input.report_year}-01-01`;
  const periodEnd = `${input.report_year}-12-31`;

  const { data, error } = await supabase
    .from('annual_reports')
    .insert({
      organization_id: input.organization_id,
      report_year: input.report_year,
      reporting_period_start: periodStart,
      reporting_period_end: periodEnd,
      title: input.title,
      template_name: input.template_name || 'traditional',
      auto_include_criteria: input.auto_include_criteria || {},
      status: 'planning',
      auto_generated: false,
      views: 0,
      downloads: 0,
      statistics: {},
    })
    .select()
    .single();

  if (error) throw error;
  return data as AnnualReport;
}

/**
 * Update report
 */
export async function updateAnnualReport(
  reportId: string,
  updates: Partial<AnnualReport>
) {
  const { data, error } = await supabase
    .from('annual_reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data as AnnualReport;
}

/**
 * Update report status
 */
export async function updateReportStatus(
  reportId: string,
  status: AnnualReport['status']
) {
  return updateAnnualReport(reportId, { status });
}

/**
 * Publish report
 */
export async function publishReport(reportId: string, profileId: string) {
  const { data, error} = await supabase
    .from('annual_reports')
    .update({
      status: 'published',
      published_date: new Date().toISOString(),
      published_by: profileId,
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data as AnnualReport;
}

// ============================================================================
// STORY SELECTION FOR REPORTS
// ============================================================================

/**
 * Get stories suitable for annual report (using smart selection)
 */
export async function getStoriesForReport(params: SelectStoriesForReportParams) {
  const { data, error } = await supabase.rpc('get_stories_for_report', {
    org_uuid: params.organization_id,
    year_value: params.report_year,
    limit_count: params.max_stories || 50,
  });

  if (error) throw error;
  return data as StoryForReport[];
}

/**
 * Get stories for report with filters
 */
export async function selectStoriesForReport(
  params: SelectStoriesForReportParams
) {
  let query = supabase
    .from('stories')
    .select(`
      id,
      title,
      category,
      views,
      shares,
      likes,
      is_featured,
      is_verified,
      contains_traditional_knowledge,
      created_at
    `)
    .eq('organization_id', params.organization_id)
    .eq('status', 'published')
    .gte(
      'created_at',
      `${params.report_year}-01-01`
    )
    .lte(
      'created_at',
      `${params.report_year}-12-31`
    );

  // Apply category filters
  if (params.categories && params.categories.length > 0) {
    query = query.in('category', params.categories);
  }

  // Get all stories
  const { data, error } = await query;
  if (error) throw error;

  // Calculate scores and sort
  const scored = data.map((story) => {
    const impactScore = story.views + story.shares * 2 + story.likes;
    let relevanceScore = 0.7;

    if (story.is_featured) relevanceScore = 1.0;
    else if (story.is_verified) relevanceScore = 0.9;
    else if (story.contains_traditional_knowledge && params.include_elder_wisdom) {
      relevanceScore = 0.8;
    }

    return {
      story_id: story.id,
      story_title: story.title,
      category: story.category,
      impact_score: impactScore,
      relevance_score: relevanceScore,
    };
  });

  // Sort by relevance and impact
  scored.sort((a, b) => {
    if (a.relevance_score !== b.relevance_score) {
      return b.relevance_score - a.relevance_score;
    }
    return b.impact_score - a.impact_score;
  });

  // Apply limit
  return scored.slice(0, params.max_stories || 50) as StoryForReport[];
}

/**
 * Add story to report
 */
export async function addStoryToReport(
  reportId: string,
  storyId: string,
  options: {
    inclusion_reason?: AnnualReportStory['inclusion_reason'];
    section_placement?: string;
    is_featured?: boolean;
    display_order?: number;
  } = {}
) {
  const { data, error } = await supabase
    .from('annual_report_stories')
    .insert({
      report_id: reportId,
      story_id: storyId,
      inclusion_reason: options.inclusion_reason || 'auto_selected',
      section_placement: options.section_placement,
      is_featured: options.is_featured || false,
      display_order: options.display_order || 0,
      include_full_text: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AnnualReportStory;
}

/**
 * Remove story from report
 */
export async function removeStoryFromReport(reportId: string, storyId: string) {
  const { error } = await supabase
    .from('annual_report_stories')
    .delete()
    .eq('report_id', reportId)
    .eq('story_id', storyId);

  if (error) throw error;
}

/**
 * Get stories in a report
 */
export async function getReportStories(reportId: string) {
  const { data, error } = await supabase
    .from('annual_report_stories')
    .select(`
      *,
      story:stories(*)
    `)
    .eq('report_id', reportId)
    .order('display_order');

  if (error) throw error;
  return data;
}

/**
 * Auto-populate report with selected stories
 */
export async function autoPopulateReport(
  reportId: string,
  params: SelectStoriesForReportParams
) {
  // Get recommended stories
  const stories = await selectStoriesForReport(params);

  // Add each story to the report
  const promises = stories.map((story, index) =>
    addStoryToReport(reportId, story.story_id, {
      inclusion_reason: 'auto_selected',
      display_order: index,
      is_featured: index < 5, // Feature top 5 stories
    })
  );

  await Promise.all(promises);

  // Update report statistics
  await updateAnnualReport(reportId, {
    statistics: {
      total_stories_available: stories.length,
      auto_selected_count: stories.length,
      selection_date: new Date().toISOString(),
    },
  });

  return stories;
}

// ============================================================================
// REPORT TEMPLATES
// ============================================================================

/**
 * Get all public report templates
 */
export async function getReportTemplates() {
  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .eq('is_public', true)
    .order('usage_count', { ascending: false });

  if (error) throw error;
  return data as ReportTemplateDefinition[];
}

/**
 * Get template by name
 */
export async function getReportTemplate(templateName: string) {
  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .eq('template_name', templateName)
    .single();

  if (error) throw error;
  return data as ReportTemplateDefinition;
}

// ============================================================================
// ELDER APPROVAL WORKFLOW
// ============================================================================

/**
 * Request elder approval for report
 */
export async function requestElderApproval(reportId: string, elderIds: string[]) {
  const { data, error } = await supabase
    .from('annual_reports')
    .update({
      elder_approval_required: true,
      status: 'review',
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;

  // TODO: Send notifications to elders
  // This would integrate with your notification system

  return data as AnnualReport;
}

/**
 * Grant elder approval
 */
export async function grantElderApproval(reportId: string, elderId: string) {
  // Get current approvals
  const report = await getReportWithStats(reportId);
  const currentApprovals = report.elder_approvals || [];

  // Add new approval if not already present
  if (!currentApprovals.includes(elderId)) {
    currentApprovals.push(elderId);
  }

  const { data, error } = await supabase
    .from('annual_reports')
    .update({
      elder_approvals: currentApprovals,
      elder_approval_date: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data as AnnualReport;
}

/**
 * Check if report has all required elder approvals
 */
export async function hasRequiredElderApprovals(reportId: string): Promise<boolean> {
  const report = await getReportWithStats(reportId);

  if (!report.elder_approval_required) {
    return true; // No approval required
  }

  const org = await getOrganization(report.organization_id);
  const requiredAdvisors = org.cultural_advisor_ids || [];

  if (requiredAdvisors.length === 0) {
    return true; // No specific advisors required
  }

  const approvals = report.elder_approvals || [];

  // Check if at least one required advisor has approved
  return requiredAdvisors.some((advisorId) => approvals.includes(advisorId));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get PICC organization
 */
export async function getPICCOrganization() {
  return getOrganizationByShortName('PICC');
}

/**
 * Get PICC services
 */
export async function getPICCServices() {
  const picc = await getPICCOrganization();
  return getOrganizationServices(picc.id);
}

/**
 * Increment report views
 */
export async function incrementReportViews(reportId: string) {
  const { error } = await supabase.rpc('increment', {
    table_name: 'annual_reports',
    row_id: reportId,
    column_name: 'views',
  });

  if (error) {
    // Fallback if RPC function doesn't exist
    const report = await getReportWithStats(reportId);
    await updateAnnualReport(reportId, { views: report.views + 1 });
  }
}

/**
 * Increment report downloads
 */
export async function incrementReportDownloads(reportId: string) {
  const { error } = await supabase.rpc('increment', {
    table_name: 'annual_reports',
    row_id: reportId,
    column_name: 'downloads',
  });

  if (error) {
    // Fallback if RPC function doesn't exist
    const report = await getReportWithStats(reportId);
    await updateAnnualReport(reportId, { downloads: report.downloads + 1 });
  }
}
