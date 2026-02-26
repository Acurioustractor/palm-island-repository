# PRD 1: Visual Report Composer + GHL Distribution

**Status**: Phase 1 Built (Composer UI), Phase 2 Planned (Distribution)
**Priority**: P0
**Owner**: PICC Digital Team

---

## Problem

PICC produces annual impact reports for multiple audiences (community, funders, government, board, supporters). The current process is manual, time-consuming, and produces a single PDF that tries to serve everyone. Different audiences need different emphasis: funders want compliance and outcomes data, community wants stories and photos, board wants governance and financials.

Staff with low tech literacy need to compose these reports without design skills or developer assistance.

## Solution

### Phase 1: Visual Report Composer (BUILT)

A "Canva-like" visual composer at `/picc/reports/composer/` that lets staff:
- See all 20 report pages as visual cards in a horizontal strip
- Tap any page to see an A4 preview with tappable content slots
- Pick photos, quotes, stats, and text from a side panel
- Switch audience to show/hide pages relevant to that audience
- Auto-save every change, generate PDF on demand

**Architecture**: New UI shell reusing 100% of existing backend:
- All types from `planner-types.ts`
- All page configs from `planner-config.ts` (20 pages, slot factories, accent colors)
- All API routes under `/api/report-planner/`
- Existing pickers (PhotoPicker, QuotePicker, StatEditor, TextEditor)
- `planner-to-report-data.ts` PDF bridge

**Files created**:
- `app/picc/reports/composer/page.tsx`
- `app/picc/reports/composer/ComposerClient.tsx`
- `app/picc/reports/composer/components/PageStrip.tsx`
- `app/picc/reports/composer/components/PagePreview.tsx`
- `app/picc/reports/composer/components/ContentPickerPanel.tsx`
- `app/picc/reports/composer/components/SlotCard.tsx`

### Phase 2: GHL Distribution Layer

After a report is composed and PDF generated, distribute it through GoHighLevel:

#### 2A. Audience-Specific Distribution Lists
- Map PICC audiences to GHL contact tags/lists:
  - `community` -> GHL tag "Community Members"
  - `funder` -> GHL tag "Funding Partners"
  - `supporter` -> GHL tag "Supporters & Donors"
  - `board` -> GHL tag "Board Members"
  - `government` -> GHL tag "Government Partners"
- One-click "Send to [Audience]" button in Composer

#### 2B. GHL Campaign Templates
- Pre-built GHL email templates for report distribution
- Each audience gets a different cover email:
  - **Community**: "See what we achieved together this year"
  - **Funders**: "Your investment in action — FY2024-25 Impact Report"
  - **Government**: "Annual Compliance Report — PICC FY2024-25"
  - **Board**: "Board Pack — Annual Report & Governance Review"
- PDF attached or hosted link with tracking

#### 2C. Interactive Report Landing Pages
- Generate a web-based report viewer (not just PDF)
- Shareable link per audience version
- Track opens, time spent, section views
- Feed engagement data back to GHL contact records

#### 2D. Follow-Up Automation
- GHL workflow triggers after report delivery:
  - If funder opens report -> schedule follow-up call (3 days)
  - If supporter doesn't open after 7 days -> reminder email
  - If board member views governance section -> flag for discussion
  - Community opens -> prompt to share their story

## Technical Requirements

### Phase 2 API Surface

| Endpoint | Purpose |
|----------|---------|
| `POST /api/reports/distribute` | Trigger GHL campaign for audience |
| `GET /api/reports/tracking/:id` | Get engagement metrics for a report |
| `POST /api/ghl/webhook/report-engagement` | Receive GHL engagement events |

### GHL Integration Points

| GHL Feature | PICC Usage |
|-------------|------------|
| Contacts & Tags | Audience segmentation |
| Email Campaigns | Report distribution |
| Workflows | Follow-up automation |
| Tracking/Analytics | Engagement monitoring |
| Custom Fields | Report history per contact |

## Success Metrics

- Time to compose a report: < 30 minutes (from hours)
- Report distribution: < 5 minutes after generation
- Audience-specific open rates tracked per version
- Follow-up actions triggered automatically

## Dependencies

- GHL API integration (contacts, campaigns, workflows)
- Supabase storage for generated PDFs
- Vercel for hosted report viewer pages

## Risks

- GHL API rate limits for large contact lists
- PDF size limits for email attachment (fallback: hosted link)
- Staff training on the Composer UI

---

## Implementation Phases

| Phase | What | Status |
|-------|------|--------|
| 1 | Visual Report Composer UI | Done |
| 2A | GHL audience mapping | Planned |
| 2B | Email campaign templates | Planned |
| 2C | Interactive web report viewer | Planned |
| 2D | Follow-up automation workflows | Planned |
