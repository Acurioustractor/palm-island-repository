# PRD 4: Continuous Story Capture via GHL

**Status**: Planning
**Priority**: P2
**Owner**: PICC Digital Team

---

## Problem

The richest stories happen in the moment — during a program session, after a community event, in a casual conversation with an Elder. But capturing these stories requires staff to remember later, sit down at a computer, log into the platform, and write it up. Most stories are lost.

PICC needs story capture to be as easy as sending a text message.

## Solution

### Core Idea: Text a Story, It Becomes Evidence

Staff and community members can capture stories through the channels they already use (SMS, WhatsApp, email) via GHL. The platform receives, enriches, and stores these stories automatically.

### 4A. SMS/WhatsApp Story Capture

#### How It Works

1. Staff member witnesses a meaningful moment
2. They text/WhatsApp a dedicated PICC number: "Today Maria completed her parenting course. She said it changed how she connects with her kids. She was so proud."
3. GHL receives the message, triggers a workflow
4. Platform webhook receives the raw story
5. AI enriches the story:
   - Identifies the service program (Family Services)
   - Extracts the participant name (Maria — anonymized if needed)
   - Tags relevant outcomes (parenting skills, family connection)
   - Suggests evidence links (grant outcome mapping)
   - Generates a polished version while keeping the authentic voice
6. Story appears in platform as draft for review
7. Staff gets a confirmation: "Story captured! We tagged it to Family Services. Review it here: [link]"

#### Photo Capture

- Staff texts a photo with a caption
- Photo uploaded to Supabase storage
- AI generates alt-text, tags service program, suggests page placement
- Available immediately in Report Composer photo picker

#### Voice Note Capture

- Staff sends a voice note via WhatsApp
- Transcribed via Whisper/Deepgram
- Same enrichment pipeline as text stories
- Original audio preserved for authenticity

### 4B. Quick Capture Forms

For more structured capture, GHL-hosted forms accessible via link:

#### Story Form
- Who: participant name (optional, can be anonymous)
- What: what happened (free text, large textarea)
- When: date (defaults to today)
- Where: which program/service
- Photo: optional upload
- Permission: can we share this story? (yes/anonymized/no)

#### Stat Capture
- Service: dropdown of programs
- Metric: what are you reporting (attendance, completion, etc.)
- Value: the number
- Period: date range
- Notes: context

#### Quote Capture
- Speaker: who said it
- Quote: what they said
- Context: when/where
- Permission level: public / anonymized / internal only
- Elder content: yes/no (triggers approval workflow)

### 4C. Capture Prompts (Proactive)

GHL sends targeted capture prompts based on context:

#### Event-Driven
- Calendar event ends -> "How did today's [Program Name] session go? Reply with a quick story or photo"
- Milestone reached -> "A participant just completed [milestone]. Want to capture this moment?"

#### Gap-Driven
- Platform detects no stories from Health Services in 3 weeks
- -> Text to Health Services team lead: "We haven't heard from your team lately. Got a quick win to share?"

#### Seasonal
- Start of reporting period -> "New fiscal year! Let's start capturing stories early"
- 3 months before acquittal -> "NIAA report coming up. We need [X] more stories from [program]"

#### Recognition-Driven
- After someone's story is published -> "Your story was featured! Here's the link. Got another one?"

### 4D. AI Enrichment Pipeline

Every captured story goes through:

```
Raw Input (text/photo/voice)
    |
    v
1. Content Type Detection
   - Is this a story, quote, stat, or photo?
   - Multiple types? Split into separate items
    |
    v
2. Program Classification
   - Which PICC service does this relate to?
   - Confidence score, human review if low
    |
    v
3. Participant Privacy
   - Named participant? Check consent level
   - Auto-anonymize if no explicit consent
   - Flag Elder content for cultural review
    |
    v
4. Outcome Mapping
   - What grant outcomes does this evidence?
   - Link to active grants automatically
   - Score evidence strength
    |
    v
5. Content Enhancement
   - Fix spelling/grammar (preserve voice)
   - Generate title/summary
   - Suggest tags and categories
   - Generate photo alt-text
    |
    v
6. Storage & Notification
   - Save to Supabase (stories, media_files, extracted_quotes)
   - Notify content reviewer
   - Confirm to sender
   - Available in Report Composer
```

### 4E. Capture Dashboard

`/picc/capture/dashboard` — Shows:

