# PICC Platform PRDs

Product Requirement Documents for the PICC storytelling platform expansion.

## PRDs

| # | PRD | Status | Priority |
|---|-----|--------|----------|
| 1 | [Visual Report Composer + GHL Distribution](./01-report-composer-distribution.md) | Phase 1 Built | P0 |
| 2 | [Story-Led Grant Evidence Pipeline](./02-grant-evidence-pipeline.md) | Planning | P1 |
| 3 | [GHL Staff & Community Engagement](./03-ghl-staff-engagement.md) | Planning | P1 |
| 4 | [Continuous Story Capture via GHL](./04-story-capture-ghl.md) | Planning | P2 |

## How These Connect

```
CAPTURE (PRD 4)          STORY (PRD 1)           DIRECTION (PRD 2)
  Staff voice notes        Report Composer          Grant evidence
  Community photos         PDF generation           Funding narratives
  Meeting summaries        GHL distribution         Outcome tracking
        |                       |                        |
        +----------+------------+------------+-----------+
                   |                         |
              MEMORY (shared)          ENGAGEMENT (PRD 3)
              Supabase knowledge       GHL workflows
              AI enrichment            Staff/community comms
```

## Building Order

1. **PRD 1** is partially built (Composer UI complete, distribution layer next)
2. **PRD 3** enables the communication backbone all others depend on
3. **PRD 4** feeds the content pipeline that PRDs 1 and 2 consume
4. **PRD 2** is the capstone — tying stories to funding outcomes
