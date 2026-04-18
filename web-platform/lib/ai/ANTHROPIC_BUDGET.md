# Sites still hitting Anthropic API

Every site below costs Anthropic budget on every call. With Anthropic
budget at zero, these will return 401s in production until migrated or
disabled.

Companion to `lib/ai/models.ts`. Updated 2026-04-18.

---

## Vision (image analysis)

MiniMax has vision models but **not via the OpenAI-compatible endpoint** we
currently wire (`https://api.minimax.io/v1`). Migration = different SDK.

| Site | Triggered by | Effort to migrate |
|---|---|---|
| `lib/ai/vision.ts` (3 calls) | Library function used by media routes | Medium — wrap MiniMax vision SDK |
| `app/api/media/analyze/route.ts` | Photo upload analysis | Low after lib migration |
| `app/api/media/analyze-batch/route.ts` | Batch photo analysis | Low after lib migration |
| `app/api/media/batch-analyze/route.ts` | Alternate batch path | Low after lib migration |
| `app/api/media/analyze-hybrid/route.ts` | Hybrid (vision + metadata) | Medium |
| `app/api/media/upload/route.ts` | Auto-analyze on upload | Low after lib migration |
| `lib/ai/pdf-processing.ts` (3 calls) | PDF page → image → analysis | High — needs vision SDK + extracted-text fallback for non-image pages |

**Interim option**: disable photo auto-analysis on upload. Photos still upload, just no AI tags/captions until vision is migrated.

---

## Audio (transcription)

| Site | Triggered by | Migration option |
|---|---|---|
| `app/api/ai/transcribe/route.ts` | Voice note upload | Replace with MiniMax speech-to-text (mmx-cli has STT) or Whisper |
| `lib/ai/transcription.ts` | Library function | Same — swap provider |
| `lib/ai/voice-recorder.ts` | Recording capture | Same — swap provider |

**Interim option**: disable voice notes. Manual text entry still works.

---

## Agent / tool use

| Site | Triggered by | Risk |
|---|---|---|
| `lib/ai/agents/agent-core.ts` | Agentic tool-calling loops | MiniMax M2.7 tool-call support untested. Test before migrating. If unsupported, disable agentic flows. |

---

## Background scripts (only fire on manual run)

These don't bleed budget unless you run them. Safe to leave until next batch run, then migrate before re-running:

- `scripts/extract-financials.ts`
- `scripts/ocr-annual-report.ts`
- `scripts/generate-stories-from-interviews.ts`
- `scripts/draft-elders-trip-story.js`
- `scripts/generate-elder-bios.js`
- `scripts/ingest-publications.ts`
- `scripts/smart-cover-matcher.ts`
- `scripts/analyze-all-interviews.js`
- `scripts/ingest-annual-reports.ts`
- `scripts/rewrite-raw-transcripts.ts`
- `scripts/extract-historical-data-v2.ts`
- `scripts/enrich-service-descriptions.ts`
- `scripts/analyze-elder-interviews.js`
- `scripts/analyze-chat-sessions.ts`

---

## Migration order suggestion

1. **Vision lib** (`lib/ai/vision.ts`) → unlocks 5 media routes for free
2. **PDF processing** → only blocker for report ingestion
3. **Audio transcription** → swap to Whisper (cheap + reliable)
4. **Agent core** → test MiniMax tool-call; fall back to disable
5. **Scripts** → migrate before next batch run

---

## How to use the loud-fail helper

`requireAnthropic(reason)` in `lib/ai/models.ts` throws a clear error if the
key is missing. Call it at the top of any Anthropic-only handler:

```ts
import { requireAnthropic } from '@/lib/ai/models'

export async function POST(req: Request) {
  requireAnthropic('image analysis')
  // ...rest of handler
}
```

This produces a clean error message instead of a silent 401 cascade.
