# PICC Annual Report System - Audit Findings

## Current System Overview

The annual report system has multiple components:

### 1. Public-Facing Pages
- `/annual-report/live` - Interactive live report with real-time data
- `/annual-report/[year]` - Year-specific reports (2024-25, etc.)
- `/annual-report/gallery` - Photo gallery from reports
- `/annual-reports` - Timeline view of all reports

### 2. Admin Interfaces
- `/picc/annual-report-data` - Main data dashboard (10+ panels)
- `/picc/annual-reports` - Reports list & management
- `/picc/reports/builder` - Report builder
- `/picc/reports/planner` - Page-by-page planner
- `/picc/reports/composer` - Content composer
- `/picc/report-readiness` - Content readiness checker

### 3. Data Sources
- `fetch-live-report-data.ts` - Main data fetcher
- `fetch-report-data.ts` - Report data composer
- `planner-config.ts` - Page/section configuration
- `audience-config.ts` - Audience-specific configs

### 4. Content Types
- Stories (linked to reports)
- Quotes (curated, elder)
- Photos (tagged annual-report + fy:YYYY-YY)
- Services (metrics, achievements)
- Financials
- Board/Leadership

---

## Identified Gaps & Issues

### Critical Gaps

1. **No automated content discovery** - Staff manually tag stories/photos for reports
2. **No evidence-outcome linking** - Stories not connected to grant outcomes
3. **No grant deadline tracking** - Can't see what's due when
4. **Content readiness is manual** - No auto-detection of missing data

### Automation Opportunities

| Current State | Opportunity |
|---------------|--------------|
| Manual story linking | Auto-link stories by service/date |
| Manual photo tagging | Auto-tag based on metadata |
| Manual quote curation | Auto-select high-impact quotes |
| No deadline alerts | Grant deadline notifications |
| No completion tracking | Auto-progress dashboards |

### System Complexity Issues

1. **10+ admin panels** - Too many places to manage
2. **Inconsistent data sources** - Some via API, some direct DB
3. **No unified workflow** - Story collection → report is fragmented

---

## Recommendations

### Quick Wins (1-2 weeks)
1. Add "auto-assign to report" based on service/date
2. Create unified "What we need for [FY] report" checklist
3. Add deadline countdown to admin dashboard

### Medium-term (1-2 months)
1. Build evidence pipeline linking stories → grant outcomes
2. Auto-generate "monthly report digest" for leadership
3. Create story capture workflow from chat feedback

### Long-term (3-6 months)
1. Unified admin interface (all-in-one dashboard)
2. Predictive analytics for report readiness
3. AI-generated first draft from data

---

## Next Step

Would you like me to:
1. **Fix specific issues** - Address particular gaps I found?
2. **Build automation** - Create auto-linking or deadline tracking?
3. **Simplify admin** - Consolidate the 10+ panels?
4. **Build evidence pipeline** - Connect stories to grant outcomes?

What would be most valuable?