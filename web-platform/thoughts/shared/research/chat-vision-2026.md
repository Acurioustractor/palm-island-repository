# Ask Palm AI — Chat Vision & Research (Feb 2026)

## Where We Are Now

**Model:** Claude Sonnet 4.5 | **Tools:** 23 | **RAG:** 12 tables, 25K token budget | **Renderers:** 20+ visual components | **Rate limiting:** Upstash Redis

### What Already Works
- Rich tool-calling with visual card renderers (stories, photos, financials, quotes, timelines, projects, board, interviews, grants, publications, history, impact indicators, immersive stories)
- Query expansion (Haiku 4.5 — typo fix, synonyms, intent detection)
- Source cards + "Explore More" related content after each response
- Cultural protocol enforcement (elder approval, sensitivity levels, traditional knowledge flags)
- Conversation history trimming at 80K tokens
- Error UI with retry button
- 3 input tools (submit vision, service update, meeting note)
- Content readiness + data enrichment suggestion tools

---

## The 10 Gaps

### 1. No Conversation Logging or Analytics
Zero visibility into what people are asking. No way to see trends, gaps, popular topics, or failed searches. This is the biggest gap for understanding what the community needs.

### 2. No Audience Awareness
Chat treats everyone the same — community members, funders, partners, board. The annual report already has `community|funder|supporter|board` targeting. Chat should too.

### 3. No Job/Opportunity Features
No connection to employment, training, or opportunity data. Community members asking "are there any jobs?" get nothing.

### 4. No Idea/Feedback Collection (beyond visions)
The `submitCommunityVision` tool exists but there's no way for someone to say "I have an idea for PICC" or "here's feedback about a service" in a structured way.

### 5. No Voice Input
Many Palm Islanders prefer speaking to typing. No microphone option exists.

### 6. No Conversation Persistence
Users can't return to previous chats. Every visit starts fresh.

### 7. No Human Escalation
When the AI can't answer or someone is in distress, there's no handoff to a real person (via GHL).

### 8. No Suggested Follow-ups
After an answer, users stare at a blank input. No "you might also want to know..." prompts.

### 9. No Admin Dashboard for Chat Insights
Can't see what users are asking, which tools succeed/fail, or where data gaps exist.

### 10. No "Ask About This" on Other Pages
Can't ask questions about content on stories/services/timeline pages from those pages.

---

## Feature Ideas by Audience

### For Community Members
| Feature | What it does | How |
|---------|-------------|-----|
| Voice input | Tap microphone, speak your question | Whisper API for transcription |
| Job finder | "Are there any jobs at PICC?" | New `getJobOpportunities` tool from GHL or `job_listings` table |
| Service navigator | "I need help with housing" → guided triage | Multi-step conversational flow to the right service |
| Idea box | "I have an idea" → saved + routed | Extended `submitCommunityVision` with categories |
| Follow-up prompts | 3 suggested questions after each answer | LLM generates based on tool results, chips UI |
| Conversation history | "What did I ask last week?" | `chat_conversations` table, session UUIDs, sidebar |
| Ask about this page | Floating chat bubble on every page | `?context=service:health` query param |
| Plain language mode | Simpler language, shorter answers | Audience-aware system prompt |

### For Funders & Partners
| Feature | What it does |
|---------|-------------|
| Impact self-service | "Show me PICC's impact data for 2024-25" → financials + metrics + stories |
| Grant-ready data | "What outcomes does PICC report?" → KPIs, compliance, CATSI info |
| Story finder | "Find me a story about youth achievement" → curated for external use |
| Data export | "Export this as a PDF" → conversation summary as branded document |

### For PICC Staff (Admin Dashboard)
| Feature | What it does |
|---------|-------------|
| Chat insights dashboard | Top queries, failed searches, sentiment trends, peak times |
| Unanswered questions log | What people asked that the AI couldn't answer → data gaps |
| Topic clustering | Auto-group conversations: service enquiry, job seeking, feedback |
| Community pulse | Weekly digest: "40 asked about housing, 12 about jobs, 8 gave feedback" |
| Alert routing | "20 people asked about X" → GHL notification to relevant staff |

---

## Architecture: Chat Analytics Pipeline

```
User chats → chat_conversations table (with consent notice)
              ↓
     Nightly batch job (Claude Haiku)
              ↓
     Classify: topic, sentiment, intent, resolved?
              ↓
     chat_analytics table (aggregated)
              ↓
     /picc/chat-insights dashboard
              ↓
     Weekly digest → GHL notification
```

**Privacy:** Aggregate to topic-level before displaying. Never show individual conversations. Retention: delete raw after 90 days, keep aggregates forever.

---

## Architecture: Multi-Audience Chat

