# Architect Output: Chat Pipeline Audit
Date: 2026-02-24

## Summary
Complete audit of the PICC chat AI pipeline from user question to response. Found 8 gaps causing missed content.

## Critical Findings

1. **RAG vector search is completely broken** — references 3 DB functions and 3 tables that don't exist (`search_chunks`, `hybrid_search_chunks`, `content_chunks`, `scraped_content`, `scrape_sources`). Silently fails every request.

2. **Stories table not in pre-context** — the richest content source is only accessible via tools, but the LLM needs context to know what to search for.

3. **Query expansion never wired up** — `lib/ai/query-expansion.ts` is complete but never imported. Typos and synonyms fail.

4. **Token budget too low** — 3000 tokens means context gets truncated, losing financials/partners/visions sections.

5. **6 tables never queried** — `extracted_quotes`, `community_feedback`, `service_grants`, `organization_goals`, `publications`, `meeting_notes` (read).

6. **Hardcoded KB is stale** — `picc-knowledge-base.ts` locked to 2023-24 data.

7. **Content embeddings likely empty** — no evidence of batch embedding job ever running.

8. **Keyword-only matching** — all context builder searches use `ilike` which fails on synonyms and natural language questions.

## Priority Fixes
- P0: Remove broken RAG call or fix it to use existing `match_content_by_embedding` RPC
- P1: Add stories search to context builder
- P2: Increase token budget from 3000 to 8000
- P3: Wire up query expansion
- P4: Add missing tables (community_feedback, service_grants, organization_goals, projects)
- P5: Populate content_embeddings with batch job
- P6: Fix interview search (segment-first instead of title-first)
- P7: Auto-update hardcoded knowledge base from live data
- P8: Add full-text search indexes

## Full Plan
See: `thoughts/shared/plans/chat-pipeline-audit.md`
