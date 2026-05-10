# Meeting Process Wrapper — Plan

**Date:** 2026-05-11
**Owner:** Ben (on Palm Island, May 11–13 visit)
**Deadline:** ready by 8am Tuesday 2026-05-12 for Elders review meeting
**Goal:** one-click pipeline from audio recording → meeting record with AI-extracted action items, gated behind cultural protocol approval.

---

## Why now

- Tomorrow (Tue 2026-05-12): Elders review meeting on Palm Island
- Day after (Wed 2026-05-13): CEO meeting — strategy + cost sign-off
- The meeting itself is the demo of the bi-monthly workflow
- Three pipeline pieces are already production-grade: `/api/ai/transcribe`, `/api/interviews/analyze`, `/api/meetings`. The glue is missing.

## Scope

### In
1. Add `action_items[]` extraction to `/api/interviews/analyze` (prompt + type only, no schema change)
2. New page `/picc/meetings/process` — audio upload + chained pipeline + edit preview + submit
3. Cultural protocol gates surfaced in UI: `is_sensitive`, `requires_elder_approval` checkboxes, default ON for Elders meetings

### Out (intentionally deferred)
- No new tables, no schema migrations
- No mobile recorder UI — Voice Memos → AirDrop → upload form is fine
- No retro-processing of older meetings
- No real-time during-meeting transcription
- No automatic linkage to `related_project_slug` (manual dropdown is fine)

## Files to touch (4 total)

| File | Change | Risk |
|---|---|---|
| [`web-platform/app/api/interviews/analyze/route.ts`](web-platform/app/api/interviews/analyze/route.ts) | Add `action_items: string[]` to prompt JSON contract + `TranscriptAnalysis` type. ~15 lines. | Low — additive field, existing callers ignore |
| [`web-platform/app/picc/meetings/process/page.tsx`](web-platform/app/picc/meetings/process/page.tsx) (new) | Client component: upload → call `/api/ai/transcribe` → call `/api/interviews/analyze` → preview form → POST `/api/meetings` | Medium — new file, but each API call is already proven |
| [`web-platform/app/picc/elders/meetings/page.tsx`](web-platform/app/picc/elders/meetings/page.tsx) | Add "+ New from recording" link → `/picc/meetings/process?group=Elders Group` | Trivial |
| [`web-platform/app/picc/page.tsx`](web-platform/app/picc/page.tsx) | Add `/picc/meetings/process` to admin index dashboard | Trivial |

## Sequence (~2 hours, can run tonight)

1. **Extend analyze API (20 min)**
   - Add `action_items: string[]` to prompt JSON contract — paragraph saying "extract any commitments, decisions, follow-ups, or tasks named in the meeting"
   - Add to `TranscriptAnalysis` type interface
   - Update `analysis` response object
   - **Verify**: paste a sample meeting transcript via curl, confirm action_items returned

2. **Build process page client component (60 min)**
   - File upload (audio/* accept) with size limit warning at 25 MB
   - State machine: `idle → uploading → transcribing → analyzing → editing → submitting → done`
   - Step 1: POST audio file to `/api/ai/transcribe` (multipart)
   - Step 2: POST `transcript_text` to `/api/interviews/analyze` (JSON)
   - Step 3: Editable form pre-filled with: title (from filename), meeting_date (today), location (Palm Island), group_name (URL param or default), summary, key_themes, action_items, attendees (manual), is_sensitive (default true for Elders), requires_elder_approval (default true for Elders), recorded_by (Ben Knight)
   - Step 4: POST to `/api/meetings`
   - On success: redirect to `/picc/elders/meetings/[id]` (or list view)
   - **Verify**: process the recording from the standup meeting tonight end-to-end

3. **Wire entry points (15 min)**
   - `/picc/elders/meetings` page header gets "+ New from recording" button
   - `/picc/page.tsx` admin index gets the new tile under "Voices/Capture" section

4. **Smoke test full flow (15 min)**
   - Record 60-second sample on phone
   - AirDrop to laptop
   - Upload via `/picc/meetings/process`
   - Verify: transcript appears, action items extracted, preview editable, submit creates meeting_notes row
   - Verify: meeting visible at `/picc/elders/meetings`
   - Verify: cultural protocol flags persist correctly

5. **Commit (10 min)**
   - One commit, body: "Meeting process wrapper: audio → transcript → analysis → meeting record. Cultural protocol flags default-on for Elders Group."
   - Push to current branch (do NOT push to main)

## Acceptance criteria

- [ ] `/api/interviews/analyze` returns `action_items[]` for transcripts that mention any commitments
- [ ] `/picc/meetings/process` accepts an .m4a upload and shows transcript within 60 sec for 10-min recording
- [ ] Preview shows summary + key_themes + action_items + cultural flags
- [ ] All form fields editable before submit
- [ ] Submit creates `meeting_notes` row with `is_sensitive = true` and `requires_elder_approval = true` when group is Elders
- [ ] Submitted meeting visible on `/picc/elders/meetings` immediately
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No build break (`npm run build`)

## Demo script (Wed CEO meeting)

1. Open `/picc/meetings/process`
2. *"Yesterday's Elders meeting. I uploaded the recording — Whisper transcribed it, Claude extracted themes and action items in 30 seconds."*
3. Show transcript
4. Show action items (e.g., "Schedule cultural review by 20 May", "Confirm Bwgcolman case study language")
5. *"Then I sent the link back to the Elders. They approved before anything was published. Watch what happens if I try to extract quotes before approval —"* (show 403 from analyze API)
6. *"This is the protocol made code. Bi-monthly, every visit, every meeting feeds this."*
7. CEO sign-off ask: strategy + costs + Elders alignment

## Risks + fallbacks

| Risk | Mitigation |
|---|---|
| Whisper rate limit (5/min) hits during demo | Process the recording the night before, not live |
| 25 MB upload cap on 60+ min recordings | Split file with `ffmpeg`; document in page UI |
| Transcribe call exceeds Vercel 60s limit on long files | Use the existing API as-is for 5-15 min recordings; warn user above 15 min |
| Analyze returns weird action_items (model variability) | Editable preview — human always reviews before submit |
| Elders ask not to record | Have 2 existing meeting examples seeded for the demo |

## What this does NOT do

- Does not real-time transcribe during the meeting
- Does not link to `story_captures` or `extracted_quotes` automatically (those are separate flows)
- Does not handle multi-speaker diarization (Whisper doesn't do that natively)
- Does not auto-publish — every meeting requires manual submit

## Decision needed before I start

1. **Build tonight (Mon 11 May) or tomorrow night between meetings?**
   - Tonight: have it ready for Tuesday morning Elders meeting if Ben can record
   - Tomorrow night: only if recording happens; lower risk of broken state at meeting time
2. **Confirm the page lives at `/picc/meetings/process` (not nested under `/picc/elders/`)?**
3. **Confirm OK to default `is_sensitive = true` for Elders Group meetings?**

Ready to execute on user approval.