```
User arrives → [Who are you?]
  ├── Community member (default, anonymous)
  ├── Funder / Partner (optional select or inferred)
  ├── Staff / Board (authenticated via Supabase)
  └── Inferred from first message

Each audience gets:
  - Different system prompt tone
  - Different RAG filters
  - Different suggested starter prompts
  - Same tools, different emphasis
```

Maps to existing annual report audience model.

---

## Architecture: Human Escalation

```
Chat detects trigger:
  - User says "speak to someone"
  - Sentiment = distress/crisis
  - Sensitive topic (DV, child safety, mental health)
  - Low confidence (no RAG sources)
  - 10+ turns without resolution
      ↓
Offer: "Would you like me to connect you with someone at PICC?"
      ↓
Yes → Create GHL contact + conversation summary → route to team
No → Continue chat with adjusted approach
```

---

## Best Practices (from Research)

### RAG Architecture (2026 State of Art)
| Pattern | Description | Best For |
|---------|-------------|----------|
| Basic RAG | Embed query, vector search, inject context | Simple Q&A |
| Agentic RAG | Agent decides when/what to retrieve | Complex multi-source questions |
| GraphRAG | Vector search + knowledge graph relationships | High-precision org knowledge |
| Hybrid RAG | Full-text + vector + reranking | Broad coverage + precision |
| Corrective RAG | Evaluates retrieval quality, re-retrieves | High-stakes accuracy |

PICC currently uses **Agentic RAG** (tools decide retrieval) + **Hybrid search** (text + vector in context builder). This is a strong foundation.

### What Makes Great AI Chat (2026)
1. Streaming with partial rendering (have this)
2. Source attribution (have this)
3. Suggested follow-ups (gap)
4. Conversation persistence (gap)
5. "I don't know" over hallucination (partially implemented)
6. Bounded purpose > general assistant

### Cultural Safety (Critical for PICC)
- CARE principles: Collective benefit, Authority to control, Responsibility, Ethics
- OCAP principles: Ownership, Control, Access, Possession
- Never extract/repackage traditional knowledge without authorization
- Community control over what AI says about cultural matters
- Existing `standard/sensitive/restricted` levels must gate RAG content
- Transparency: "I'm an AI, not a person"

### Aboriginal English & Accessibility
- Google + UWA partnership adding Aboriginal English to ASR (mid-2026)
- Not production-ready yet — plain language in responses is the practical approach
- Voice input essential for low-digital-literacy users
- Mobile-first design (Palm Island is mobile-heavy)

### Conversation Analytics Privacy
- Anonymize before analysis (strip names, contact details)
- Aggregate to topic-level before reporting
- Retention policy: raw → 90 days, aggregates → forever
- Consent notice at chat start
- Differential privacy for small communities

---

## Community Consultation Platforms (Inspiration)
- **Pol.is** — ML-powered consensus building, structured debate
- **Decidim** — participatory democracy (Barcelona, NYC, EU Commission)
- Both open source, both handle large-scale community input

---

## Implementation Priority

| Priority | Feature | Impact | Effort |
|----------|---------|--------|--------|
| 1 | Chat analytics + conversation logging | Unlocks everything | Medium |
| 2 | Suggested follow-up questions | Big UX win | Small |
| 3 | Audience detection | Personalization | Medium |
| 4 | Human escalation via GHL | Safety-critical | Medium |
| 5 | Voice input | Accessibility | Small |
| 6 | Job/opportunity tool | Community value | Small |
| 7 | Idea/feedback collection | Extends existing tool | Small |
| 8 | Chat insights dashboard | Powered by #1 | Medium |
| 9 | Conversation persistence | Continuity | Medium |

---

## Sources

- [Vercel AI SDK 6](https://vercel.com/blog/ai-sdk-6) — Agent abstraction, MCP support
- [Anthropic Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Supabase RAG with Permissions](https://supabase.com/docs/guides/ai/rag-with-permissions)
- [WEF: AI Powering Grassroots Solutions](https://www.weforum.org/stories/2025/09/how-ai-is-powering-grassroots-solutions-for-community-challenges/)
- [Indigenous AI Network](https://www.indigenous-ai.net/)
- [UNESCO Indigenous Data Sovereignty](https://www.unesco.org/ethics-ai/en/articles/new-report-and-guidelines-indigenous-data-sovereignty-artificial-intelligence-developments)
- [Content Moderation for GenAI (Lakera)](https://www.lakera.ai/blog/content-moderation)
- [Conversation Analytics (OvalEdge)](https://www.ovaledge.com/blog/conversation-analytics)
- [Aboriginal English ASR (SBS NITV)](https://www.sbs.com.au/nitv/article/google-and-researchers-are-teaching-ai-aboriginal-english/1uuqtjkf8)
- [Pol.is](https://compdemocracy.org/polis/) — Computational democracy
- [Decidim](https://decidim.org/) — Participatory democracy framework
