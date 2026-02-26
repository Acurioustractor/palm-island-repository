# PRD 3: GHL Staff & Community Engagement Workflows

**Status**: Planning
**Priority**: P1
**Owner**: PICC Digital Team

---

## Problem

PICC has 100+ staff across 8+ service programs operating on Palm Island. Communication is fragmented: some use email, some only check WhatsApp, some respond to text. There's no unified system for:

- Keeping staff informed about organisational achievements
- Collecting stories and feedback from frontline workers
- Engaging community members in the storytelling process
- Celebrating wins and recognizing contributions
- Coordinating across programs for shared initiatives

GoHighLevel (GHL) is already part of the stack but underutilized for internal engagement.

## Solution

### 3A. Staff Communication Workflows

Use GHL as the unified staff engagement backbone:

#### Onboarding Flow
- New staff member added to GHL -> automated welcome sequence
- Introduction to PICC's storytelling culture
- "Here's how you contribute stories" training drip
- Connect them to their service program's GHL tag

#### Weekly Story Digest
- GHL automated email/SMS every Friday
- "This week at PICC" — curated from platform content
- Highlights from their service program
- "Got a story to share? Reply to this message"

#### Recognition & Celebration
- When a story is published or a report features their program -> notification
- "Your team's work was featured in this month's impact summary"
- Quarterly "Story Champion" recognition via GHL campaign

#### Critical Comms
- Emergency/urgent communications via SMS blast
- Policy updates with read-receipt tracking
- Meeting reminders with agenda links

### 3B. Community Engagement Workflows

#### Story Sharing Invitations
- After community events/programs, send participants a text:
  "Thanks for attending [Program]. Would you like to share your experience?"
- Link to simple story capture form
- Follow-up if no response after 3 days

#### Annual Report Participation
- When annual report season starts, invite community to contribute
- "We're putting together this year's report. Got a photo or story to share?"
- Targeted by program participation history

#### Feedback Loops
- After service delivery, automated satisfaction check
- "How was your experience with [Service]? Reply 1-5"
- Aggregate into service quality metrics
- Route negative feedback to service manager immediately

#### Elder & Cultural Content
- Respectful outreach to Elders for wisdom sharing
- Cultural protocol-aware messaging (no contact during sorry business)
- Permission management built into GHL custom fields

### 3C. Cross-Program Coordination

#### Shared Calendar
- GHL calendar integration for cross-program events
- Auto-notify relevant staff when programs overlap or collaborate

#### Resource Sharing
- "Family Services just did X — could your program benefit from this approach?"
- Cross-pollination of successful stories and methods

#### Monthly All-Staff Update
- Automated compilation of stats across all programs
- "PICC by the numbers this month" with service highlights
- Driven by live platform data, not manual compilation

### 3D. GHL Pipeline Configuration

```
GHL Pipelines:

1. Staff Engagement Pipeline
   Stages: New -> Onboarded -> Active Contributor -> Story Champion

2. Community Story Pipeline
   Stages: Invited -> Responded -> Story Captured -> Published -> Acknowledged

3. Feedback Pipeline
   Stages: Sent -> Received -> Triaged -> Resolved -> Followed Up

4. Report Distribution Pipeline
   Stages: Generated -> Sent -> Opened -> Engaged -> Followed Up
```

### 3E. GHL Custom Fields for PICC

```
Contact Custom Fields:
- picc_role: staff | community_member | elder | board | funder | supporter
- picc_program: health | family | children | justice | digital | crisis | economic
- picc_story_count: number of stories contributed
- picc_last_engagement: date of last platform interaction
- picc_report_versions_received: array of report IDs
- picc_cultural_protocols: sorry_business | ceremony_period | none
- picc_communication_preference: email | sms | whatsapp | all
```

## Technical Architecture

### GHL API Integration

| GHL API | PICC Usage |
|---------|------------|
| `POST /contacts` | Sync staff/community from Supabase |
| `POST /campaigns` | Trigger story digests, report distribution |
| `POST /workflows` | Onboarding, feedback loops, follow-ups |
| `GET /contacts/:id/tasks` | Check engagement status |
| `POST /opportunities` | Track story pipeline stages |
| Webhooks | Receive engagement events back to platform |

### PICC Platform API Routes

| Endpoint | Purpose |
|----------|---------|
| `POST /api/ghl/sync-contacts` | Push Supabase contacts to GHL |
| `POST /api/ghl/trigger-workflow` | Trigger a named GHL workflow |
| `GET /api/ghl/engagement/:contactId` | Get engagement history |
| `POST /api/ghl/webhook` | Receive GHL events |
| `GET /api/staff/digest` | Generate weekly digest content |
| `POST /api/community/invite-story` | Send story invitation via GHL |

### Webhook Events (GHL -> PICC)

| Event | Action |
|-------|--------|
| `email.opened` | Update engagement timestamp |
| `sms.replied` | Route to story capture or feedback |
| `opportunity.stage_changed` | Update story pipeline status |
| `contact.tag_added` | Sync role/program changes |

## Success Metrics

- Staff engagement rate: > 70% open rate on weekly digest
- Story contribution rate: 30% of staff contribute at least 1 story/quarter
- Community response rate: 25% of invited community members share stories
- Feedback completion: 60% of service recipients provide feedback
- Cross-program awareness: staff can name achievements from 2+ other programs

## Dependencies

- GHL account with API access and workflow builder
- Staff contact database in Supabase (team_members table)
- Community contact database (with cultural protocol fields)
- PRD 4 (Story Capture) for content that feeds engagement

## Risks

- Over-communication fatigue — careful frequency management
- Cultural sensitivity in automated messaging
- GHL cost scaling with contact volume
- Staff adoption of new communication channel
- Privacy/consent for community contact data

## Cultural Protocol Rules

- NEVER send automated messages during identified sorry business periods
- Elder communication requires human review before sending
- Community stories need explicit consent before publishing
- All automated content reviewed by Cultural Safety Officer monthly

---

## Implementation Phases

| Phase | What | Effort |
|-------|------|--------|
| 3A | Staff onboarding + weekly digest | 2 weeks |
| 3B | Community story invitations | 1 week |
| 3C | Cross-program coordination | 1 week |
| 3D | GHL pipeline configuration | 3 days |
| 3E | Custom fields + contact sync | 3 days |
