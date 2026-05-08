# Plan — Printed Annual Report 2024-25 (PDF + Pencil)

## Context

Tuesday CEO walk-through has the platform polished. The printed annual
report is the second deliverable: same data, presented as a PDF for
funders, board, government, and community. Two surfaces work together:

- **Pencil**: `picc-annual-report.pen` is the design source of truth.
  Cover, spreads, photography, brand chrome live there.
- **React-PDF**: `lib/pdf/templates/AnnualReportPDF.tsx` is the live
  data renderer. Pulls from `getReportData(year)` and produces an
  audience-targeted PDF at runtime via `/api/pdf/generate`.

Both are aligned through `tokens/picc.tokens.json` → Style Dictionary
→ `lib/pdf/theme.ts`. Same palette in Pencil, same palette in print.

## What was broken

Production endpoint was returning HTTP 500:
```
{"error":"Cannot read properties of undefined (reading 'voices')"}
```

Root cause: `lib/annual-report/data-2025.ts` static fallback set
`voiceAssignments: {} as any`, but `AnnualReportPDF.tsx` reads
`va.communityVoices.voices.length` — crashes when fetch-report-data
falls back to static (any Supabase blip, EL outage, etc).

## What we fixed (this PR)

1. **Static fallback** populates every voiceAssignment bucket with
   `{ voices: [] }` so the template can read `.voices.length` safely.
2. **Template guard** wraps `data.voiceAssignments` in optional-chain
   reads with empty-bucket defaults — defence-in-depth for any future
   shape drift.
3. **Walk page** gets a Stop 12 dedicated to the printed report:
   live builder URL · Pencil source file · direct audience-targeted
   PDF download links.

## Audience-targeted generation (already built, now reachable)

```
/api/pdf/generate?type=annual-report&year=2024-25&audience=community
                                                          &audience=funder
                                                          &audience=board
                                                          &audience=supporter
                                                          &audience=government
```

Each audience filters which pages appear (compliance, financials,
community voices, etc) per `lib/annual-report/audience-config.ts`.

## Tuesday-ready verification path

1. `/picc/reports/builder` — pick year + audience, generate PDF in
   browser. (already built, now linked from `/picc/walk`)
2. `/api/pdf/generate?type=annual-report&year=2024-25` — direct
   endpoint, returns PDF blob.
3. Compare PDF chrome against `picc-annual-report.pen` — same colours,
   same hero, same typography hierarchy.

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

## Production-path findings (verified 2026-05-09)

After PR #14 (voiceAssignments crash) and PR #15 (PlayfairDisplay →
Caveat), the live `/api/pdf/generate?type=annual-report` endpoint
**hangs without responding**. Verified behaviour:

- `type=stories` — returns 200, 12KB PDF in 3 seconds (works)
- `type=focus-report&focus=service&id=…` — returns valid error in 2s (works)
- `type=annual-report&year=2024-25` — opens TCP connection, sends
  no headers, no body, no error; client disconnects at 280s
- Same hang on `audience=community` (smaller cut)
- No response in `gh api .../check-runs` (403 on /v9 logs API)

Likely root cause: 1876-line template with ~50 pages × dozens of
SVG stat boxes × photo embeds × multi-pass layout calculations
exhausts the lambda CPU/wall-clock budget before sending output.
React-PDF in v4 + Vercel serverless is documented elsewhere as
brittle for documents this large.

**Tuesday print decision:** Pencil is the source for the printed
report. React-PDF is for rapid drafts of small bookmarks (stories
PDF, focus report PDF, services PDF). The walk page Stop 12 reflects
this honestly.

## Path forward (post-Tuesday)

Three options ordered by effort:

1. **Smallest:** Render annual-report PDF locally via the existing
   builder UI on a dev server (no lambda time limit), upload the
   resulting PDF to Supabase Storage, and ship a static-link Stop 12.
   This is "build it once, link to the file." 30 minutes.
2. **Medium:** Split the annual-report template into smaller per-page
   PDFs (cover + 4-5 spreads each), render each in its own lambda
   request, then concatenate via pdf-lib. Each chunk fits in budget.
   ~2 days.
3. **Largest:** Move the heavy renderer off Vercel — Cloud Run
   container with longer timeout, or background job with webhook
   notification when ready. Right architecture but week+ of work.

**Recommendation:** Option 1 for Tuesday. Pencil for the actual
print run. Option 2 or 3 only if a recurring runtime PDF need
emerges (currently we have one annual report a year).
