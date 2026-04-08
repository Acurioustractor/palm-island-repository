# PICC AI & Opportunity Research Findings
## Recursive Research Analysis - Karpathy-Style Review

---

## EXECUTIVE SUMMARY

This research examines the Palm Island Community Company (PICC) AI chatbot system and identifies opportunities for improvement and revenue generation through grant/contract acquisition.

**Current Status**: The platform has a sophisticated multi-tool AI chatbot ("Palm AI") with 28 tools accessing real data, but lacks automated opportunity discovery and integration with external funding systems.

---

## PART 1: HOW THE CURRENT CHATBOT WORKS

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  /app/chat/page.tsx                                              │
│  - Audience selector (community, funder, partner, staff)         │
│  - Voice input (Web Speech API)                                  │
│  - Starter prompts per audience                                  │
│  - Follow-up suggestions                                         │
│  - Contact collection & escalation                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (/api/chat)                        │
│  - Rate limiting                                                  │
│  - Query expansion (typo fix, synonyms)                          │
│  - RAG context building (15K token budget)                       │
│  - Audience-aware system prompt                                  │
│  - Tool calling (max 5 steps)                                    │
│  - Message streaming                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI PROVIDER                                 │
│  Primary: MiniMax M2.5 (OpenAI-compatible, 95% cheaper)         │
│  Fallback: Claude Haiku 4.5                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      28 TOOLS (exploreTools)                     │
└─────────────────────────────────────────────────────────────────┘
```

### The 28 Tools Available to the Chatbot

| Tool | Purpose |
|------|---------|
| `searchStories` | Search community stories by topic, person, service |
| `getServiceInfo` | Get PICC service details with metrics/achievements |
| `getInnovationProjects` | Info about projects (Centre/Station, Photo Studio, etc.) |
| `exploreTimeline` | Historical milestones and achievements by era |
| `findQuotes` | Community quotes by theme/impact |
| `getPhotoGallery` | Photos from library by topic/service |
| `exploreKnowledgeGraph` | Connections between stories, people, places |
| `submitCommunityVision` | Record future visions for 20-year plan |
| `getCommunityVisions` | Get community aspirations |
| `getServiceMetrics` | Annual + monthly service metrics |
| `getFinancialSummary` | Revenue, expenses, ratios (overview/expenses/trends/ratios) |
| `submitServiceUpdate` | Record service notes from conversations |
| `submitMeetingNote` | Record meeting summaries |
| `getContentReadiness` | Check data completeness (green/amber/red) |
| `suggestDataEnrichment` | Generate questions to fill data gaps |
| `getBoardAndLeadership` | Board members, leadership team |
| `getInterview` | Search 34 interviews with 2000+ segments |
| `getPhotoCollections` | Curated photo galleries |
| `getAnnualReportArchive` | Past annual reports |
| `getPublications` | Reports and documents |
| `getDeepHistory` | Detailed timeline events |
| `getImpactIndicators` | KPIs and outcomes |
| `getImmersiveStories` | Rich scrollytelling stories |
| `getGrantsAndPartnerships` | Grant funding and partners info |
| `escalateToHuman` | Connect to real person (crisis, complex queries) |
| `collectContactDetails` | Collect user contact for follow-up |

### Data Sources

- **Supabase Database**: Stories, services, metrics, financials, quotes, media, interviews
- **Knowledge Graph**: Entity relationships stored in vector database
- **Content Readiness**: Auto-checks completeness of report sections
- **RAG Context**: Retrieved from 8 sources, up to 15K tokens

### Key Features

1. **Audience-Aware Responses**: Different prompts for community/funder/partner/staff
2. **Multi-Tool Calls**: Large questions trigger 4-6 parallel tool calls
3. **Source Attribution**: Citations to actual database content
4. **Follow-up Suggestions**: Generated from response content
5. **Feedback Collection**: Helpful/not helpful with negative-triggered contact form
6. **Crisis Escalation**: Automatic detection of DV, child safety, mental health emergencies
7. **Voice Input**: Browser-based speech-to-text

---

## PART 2: WAYS TO MAKE IT EVEN BETTER

### Phase 1: Quick Wins (1-2 Sprints)

#### 1.1 Add Job/Opportunity Tool
**Status**: GAP identified in `thoughts/shared/research/chat-vision-2026.md`

- Community members asking "are there any jobs?" get no answer
- Add tool to query employment opportunities, training programs
- Connect to Economic Development service data

#### 1.2 Grant-Funded Service Visibility
**Status**: GAP - `service_grants` data invisible to chatbot

- Create `getServiceFunding` tool exposing grant info per service
- Show which services are grant-funded vs self-sustaining
- Enable questions like "Which services need renewed funding?"

#### 1.3 Automated Intelligence Briefs
**Status**: Planned but not built

- Weekly cron job analyzing recent data
- AI-generated summary of: new stories, service milestones, opportunities
- Push to GHL for distribution to staff/board

### Phase 2: Medium Improvements (1-2 Months)

#### 2.1 Partnership Opportunity Finder
**Status**: Documented in `docs/archive/AI-INFRASTRUCTURE-AUDIT.md` but not built

Components:
- Scrape grants.gov.au, Queensland grants, NIAA opportunities
- AI matching to PICC services
- Track deadlines and requirements
- UI to browse opportunities

**Estimated Impact**: 2-3 quality leads/month

#### 2.2 Grant Evidence Pipeline
**Status**: PRD exists in `docs/prds/02-grant-evidence-pipeline.md`

- Map stories/photos/quotes to grant outcomes automatically
- Evidence gaps dashboard ("What do we need for NIAA acquittal?")
- Auto-generate evidence packages for applications
- Track success rate correlation with evidence quality

#### 2.3 Enhanced Financial Storytelling
- Tool to explain financial data in plain language
- Connect outcomes to financial investments
- "What did the $23.4M achieve?" type queries

### Phase 3: Advanced Features (3-6 Months)

#### 3.1 Fine-Tuned Palm Island Language Model
**Status**: Architecture supports it

- Fine-tune Llama 3.1 8B on Palm Island knowledge
- Better understanding of local context, names, culture
- More accurate cultural protocol enforcement

#### 3.2 Predictive Analytics
- Forecast service demand based on trends
- Predict grant cycles and deadlines
- Identify community needs before they become crises

#### 3.3 Multi-Modal Capabilities
- Image upload for story enhancement
- Voice recording for direct story capture
- Video support for elder interviews

---

## PART 3: CIVICGRAPH INTEGRATION OPPORTUNITIES

### What is CivicGraph?

CivicGraph appears to be a concept for a civic technology graph - a network connecting:
- Government funding opportunities
- Community organizations
- Service providers
- Grant outcomes and evidence
- Partnership networks

### Current Gaps vs. Ideal State

| Current State | Ideal State (CivicGraph) |
|---------------|-------------------------|
| Manual grant research | Automated opportunity discovery |
| No external data integration | APIs to grants.gov.au, NIAA, Queensland |
| Stories isolated from outcomes | Linked to funding outcomes |
| No partnership CRM | Partner relationship tracking |
| Quarterly manual reports | Real-time impact dashboards |
| No predictive capabilities | AI-predicted opportunities |

### How PICC Can Build CivicGraph Capabilities

#### 3.1 Grant Opportunity API Layer

```typescript
// New tool: findFundingOpportunities
interface Opportunity {
  id: string;
  title: string;
  funder: string;
  amount?: number;
  deadline: Date;
  eligibility: string[];
  matchedServices: string[];
  fitScore: number;
}
```

**Implementation**:
1. Create `lib/intelligence/opportunity-finder.ts`
2. Scrape: grants.gov.au, Queensland Government grants, NIAA
3. AI matching to PICC service capabilities
4. Store in `funding_opportunities` table
5. Alert staff when high-fit opportunities appear

#### 3.2 Evidence-Outcome Graph

```sql
CREATE TABLE grant_outcomes (
  id UUID PRIMARY KEY,
  grant_id UUID REFERENCES grants(id),
  outcome_name TEXT NOT NULL,
  measurement_criteria TEXT
);

