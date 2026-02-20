# Debug Report: Annual Report Live Page — Data Issues
Generated: 2026-02-20

## Symptom
Multiple data quality issues on `/annual-report/live/page.tsx`: wrong board images, duplicate elder quotes, missing/stale data across several sections.

## Investigation Steps
1. Read the full page component and all 15+ data-fetching functions
2. Compared `fetchElderQuotes` against the canonical `getCuratedQuotes()` from `lib/quotes/get-curated-quotes.ts`
3. Compared `fetchCommunityVisions` query columns against the migration schema
4. Analyzed `fetchBoardGallery` tag-matching logic
5. Reviewed `fetchCurrentYearStats` fallback behavior
6. Reviewed leadership message field chain
7. Reviewed story merge logic and `getFeaturedStories` from `lib/stories/utils.ts`

---

## Evidence

### BUG 1: Board Gallery uses `.overlaps()` (OR logic) instead of `.contains()` (AND logic)
- **Location:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx:970`
- **Observation:** `fetchBoardGallery` queries:
  ```ts
  .overlaps('tags', ['board', 'annual-report', `fy:${fiscalYear}`])
  ```
  `.overlaps()` is OR logic in PostgREST — it returns any image that has ANY of those tags. So an image tagged only `annual-report` (e.g., a random community photo) or only `board` (from a different year) will match.
- **Impact:** HIGH. This is the primary cause of wrong/random images in the board section.
- **Fix:** Change `.overlaps()` to `.contains()` for AND logic:
  ```ts
  .contains('tags', ['board', `fy:${fiscalYear}`])
  ```

**Confidence:** High

### BUG 2: Elder Quotes — Not Using `getCuratedQuotes()`, No Deduplication by Speaker
- **Location:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx:1120-1145`
- **Observation:** The page defines its own `fetchElderQuotes()` function that:
  1. Queries `extracted_quotes` WHERE `photo_url IS NOT NULL` AND `used_in_report_id IS NOT NULL`, ordered by `display_order`
  2. Falls back to `elder_quotes` WHERE `permission_level = 'public'`
  3. **Neither query deduplicates by speaker/attribution.** If the same elder has 3 quotes, all 3 show up.
  4. The `extracted_quotes` query does NOT filter by `is_validated = true` (violates CLAUDE.md rule).
  5. The `elder_quotes` fallback does NOT filter by `is_validated = true` either.
- **Comparison with canonical `getCuratedQuotes()`:** The canonical function in `lib/quotes/get-curated-quotes.ts`:
  - Filters `is_validated = true` on both tables
  - Deduplicates by first 60 chars of quote text
  - Sorts elders first, prefers quotes with photos
  - Joins to `profiles` for speaker info
- **Impact:** HIGH. Duplicate quotes from same person, and potentially showing unvalidated/unapproved elder content.
- **Fix:** Replace `fetchElderQuotes()` with `getCuratedQuotes({ limit: 6, source_type: 'elder' })`. Update the template to use `quote.quote` instead of `quote.quote_text`, and `quote.speaker_name` instead of `quote.attribution`.

**Confidence:** High

### BUG 3: Community Visions — Column Name Mismatch (`is_public` vs `is_approved`, `contributor_name` vs `author_name`)
- **Location:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx:1229-1238`
- **Observation:** `fetchCommunityVisions` queries:
  ```ts
  .select('id, vision_text, content, contributor_name, created_at')
  .eq('is_public', true)
  ```
  But the migration schema at `supabase/migrations/20260214_community_visions.sql` shows:
  - The table has `is_approved` (not `is_public`)
  - The table has `author_name` (not `contributor_name`)
  - The table does NOT have a `content` column (only `vision_text`)
  - RLS policy already filters on `is_approved = true` for SELECT
- **Impact:** HIGH. The `.eq('is_public', true)` filter will either silently fail (return 0 rows because the column doesn't exist) or PostgREST will return a 400 error. Either way, no community visions will ever display.
- **Fix:** Change the query to:
  ```ts
  .select('id, vision_text, author_name, created_at')
  .eq('is_approved', true)
  ```
  And update the template at line 629 to use `vision.author_name` instead of `vision.contributor_name`.

**Confidence:** High

### BUG 4: Stats Fallback — `annualBudget` Uses Hardcoded $45M (Real Figure is $23.4M)
- **Location:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx:897-898`
- **Observation:** `fetchCurrentYearStats` fallbacks:
  - `communityReach` falls back to hardcoded `'3,000+'` (a string, not number)
  - `annualBudget` falls back to hardcoded `45000000` ($45M)
  But `current-stats.ts` shows actual income is `$23.4M` (`FINANCIALS.totalIncome = 23_400_335`). The $45M is nearly double the real figure.
