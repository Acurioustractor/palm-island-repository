# Annual Report Photo Consent Review — Runbook

**Date:** 2026-04-15
**Purpose:** Cultural-safety consent pass before any photo ships to the public Annual Report 2024-25 PDF. Blocker on Task 8.

---

## For the reviewer (Elder / Rachel / Narelle)

1. **Open the review page**

   Double-click `web-platform/thoughts/shared/handoffs/2026-04-15-consent-review.html`. It opens in a normal browser (Safari, Chrome, Edge — all fine). It works on iPad and phone too.

2. **Go through the 138 photos**

   The photos are grouped by slot in the report (cover, governance, voices wall, etc.). For each photo, pick one:

   | Button | When to use |
   |---|---|
   | **Approve** | The photo is fine to publish. Cleared by Elders/family where relevant. |
   | **Reject** | Not suitable for the report — off-topic, poor quality, wrong moment. (Photo stays in the archive; just not used in this report.) |
   | **Sorry Business** | Deceased person, family not consulted, or any cultural concern. The photo is flagged `restricted` and **will never** appear in public outputs. |

   Where someone in the photo is identifiable, type their name in the **Person's name** box so we can attribute properly. You can leave **Attribution** blank — it defaults to the person's name.

3. **Your work saves as you go.** Close the tab whenever. Come back, it remembers.

4. **When finished, press Export decisions** (top right). A file called `picc-consent-decisions-YYYY-MM-DD.json` downloads. Send that file back to Ben.

**You are not required to decide all 138.** Unlabeled photos stay un-approved and will not ship. Err on the side of rejecting if unsure. A smaller, safer set is better than a bigger, riskier one.

---

## For Ben (applying the decisions)

Once you have the exported JSON from the reviewer:

```bash
cd /Users/benknight/Code/empathy-ledger-v2

# Preview — shows what would change, writes nothing:
node scripts/_picc_apply_consent.mjs ~/Downloads/picc-consent-decisions-2026-04-XX.json --dry-run

# Apply — writes to EL v2 media_assets:
node scripts/_picc_apply_consent.mjs ~/Downloads/picc-consent-decisions-2026-04-XX.json --reviewer "Rachel Atkinson"
```

The apply script:

- **Approve** → writes `consent_granted=true`, `consent_obtained=true`, `elder_approved=true`, `consent_granted_at=now`, `attribution_text`, adds `picc:slot:<slot>` tag
- **Reject** → no write (photo stays un-approved, `/api/photos` will not serve it)
- **Sorry Business** → `cultural_sensitivity_level='restricted'`, tags `sorry-business` + `do-not-publish`, description annotated
- **Voices-wall rows** → the CSV pointed at storyteller IDs; script resolves to the matching `media_asset` via `profile_image_url`. If no match is found the script skips and warns (handle manually).

After apply: `/api/photos?slot=<name>` will start returning the approved photos. Connect env vars (`EL_V2_API_URL` / `EL_V2_API_KEY` on PICC Vercel, `PICC_API_KEY` on EL v2 Vercel) and the annual report pipeline picks them up.

---

## Files in this pipeline

| File | Role |
|---|---|
| `2026-04-15-consent-shortlist.csv` | Original scored shortlist, 138 rows × 19 slots |
| `2026-04-15-consent-review.html` | Standalone review app for Elder/staff |
| `empathy-ledger-v2/scripts/_picc_build_review_page.mjs` | Rebuilds the HTML from the CSV if the shortlist is regenerated |
| `empathy-ledger-v2/scripts/_picc_apply_consent.mjs` | Applies exported decisions to EL v2 |
| `empathy-ledger-v2/scripts/_picc_consent_shortlist.mjs` | Generates the original CSV shortlist (re-run to regenerate) |
| `empathy-ledger-v2/scripts/_picc_voices_wall.mjs` | Fills voices-wall rows from storytellers (re-run after shortlist) |

---

## Why this shape (and not a Google Sheet, and not a web admin page)

| Option | Why not |
|---|---|
| Google Sheet | Embedded thumbnails via `IMAGE()` are laggy at 100+ rows; decision semantics (approve/reject/sorry) are fiddly in sheet UI |
| Next.js admin page | Requires auth, login friction, Elder on iPad won't want that |
| **Standalone HTML + JSON export** | No auth, no backend, works offline, reviewer owns the file until they send it back — audit-friendly |

The review is asynchronous and cultural. Nothing about this is a technical blocker — it is a human process that we have made as low-friction as possible.
