# PICC Annual Report & Financial Data Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE (Source of Truth)                         │
├────────────────┬───────────────┬──────────────────┬────────────────────────┤
│  FINANCIALS    │  SERVICES     │  CONTENT         │  STAFF & GOV           │
│                │               │                  │                        │
│ annual_        │ organization_ │ stories          │ staff_statistics       │
│  financials    │  services     │ elder_quotes     │ board_members          │
│ annual_        │ service_      │ extracted_quotes │ leadership             │
│  financials_   │  metrics      │ community_       │ annual_reports         │
│  complete ◁───┐│               │  visions         │  (compliance fields)   │
│  (view)    │  ││               │ media_files      │                        │
│            │  ││               │ organization_    │                        │
│  Aggregates│  ││               │  history         │                        │
│  expense   │  ││               │ projects         │                        │
│  breakdown │  ││               │                  │                        │
└────────────┴──┴┴───────────────┴──────────────────┴────────────────────────┘
                 │               │                  │
        ─────────┘    ───────────┘     ─────────────┘
       │                │                    │
       ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATA MODULES (lib/ — shared logic)                     │
├─────────────────────┬────────────────────┬──────────────────────────────────┤
│                     │                    │                                  │
│  get-financials.ts  │ get-service-       │  fetch-report-data.ts           │
│  ─────────────────  │ impact.ts          │  ───────────────────            │
│  getFinancials()    │ ────────────       │  getReportData(fy)              │
│  getLatestFin...()  │ getServiceImpact() │  ┌─ 15+ parallel queries       │
│  parseFiscalYear()  │ ┌─ service_metrics │  ├─ annual_reports             │
│  ┌─ annual_         │ ├─ org_services    │  ├─ report_sections            │
│  │  financials_     │ ├─ staff_stats     │  ├─ board_members              │
│  │  complete view   │ └─ Fallback:       │  ├─ leadership                 │
│  └─ Fallback:       │    current-stats   │  ├─ stories (report_worthy)    │
│     annual_         │                    │  ├─ elder_quotes (validated)    │
│     financials      │                    │  ├─ community_visions          │
│                     │                    │  ├─ media_files                 │
│                     │                    │  ├─ getFinancials() ◁──────┐   │
│                     │                    │  └─ Fallback: data-2024.ts │   │
│                     │                    │                            │   │
├─────────────────────┤                    ├────────────────────────────┘   │
│                     │                    │                                │
│  check-             │ current-stats.ts   │  Reuses getFinancials()        │
│  completeness.ts    │ ────────────────   │  from shared module            │
│  ─────────────────  │ STAFF (static)     │                                │
│  checkComplete-     │ SERVICES (static)  │                                │
│  ness()             │ FINANCIALS (static)│                                │
│  ┌─ org_services    │ MILESTONES (calc)  │                                │
│  ├─ service_metrics │ getLiveStats()     │                                │
│  ├─ stories         │                    │                                │
│  ├─ media_files     │                    │                                │
│  ├─ annual_reports  │                    │                                │
│  └─ extracted_      │                    │                                │
│     quotes          │                    │                                │
└─────────────────────┴────────────────────┴────────────────────────────────┘
       │                │          │                │
       │                │          │                │
       ▼                ▼          ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API ROUTES                                       │
