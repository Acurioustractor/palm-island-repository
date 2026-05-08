# Plan — Printed Annual Report 2024-25 (Pencil)

## Decision

**The annual report is designed in Pencil and exported to PDF for
print. It does not render through the app.**

Confirmed by Ben on 2026-05-09 after the runtime React-PDF endpoint
was found to hang at production scale. This is the right call —
Pencil is built for layout-heavy editorial work, the platform is
the data source, and the two are aligned through shared tokens.

## Context

Two surfaces, clear roles:

- **Pencil** (`picc-annual-report.pen`) — design source of truth for
  the printed annual report. Cover, spreads, photography, typography,
  brand chrome, finals. Exports the print-ready PDF.
- **Platform** (picc.studio) — live data source. Services, projects,
  storytellers, voices, themes. The book pulls from here visually,
  but the layout is Pencil's job.

Both share the Saltwater & Earth palette through Style Dictionary:
`tokens/picc.tokens.json` → web (`lib/design-tokens/`) and Pencil
imports the same JSON. Palette never drifts between digital and print.

## Pencil workflow

1. Open `picc-almanac-web.pen`'s sibling: `picc-annual-report.pen`.
2. Cover, spreads, and back pull from the Pencil variables already
   bound to brand tokens (palette, type, spacing).
3. Photography is selected from EL canonical (per-page slot tags) —
   exported from picc.studio at print resolution and dropped into
   the Pencil document.
4. Data callouts (numbers, quotes, service descriptions) are read
   from picc.studio surfaces (e.g. `/picc/annual-report-data`) and
   typed into the Pencil layout — not auto-bound, by design, so an
   editor can frame each number with the right context.
5. Pencil exports a PDF. That PDF is the print master.
6. Optional: upload the master to Supabase Storage and link from
   `/annual-reports` for public download.

## Why not runtime PDF for the annual report

React-PDF v4 + Vercel serverless can render small documents
reliably (stories PDF, focus reports, services PDF — all working
today, all under ~12KB). The full annual report at 50+ pages with
dozens of SVG stat boxes and photo embeds exceeds the lambda
budget — the endpoint opens TCP but never returns. This is a
known-brittle scenario that doesn't need fixing because Pencil
is the right tool for editorial print.

The React-PDF code stays in the repo as a draft tool for smaller
publications and as the audience-config harness if a runtime path
is ever needed for short bookmarks. It's not on the Tuesday path.

## What stays out of scope this week

- **Pencil edits from code.** Pencil is the design source of truth;
  we don't drive it from PICC. Manual sync if palette tokens drift.
- **WeasyPrint legacy pipeline.** Still in `annual-reports/` folder.
  Deprecated — React-PDF is canonical. Don't touch it.
- **Phase 2-5 EL canonical migration.** Already parked.
- **Vercel font v4 base64-inline workaround.** Current `/tmp` filesystem
  approach has been working in production for the other PDF types.
  If FY24-25 print run hits the v4 font bug, fall back to v3.0.4 — but
  only if needed. Don't pre-emptively downgrade.

## Reference: data sources for the report

Per page (audited 2026-05-09):

| Block            | Source                          | Drift risk |
|------------------|---------------------------------|------------|
| Cover            | static (`data-2025.ts`)         | low        |
| Year in numbers  | `report_stats` table (PICC SB)  | medium     |
| Highlights       | `report_highlights` (PICC SB)   | medium     |
| Services list    | `getPiccServices()` (EL)        | LOW (canonical) |
| Innovation       | `innovation_projects` (PICC SB) | medium     |
| Community voices | `report_community_voices` (PICC) + EL extracted_quotes | low |
| Youth voices     | filter on communityVoices.category=youth | low |
| Governance       | `board_members` (PICC SB) static fallback | medium |
| Financials       | `financials_summary` (PICC SB) + static | medium |
| Compliance       | `compliance_metrics` (PICC SB)  | medium     |
| Photos per page  | `pagePhotos` resolver (EL slot) | low        |

**Single fragile path:** when Supabase or EL throws, fetch-report-data
catches and returns the static fallback. As of this PR, that path no
longer crashes the PDF render.

## Verification (after merge + deploy)

```bash
curl -sS -o /tmp/test.pdf -w "code:%{http_code} size:%{size_download}\n" \
  "https://picc.studio/api/pdf/generate?type=annual-report&year=2024-25"
# expect: code:200 size:>500000

curl -sS -o /tmp/test-funder.pdf -w "code:%{http_code} size:%{size_download}\n" \
  "https://picc.studio/api/pdf/generate?type=annual-report&year=2024-25&audience=funder"
# expect: code:200 size:>300000

curl -sS -o /tmp/test-community.pdf -w "code:%{http_code} size:%{size_download}\n" \
  "https://picc.studio/api/pdf/generate?type=annual-report&year=2024-25&audience=community"
# expect: code:200 size:>300000
```

If size < 100KB → likely error JSON body. If code != 200 → check
Vercel runtime logs for the error message.

## What "done" looks like for the CEO walk

- `/picc/walk` Stop 12 ("The printed annual report") loads
- Builder UI at `/picc/reports/builder` exists (web preview path)
- Pencil file `picc-annual-report.pen` opens cleanly with current
  palette (verify visually before the demo)
- For the actual printed deliverable: **Pencil exports the final PDF**

## What stays in the repo (and why)

- `lib/pdf/templates/AnnualReportPDF.tsx` — kept as a reference for
  the data shape and audience-config harness. Not on the print path.
  Don't try to fix the production hang; it's not the right tool.
- `lib/pdf/templates/StoriesPDF.tsx`, `FocusReportPDF`, `ServicesPDF`
  — small bookmarks that DO render reliably at runtime. Used for
  one-off downloads from individual surfaces. Keep working.
- `picc-annual-report.pen` — primary deliverable. Lives in the design
  workspace, exports the print master.