CREATE TABLE evidence_links (
  id UUID PRIMARY KEY,
  outcome_id UUID REFERENCES grant_outcomes(id),
  content_type TEXT NOT NULL, -- 'story', 'photo', 'quote', 'stat'
  content_id UUID NOT NULL,
  strength_score DECIMAL -- 0-1 confidence
);
```

**Purpose**: Automatically map evidence to funding outcomes for acquittals

#### 3.3 Partnership Network Graph

```sql
CREATE TABLE partner_relationships (
  id UUID PRIMARY KEY,
  partner_id UUID REFERENCES partners(id),
  service_id UUID REFERENCES organization_services(id),
  relationship_type TEXT, -- 'funding', 'referral', 'collaboration'
  started_date DATE,
  value_estimate DECIMAL
);
```

#### 3.4 Community Needs Signal Aggregation

- Monitor community feedback for emerging needs
- Connect to service capacity (are we at limit?)
- Suggest new program development

---

## PART 4: REVENUE & CONTRACT OPPORTUNITIES

### Current Revenue Streams

| Stream | Amount | Notes |
|--------|--------|-------|
| Government Grants | ~$20M+ | Primary funding |
| Telstra Contract | Significant | Municipal services |
| Self-generated | Growing | Photo Studio, Healthy Meals |

### Identified Opportunities

#### 4.1 Technical Assistance Revenue

**From documentation**:
- "Technical assistance revenue stream established" - NOT YET DONE
- "5+ Indigenous orgs adopting model" - Potential clients

**Model**:
- Package PICC's platform as replicable solution
- Other Indigenous communities: setup, training, customization
- Estimated: $10,000-50,000/year in consulting revenue

#### 4.2 Data Sovereignty Consulting

- Growing demand for Indigenous data governance
- PICC is ahead of sector - can advise others
- Blockchain/smart contract for data consent tracking

#### 4.3 Sector Training Hub

- "Training hub for region" - documented in strategic plan
- Digital Service Centre can train other orgs
- AI tools, data management, cultural protocols

#### 4.4 Grant Writing Support

- Evidence pipeline enables better applications
- Track what evidence correlates with success
- Offer grant writing services to similar orgs

### Grant-Focused Improvements

The chatbot should be able to answer:

| Question | Current | Needed |
|----------|---------|--------|
| "What grants are available?" | Partial | Full opportunity finder |
| "What do we need for NIAA acquittal?" | No | Evidence gaps tool |
| "What stories prove youth program impact?" | No | Outcome-linked search |
| "When are grant deadlines?" | No | Deadline tracking |
| "What should we apply for next?" | No | AI recommendation |

---

## PART 5: IMPLEMENTATION PRIORITY

### Recommended Roadmap

#### Month 1-2: Foundation
1. ✅ Deploy current chatbot (done)
2. Add service funding visibility tool
3. Add job/opportunity tool
4. Build grant deadline tracking table

#### Month 3-4: Intelligence
1. Build opportunity finder scraper
2. Create AI matching to services
3. Add opportunity alerts
4. Build evidence-outcome linking

#### Month 5-6: Revenue
1. Package technical assistance offering
2. Create evidence dashboard for staff
3. Build grant application evidence generator
4. Pilot with 2 partner orgs

#### Year 2: Scale
1. Fine-tune Palm Island LLM
2. Predictive analytics
3. Multi-modal story capture
4. Sector-wide network (CivicGraph)

---

## APPENDIX: Key Files Reference

| File | Purpose |
|------|---------|
| `web-platform/app/chat/page.tsx` | Main chat UI |
| `web-platform/app/api/chat/route.ts` | Chat API endpoint |
| `web-platform/lib/explore/tools.ts` | 28 tool definitions |
| `web-platform/lib/explore/system-prompt.ts` | System prompt |
| `web-platform/lib/ai/context-builder.ts` | RAG context |
| `docs/prds/02-grant-evidence-pipeline.md` | Grant evidence plan |
| `docs/archive/AI-INFRASTRUCTURE-AUDIT.md` | AI audit |
| `web-platform/PICC-BRAND-STYLE-GUIDE.md` | Brand guidelines |

---

*Generated: March 2026*
*Method: Karpathy-style autoreviewer recursive analysis*