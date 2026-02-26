# PRD 2: Story-Led Grant Evidence Pipeline

**Status**: Planning
**Priority**: P1
**Owner**: PICC Digital Team

---

## Problem

PICC relies on grants and government funding. Grant applications and acquittals require evidence of impact — but this evidence currently lives in scattered places: photos on phones, quotes in meeting minutes, stats in spreadsheets, stories told but never recorded. When grant deadlines hit, staff scramble to assemble evidence retroactively.

Meanwhile, the platform already captures rich storytelling content (photos, community voices, elder quotes, service statistics) through the annual report system. This content IS the evidence funders need — it's just not packaged for that purpose.

## Solution

### Core Idea: Every Story Is Evidence

Reframe the storytelling platform as a continuous evidence generator. When a community member shares a story, when a photo is tagged to a service, when a stat is recorded — each of these is a potential piece of grant evidence. The pipeline automatically maps stories to funding outcomes.

### 2A. Evidence Tagging Layer

Add funding-relevant metadata to existing content:

- **Outcome Mapping**: Link stories/photos/quotes to grant outcome categories
  - e.g., "Family reunification" outcome -> tagged stories from Family Services
  - e.g., "Cultural preservation" outcome -> elder quotes, ceremony photos
  - e.g., "Youth engagement" outcome -> youth program stats, participant stories

- **Funder Taxonomy**: Map outcomes to specific funder requirements
  - NIAA (National Indigenous Australians Agency) outcome frameworks
  - Queensland Government service agreement KPIs
  - Philanthropic foundation impact categories

- **Evidence Scoring**: Rate content pieces by evidence strength
  - Direct quote from participant = high evidence
  - Photo of activity = medium evidence
  - Aggregate stat = supporting evidence
  - Combined (story + photo + stat) = compelling evidence package

### 2B. Grant Evidence Dashboard

`/picc/grants/evidence` — A dashboard that shows:

- **By Funder**: What evidence exists for each funding body's requirements
- **By Outcome**: Which outcomes have strong/weak evidence coverage
- **By Service**: Which programs are generating the most evidence
- **Gaps Alert**: "You have no evidence for [outcome X] — here's where to get it"
- **Timeline**: Evidence accumulation over the reporting period

### 2C. Evidence Package Generator

When a grant acquittal or application is due:

1. Select the funder/grant
2. System auto-populates with matching evidence (stories, photos, stats)
3. Staff review and curate (similar to Report Composer flow)
4. Generate formatted evidence package:
   - PDF appendix for grant applications
   - Impact narrative section (AI-assisted writing from real stories)
   - Photo evidence sheets with captions and dates
   - Statistical summary tables

### 2D. Proactive Evidence Capture

GHL-driven prompts to fill evidence gaps:

- "We need a participant story from Justice Services for the NIAA acquittal (due March 15)"
- Text/WhatsApp to relevant staff: "Can you capture a quick story from today's session?"
- Auto-remind when evidence gaps exist for upcoming deadlines

### 2E. Funder Reporting Templates

Pre-built report templates mapped to specific funders:

| Funder | Template | Sections |
|--------|----------|----------|
| NIAA | Activity Report | Outcomes, participant data, stories, financials |
| Qld Gov | Service Agreement Report | KPIs, case studies, stats |
| Philanthropic | Impact Report | Stories, photos, outcomes narrative |
| Corporate | Social Impact Summary | Key stats, hero stories, photos |

## Technical Architecture

### New Database Tables

```sql
-- Grant/funder tracking
CREATE TABLE grants (
  id UUID PRIMARY KEY,
  funder_name TEXT NOT NULL,
  grant_name TEXT NOT NULL,
  amount DECIMAL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active', -- active, acquitted, expired
  outcome_framework JSONB -- funder's required outcomes
);

-- Outcome categories
CREATE TABLE grant_outcomes (
  id UUID PRIMARY KEY,
  grant_id UUID REFERENCES grants(id),
  outcome_name TEXT NOT NULL,
  description TEXT,
  target_metric TEXT,
  target_value NUMERIC
);

-- Evidence-to-outcome mapping
CREATE TABLE evidence_links (
  id UUID PRIMARY KEY,
  outcome_id UUID REFERENCES grant_outcomes(id),
  content_type TEXT NOT NULL, -- 'story', 'photo', 'quote', 'stat'
  content_id UUID NOT NULL, -- references stories.id, media_files.id, etc.
  evidence_strength TEXT DEFAULT 'medium', -- low, medium, high
  notes TEXT,
  linked_by UUID REFERENCES team_members(id),
  linked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant deadlines
CREATE TABLE grant_deadlines (
  id UUID PRIMARY KEY,
  grant_id UUID REFERENCES grants(id),
  deadline_type TEXT NOT NULL, -- 'acquittal', 'progress_report', 'application'
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'upcoming' -- upcoming, in_progress, submitted
);
```

### API Routes

| Endpoint | Purpose |
|----------|---------|
| `GET /api/grants` | List grants with evidence coverage |
| `GET /api/grants/:id/evidence` | Evidence for a specific grant |
| `POST /api/grants/:id/evidence/link` | Link content to an outcome |
| `GET /api/grants/gaps` | Evidence gaps across all grants |
| `POST /api/grants/:id/generate-package` | Generate evidence package PDF |
| `GET /api/grants/dashboard` | Dashboard aggregates |

### Integration Points

- **Supabase**: All data storage, real-time updates
- **React PDF**: Evidence package generation (reuse existing PDF pipeline)
- **GHL**: Deadline reminders, evidence capture prompts
- **AI**: Narrative generation from evidence, gap analysis

## Success Metrics

- Evidence coverage: > 80% of required outcomes have linked evidence
- Time to prepare acquittal: < 1 day (from 1-2 weeks)
- Proactive capture rate: 60% of evidence captured before deadline pressure
- Grant success rate: track correlation between evidence quality and funding outcomes

## Dependencies

- PRD 1 (Report Composer) — evidence packages use same PDF pipeline
- PRD 4 (Story Capture) — continuous content feeds the evidence base
- PRD 3 (GHL Engagement) — deadline reminders and capture prompts

## Risks

- Staff resistance to tagging content with evidence metadata
- Funder outcome frameworks change without notice
- Over-reliance on AI-generated narratives (must stay authentic)

---

## Implementation Phases

| Phase | What | Effort |
|-------|------|--------|
| 2A | Evidence tagging + outcome mapping | 2 weeks |
| 2B | Grant evidence dashboard | 1 week |
| 2C | Evidence package generator | 2 weeks |
| 2D | GHL-driven proactive capture | 1 week |
| 2E | Funder-specific templates | 1 week |