- **Capture Feed**: Real-time stream of incoming stories/photos/quotes
- **By Program**: Which programs are capturing the most
- **By Staff**: Who are the active contributors
- **Pending Review**: Stories needing approval/enrichment
- **Capture Trends**: Weekly/monthly capture volume
- **Gap Alerts**: Programs with low capture activity

## Technical Architecture

### GHL Webhook Flow

```
Staff SMS/WhatsApp -> GHL Number
    -> GHL Workflow (route by content type)
    -> Webhook: POST /api/capture/inbound
    -> AI Enrichment Pipeline
    -> Supabase Storage
    -> Confirmation SMS via GHL
```

### API Routes

| Endpoint | Purpose |
|----------|---------|
| `POST /api/capture/inbound` | Receive GHL webhook with raw story |
| `POST /api/capture/enrich` | Run AI enrichment on a capture |
| `GET /api/capture/pending` | List captures pending review |
| `PATCH /api/capture/:id/approve` | Approve/edit a captured story |
| `POST /api/capture/prompt` | Trigger a capture prompt via GHL |
| `GET /api/capture/dashboard` | Dashboard aggregates |
| `POST /api/capture/voice` | Process voice note transcription |

### Database Additions

```sql
-- Raw capture tracking
CREATE TABLE story_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'sms', 'whatsapp', 'email', 'form', 'voice'
  sender_phone TEXT,
  sender_id UUID REFERENCES team_members(id),
  raw_content TEXT NOT NULL,
  content_type TEXT, -- 'story', 'quote', 'stat', 'photo'
  enrichment JSONB, -- AI enrichment results
  status TEXT DEFAULT 'pending', -- pending, reviewed, approved, published
  program_id UUID REFERENCES services(id),
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES team_members(id),
  reviewed_at TIMESTAMPTZ,
  -- After approval, linked to canonical tables
  story_id UUID REFERENCES stories(id),
  media_id UUID REFERENCES media_files(id),
  quote_id UUID REFERENCES extracted_quotes(id)
);

-- Capture prompts sent
CREATE TABLE capture_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_type TEXT NOT NULL, -- 'event', 'gap', 'seasonal', 'recognition'
  recipient_id UUID REFERENCES team_members(id),
  message TEXT NOT NULL,
  sent_via TEXT, -- 'sms', 'whatsapp', 'email'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  response_received BOOLEAN DEFAULT FALSE,
  capture_id UUID REFERENCES story_captures(id) -- linked if they responded
);
```

### GHL Configuration

```
GHL Setup:

1. Dedicated PICC Story Capture Number
   - SMS: Receive texts with stories/photos
   - WhatsApp: Receive messages with voice notes

2. Inbound Message Workflow
   - Trigger: Any inbound SMS/WhatsApp
   - Action: Webhook to /api/capture/inbound
   - Action: Auto-reply "Thanks! We're processing your story..."

3. Capture Prompt Workflows
   - Trigger: Calendar event completion
   - Trigger: Manual trigger from platform
   - Trigger: Scheduled (weekly/monthly)
   - Action: Send personalized capture prompt
```

## Success Metrics

- Capture volume: 20+ stories/month (from near-zero informal capture)
- Staff participation: 40% of staff contribute at least 1 capture/month
- Time from event to capture: < 24 hours average
- Enrichment accuracy: 85%+ correct program classification
- Capture-to-publication rate: 60% of captures become published content

## Dependencies

- GHL phone number with SMS/WhatsApp capability
- AI transcription service for voice notes (Whisper/Deepgram)
- PRD 3 (GHL Staff Engagement) for contact management
- Supabase storage for media uploads

## Risks

- Privacy and consent management for captured stories
- Voice note transcription accuracy in community contexts
- Staff feeling surveilled rather than empowered
- Cost of AI transcription and enrichment at scale
- Cultural safety of automated story processing (Elder content needs human review)

## Cultural Protocol Rules

- Voice notes from Elders flagged for cultural review before AI processing
- No automated publishing — all captures go through human review
- Participant names redacted by default, explicit consent required to publish
- Sorry business periods suppress all capture prompts
- Community members can opt out of all capture prompts at any time

---

## Implementation Phases

| Phase | What | Effort |
|-------|------|--------|
| 4A | SMS/WhatsApp capture via GHL | 2 weeks |
| 4B | Quick capture forms | 1 week |
| 4C | Proactive capture prompts | 1 week |
| 4D | AI enrichment pipeline | 2 weeks |
| 4E | Capture dashboard | 1 week |
