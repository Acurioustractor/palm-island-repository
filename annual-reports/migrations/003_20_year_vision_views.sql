-- Migration: 20-Year Vision Data Views
-- Creates convenient views for timeline visualizations and countdown metrics

-- View 1: Annual Report Timeline (All Years)
CREATE OR REPLACE VIEW annual_report_timeline AS
SELECT 
    ke.fiscal_year,
    ke.title,
    ke.summary,
    ke.keywords,
    ke.created_at as indexed_at,
    CASE 
        WHEN ke.fiscal_year BETWEEN '2009-10' AND '2012-13' THEN 'Foundation'
        WHEN ke.fiscal_year BETWEEN '2013-14' AND '2018-19' THEN 'Growth'
        WHEN ke.fiscal_year BETWEEN '2019-20' AND '2020-21' THEN 'Transition'
        WHEN ke.fiscal_year >= '2021-22' THEN 'Community-Led'
    END as era,
    CASE 
        WHEN ke.fiscal_year BETWEEN '2009-10' AND '2012-13' THEN '#F59E0B'
        WHEN ke.fiscal_year BETWEEN '2013-14' AND '2018-19' THEN '#8B5CF6'
        WHEN ke.fiscal_year BETWEEN '2019-20' AND '2020-21' THEN '#10B981'
        WHEN ke.fiscal_year >= '2021-22' THEN '#3B82F6'
    END as era_color
FROM knowledge_entries ke
WHERE ke.entry_type = 'document'
  AND ke.category = 'annual-report'
  AND ke.fiscal_year IS NOT NULL
ORDER BY ke.fiscal_year;

-- View 2: 20-Year Progress Metrics
CREATE OR REPLACE VIEW progress_to_20_years AS
WITH current_stats AS (
    SELECT 
        197 as current_staff,  -- From staff_statistics 2024
        16 as current_services,  -- From services count
        82.2 as current_indigenous_pct,
        77 as current_stories,  -- From stories count
        24 as current_partners   -- From partners count
),
year_progress AS (
    SELECT 
        '2009-07-01'::date as start_date,
        '2029-07-01'::date as target_date,
        CURRENT_DATE as today
)
SELECT 
    -- Time calculations
    yp.start_date,
    yp.target_date,
    yp.today,
    EXTRACT(YEAR FROM AGE(yp.today, yp.start_date)) as years_elapsed,
    EXTRACT(YEAR FROM AGE(yp.target_date, yp.today)) as years_remaining,
    ROUND(
        EXTRACT(EPOCH FROM AGE(yp.today, yp.start_date)) / 
        EXTRACT(EPOCH FROM AGE(yp.target_date, yp.start_date)) * 100, 
        1
    ) as percent_complete,
    
    -- Current metrics
    cs.current_staff,
    cs.current_services,
    cs.current_indigenous_pct,
    cs.current_stories,
    cs.current_partners,
    
    -- 2029 targets
    300 as target_staff,
    20 as target_services,
    85.0 as target_indigenous_pct,
    150 as target_stories,
    35 as target_partners,
    
    -- Progress to targets
    ROUND(cs.current_staff::numeric / 300 * 100, 1) as staff_progress_pct,
    ROUND(cs.current_services::numeric / 20 * 100, 1) as services_progress_pct,
    ROUND(cs.current_stories::numeric / 150 * 100, 1) as stories_progress_pct

FROM year_progress yp
CROSS JOIN current_stats cs;

-- View 3: Services Evolution (Year over Year)
CREATE OR REPLACE VIEW services_evolution AS
SELECT 
    s.name as service_name,
    s.category,
    s.description,
    s.established_date,
    EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM s.established_date) as years_operating,
    sm.fiscal_year,
    sm.clients_served,
    sm.occasions_of_service,
    sm.key_achievements,
    LAG(sm.clients_served) OVER (PARTITION BY s.id ORDER BY sm.fiscal_year) as prev_year_clients,
    CASE 
        WHEN LAG(sm.clients_served) OVER (PARTITION BY s.id ORDER BY sm.fiscal_year) > 0
        THEN ROUND(
            (sm.clients_served - LAG(sm.clients_served) OVER (PARTITION BY s.id ORDER BY sm.fiscal_year))::numeric / 
            LAG(sm.clients_served) OVER (PARTITION BY s.id ORDER BY sm.fiscal_year) * 100, 
            1
        )
        ELSE NULL
    END as growth_pct
FROM services s
LEFT JOIN service_metrics sm ON s.id = sm.service_id
ORDER BY s.name, sm.fiscal_year;

-- View 4: Innovation Highlights Timeline
CREATE OR REPLACE VIEW innovation_highlights AS
SELECT 
    'staff_growth' as category,
    year::text as period,
    total_staff as metric_value,
    'Staff employed' as metric_label,
    'people' as unit,
    '#3B82F6' as color
FROM staff_statistics

UNION ALL

SELECT 
    'indigenous_employment' as category,
    year::text as period,
    ROUND(indigenous_staff::numeric / total_staff * 100, 1) as metric_value,
    'Indigenous employment' as metric_label,
    'percent' as unit,
    '#10B981' as color
FROM staff_statistics

UNION ALL

SELECT 
    'stories_collected' as category,
    EXTRACT(YEAR FROM created_at)::text as period,
    COUNT(*)::numeric as metric_value,
    'Community stories' as metric_label,
    'count' as unit,
    '#F59E0B' as color
FROM stories
WHERE status = 'published'
GROUP BY EXTRACT(YEAR FROM created_at)

UNION ALL

SELECT 
    'annual_report_pages' as category,
    fiscal_year as period,
    COUNT(*)::numeric as metric_value,
    'Report pages digitized' as metric_label,
    'count' as unit,
    '#8B5CF6' as color
FROM knowledge_entries
WHERE entry_type = 'document'
  AND category = 'annual-report'
GROUP BY fiscal_year;

-- View 5: Community Impact Summary
CREATE OR REPLACE VIEW community_impact_summary AS
SELECT 
    'FY2024' as reporting_period,
    (SELECT SUM(clients_served) FROM service_metrics WHERE fiscal_year = '2024') as total_clients_served,
    (SELECT SUM(occasions_of_service) FROM service_metrics WHERE fiscal_year = '2024') as total_service_occasions,
    (SELECT COUNT(*) FROM stories WHERE status = 'published') as total_stories_collected,
    (SELECT COUNT(*) FROM media_files WHERE file_type = 'image') as total_photos,
    (SELECT COUNT(DISTINCT storyteller_id) FROM stories WHERE status = 'published') as unique_storytellers,
    (SELECT COUNT(*) FROM partners) as partner_organizations,
    (SELECT COUNT(*) FROM services) as active_services;

-- Add comments for documentation
COMMENT ON VIEW annual_report_timeline IS 'Complete timeline of annual reports with era categorization for 20-year visualization';
COMMENT ON VIEW progress_to_20_years IS 'Current progress metrics toward 2029 20-year anniversary goals';
COMMENT ON VIEW services_evolution IS 'Year-over-year service metrics showing growth and impact';
COMMENT ON VIEW innovation_highlights IS 'Key innovation metrics for timeline visualization';
COMMENT ON VIEW community_impact_summary IS 'High-level community impact summary for dashboards';