- **Impact:** MEDIUM. If the `organization_stats` table has no rows, the page displays an inflated $45M budget figure.
- **Fix:** Use `FINANCIALS.totalIncome` as the budget fallback instead of the hardcoded 45M.

**Confidence:** High

### BUG 5: Community Gallery Also Uses `.overlaps()` (OR logic)
- **Location:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx:1049-1061`
- **Observation:** `fetchMediaCandidates` uses `.overlaps('tags', tags)`. For primary tags `['annual-report', 'fy:2025-26']`, this is OR logic — ANY image tagged `annual-report` from ANY year matches.
- **Impact:** MEDIUM. Gallery may show images from previous years.
- **Fix:** Use `.contains('tags', tags)` for the primary tag query. Keep `.overlaps()` for the fallback query (where OR logic on general tags like `community`, `event` is intentional).

**Confidence:** High

### ISSUE 6: Leadership Messages — Fields May Be Null/Missing
- **Location:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx:1147-1158`
- **Observation:** The leadership query selects `*` from the `leadership` table. The CEO/Chair section checks `message_content || message_excerpt || featured_quote`. If all are null, a generic fallback paragraph renders. The table may not have these columns at all.
- **Impact:** MEDIUM. The "Messages from Our Leaders" section never shows real leader messages if these columns are empty or missing.
- **Action:** Verify whether the `leadership` table has `message_content`, `message_excerpt`, and `featured_quote` columns. If not, add them or source messages elsewhere.

**Confidence:** Medium (cannot verify table schema without DB access)

### ISSUE 7: Linked Stories Don't Filter for `is_public` or `published` Status
- **Location:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx:1190-1227`
- **Observation:** `fetchLinkedStories` joins through `annual_report_stories` to `stories` but does NOT add `.eq('story.is_public', true)` or `.eq('story.status', 'published')`. Draft or private stories linked to a report would still appear.
- **Impact:** LOW-MEDIUM. Could expose unpublished content.
- **Fix:** Filter linked stories by `is_public = true` and `status = 'published'`.

**Confidence:** Medium

---

## Summary Table

| # | Bug | Severity | Confidence |
|---|-----|----------|------------|
| 1 | Board gallery `.overlaps()` OR logic pulls wrong images | HIGH | High |
| 2 | Elder quotes not deduplicated, not validated, ignores `getCuratedQuotes()` | HIGH | High |
| 3 | Community visions query uses wrong column names | HIGH | High |
| 4 | Annual budget fallback is $45M instead of real $23.4M | MEDIUM | High |
| 5 | Community gallery also uses `.overlaps()` OR logic | MEDIUM | High |
| 6 | Leadership messages may have no content (null fields) | MEDIUM | Medium |
| 7 | Linked stories don't filter for `is_public`/`published` | LOW-MED | Medium |

## Recommended Fix — All Changes in One File

**File:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/(public)/annual-report/live/page.tsx`

**Fix 1 (line 970):** `.overlaps(...)` -> `.contains('tags', ['board', 'fy:${fiscalYear}'])`

**Fix 2 (lines 1120-1145):** Replace entire `fetchElderQuotes()` with call to `getCuratedQuotes({ limit: 6, source_type: 'elder' })`. Add import at top. Update template field names in the elder quotes section (lines 393-425).

**Fix 3 (lines 1229-1238):** Fix column names: `is_public` -> `is_approved`, remove `content` and `contributor_name`, add `author_name`. Update template at line 629.

**Fix 4 (line 897-898):** Change `45000000` to `FINANCIALS.totalIncome`.

**Fix 5 (line 1056):** Change `.overlaps('tags', tags)` to `.contains('tags', tags)` in `fetchMediaCandidates` when called with primary tags.

**Fix 7 (lines 1219-1226):** Add filter for `is_public` and `published` status on linked stories.

## Prevention
1. Always use `.contains()` for AND-matching on PostgreSQL array columns; reserve `.overlaps()` for intentional OR-matching.
2. Use the canonical `getCuratedQuotes()` function for all quote display (as required by CLAUDE.md).
3. Verify column names against migration schemas before writing queries.
4. Use constants from `current-stats.ts` for all fallback values instead of inline magic numbers.