├─────────────────────┬────────────────────┬──────────────────────────────────┤
│                     │                    │                                  │
│  /api/annual-       │ /api/knowledge/    │  /api/pdf/generate              │
│  report-data/       │                    │  ──────────────────             │
│  ──────────────     │ /financial         │  ?type=annual-report            │
│  /financials   ◁────┤ /search            │   → getReportData()            │
│  /trends            │ /timeline          │   → AnnualReportPDF            │
│  /metrics      ◁────┤ /annual-reports    │   → React PDF render           │
│  /progress     ◁────┤                    │   → Buffer → Download          │
│  /curated-voices    │                    │                                  │
│  /board             │                    │  ?type=stories|services|        │
│  /stories           │                    │   history|focus-report|         │
│  /media             │                    │   evidence-package              │
│  /highlights        │                    │   → Respective templates        │
│  /overview (AI)     │                    │                                  │
│                     │                    │                                  │
└─────────────────────┴────────────────────┴──────────────────────────────────┘
       │                     │                      │
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD PAGES (app/picc/)                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │ /picc/financials  │  │ /picc/impact     │  │ /picc/report-readiness   │ │
│  │ ────────────────  │  │ ────────────     │  │ ──────────────────────   │ │
│  │ getFinancials()   │  │ getService-      │  │ checkCompleteness()      │ │
│  │ getLatestFin()    │  │  Impact()        │  │                          │ │
│  │                   │  │                  │  │ ┌─ Overall score (0-100) │ │
│  │ ┌─ Revenue/Exp   │  │ ┌─ 4 StatCards   │  │ ├─ 7 section cards       │ │
│  │ ├─ Expense chart  │  │ │  (YoY delta)  │  │ ├─ Service bar chart     │ │
│  │ ├─ Income trend   │  │ ├─ Clients by   │  │ └─ Gaps list + Fix links │ │
│  │ ├─ Balance sheet  │  │ │  service bar  │  │                          │ │
│  │ ├─ Key ratios     │  │ ├─ Staff comp   │  │  Links to:               │ │
│  │ └─ Audit status   │  │ ├─ Coverage     │  │  /picc/annual-reports    │ │
│  │                   │  │ └─ 20yr journey │  │  /picc/financials        │ │
│  └──────────────────┘  └──────────────────┘  │  /picc/stories           │ │
│                                               │  /picc/media             │ │
│  ┌──────────────────┐  ┌──────────────────┐  └──────────────────────────┘ │
│  │ /picc/reports/    │  │ /picc/annual-    │                               │
│  │  builder          │  │  reports         │  ┌──────────────────────────┐ │
│  │ ────────────────  │  │ ──────────────   │  │ /picc/insights/*         │ │
│  │ getReportData()   │  │ Report listing   │  │ ──────────────────       │ │
│  │ + audience select │  │ + management     │  │ /impact — story metrics  │ │
│  │ → PDF generation  │  │                  │  │ /patterns — categories   │ │
│  └──────────────────┘  └──────────────────┘  │ /timeline — history      │ │
│                                               └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PDF GENERATION                                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  getReportData(fy, audience)                                               │
│       │                                                                    │
│       ▼                                                                    │
│  AnnualReportPDF                                                           │
│  ├─ theme.ts (PICC brand: colors, fonts, A4 dimensions)                   │
│  ├─ register-fonts.ts (Inter + Caveat)                                     │
│  ├─ components/ (StatBox, QuoteBlock, Card, PersonAvatar, ...)             │
│  │                                                                         │
│  │  Audience Filtering: shouldShow(page, audience)                         │
│  │  ┌──────────────────────────────────────────────────────┐               │
│  │  │ Page               │ community │ funder │ board      │               │
│  │  ├──────────────────────────────────────────────────────┤               │
│  │  │ Cover              │    ✓      │   ✓    │   ✓        │               │
│  │  │ Acknowledgement    │    ✓      │   ✓    │   ✓        │               │
│  │  │ Messages           │    ✓      │   ✓    │   ✓        │               │
│  │  │ Numbers            │    ✓      │   ✓    │   ✓        │               │
│  │  │ Photos             │    ✓      │   ─    │   ─        │               │
│  │  │ Community Voices   │    ✓      │   ✓    │   ─        │               │
│  │  │ Compliance         │    ─      │   ✓    │   ✓        │               │
│  │  │ Financial Detail   │    ─      │   ✓    │   ✓        │               │
│  │  │ Directors Report   │    ─      │   ─    │   ✓        │               │
│  │  │ Journey Timeline   │    ✓      │   ✓    │   ─        │               │
│  │  └──────────────────────────────────────────────────────┘               │
│  │                                                                         │
│  └─→ React PDF renderToBuffer() → HTTP Response (PDF download)             │
│                                                                            │
│  Filename: PICC-Annual-Report-{year}-{audience}.pdf                        │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

### Financial Data Path
```
annual_financials (DB) → annual_financials_complete (view)
    → getFinancials() / getLatestFinancials()
        → /picc/financials (dashboard)
        → /api/annual-report-data/financials (API)
        → getReportData() → AnnualReportPDF (PDF)
        → getFinancialSummary() (chat tool)
```

### Service Impact Path
```
service_metrics + organization_services + staff_statistics (DB)
    → getServiceImpact()
        → /picc/impact (dashboard)
    → checkCompleteness()
        → /picc/report-readiness (dashboard)
    → getReportData() → AnnualReportPDF (services page)
```

### Content Readiness Path
```
7 checks across 6 tables:
    CEO Message      ← annual_reports.leadership_message
    Chair Message    ← annual_reports.acknowledgments
    Financial Data   ← annual_financials (FY match)
    Community Voices ← extracted_quotes (count)
    Gallery Photos   ← media_files tagged 'annual-report' (≥5)
    Elder Quotes     ← extracted_quotes (Aunty/Uncle/Elder)
    Board Photos     ← media_files tagged 'board-member' (≥3)

Per-service checks (7 each):
    description, cover_photo, gps, metrics, stories, notes, grants

    → checkCompleteness() → /picc/report-readiness
```

## Key Shared Dependencies

| Module | Used By |
|--------|---------|
| `getFinancials()` | financials page, report data, PDF, chat tool, trends API |
| `parseFiscalYear()` | all modules converting '2024-25' → 2025 (integer) |
| `current-stats.ts` | fallback for impact, PDF, public pages |
| `getReportData()` | report builder, PDF generation, annual report data APIs |
| `checkCompleteness()` | report readiness page, progress API |

## Fiscal Year Convention

- **Display**: `'2024-25'` (July 2024 – June 2025)
- **Database**: `2025` (integer, end year)
- **Conversion**: `parseFiscalYear('2024-25')` → `2025`
- **Reverse**: `formatFiscalYear(2025)` → `'2024-25'`
