# Contact & Consent Features - Story Submission Guide

## ✅ What's New

We've added powerful contact and consent features to the story submission and review system!

### For Community Members (`/share-voice` form)

**New Optional Fields:**
- ✅ **Email address** - Contact email (optional)
- ✅ **Phone number** - Contact phone (optional)
- ✅ **Follow-up consent** - Checkbox to request contact
- ✅ **Publishing consent** - Checkbox to allow publishing with name (non-anonymous only)

**How It Works:**

1. **Anonymous Submission** (Default)
   - Story goes to "Community Voice" profile
   - Can still provide contact info
   - Can request follow-up
   - Story published anonymously

2. **Named Submission**
   - Uncheck "Share Anonymously"
   - Enter your name
   - Optionally add email/phone
   - Check "I consent to my story being published with my name" if you want attribution
   - If consent NOT given: story can be used for reports but name stays private

### For PICC Staff (`/picc/community-voice` review page)

**What You Now See:**

1. **Contact Information** (when provided)
   - Blue box showing email and/or phone
   - Only visible to staff, never published

2. **Follow-up Flag**
   - Badge: "📞 Wants follow-up"
   - Means person wants to be contacted

3. **Publishing Consent** (for named stories)
   - Badge: "✓ Can publish with name"
   - Green = consent given, can publish with attribution
   - No badge = use for reports only, keep name private

4. **Quick Publish Buttons**
   - "Publish with Name" (if consent given)
   - "Publish Anonymously" (if no consent or anonymous submission)

## 📋 Use Cases

### Use Case 1: Anonymous but Wants Follow-up

**Scenario:** Someone shares a sensitive health story anonymously but wants PICC to contact them

**Form Filled:**
- ✅ Anonymous (checked)
- Title: "My experience with the health service"
- Content: [their story]
- Email: "person@example.com"
- ✅ Wants follow-up (checked)

**Staff Sees:**
- Story attributed to "Community Voice"
- Blue contact box with email
- Badge "📞 Wants follow-up"
- Can publish anonymously OR
- Can contact person first for more details

**Result:** Story published anonymously, but staff can follow up privately

---

### Use Case 2: Named Story with Publishing Consent

**Scenario:** Uncle Frank wants his storm recovery story published with his name

**Form Filled:**
- ❌ Anonymous (unchecked)
- Name: "Uncle Frank Foster"
- Title: "How we got through the storm"
- Content: [his story]
- ✅ Consent to publish with name (checked)

**Staff Sees:**
- Story attributed to "Uncle Frank Foster"
- Badge "✓ Can publish with name"
- Button says "Publish with Name"

**Result:** Story published with full attribution

---

### Use Case 3: Named Story WITHOUT Publishing Consent

**Scenario:** Young person shares education story, wants to help but stay private

**Form Filled:**
- ❌ Anonymous (unchecked)
- Name: "Sarah Johnson"
- Title: "My school experience"
- Content: [her story]
- ❌ Consent to publish with name (NOT checked)
- Email: "sarah@example.com"
- ✅ Wants follow-up (checked)

**Staff Sees:**
- Story shows name "Sarah Johnson" in system
- No "✓ Can publish with name" badge
- Contact email shown
- Badge "📞 Wants follow-up"

**Result:**
- Story NOT published individually with name
- Can be used in thematic reports (de-identified)
- Can contact Sarah for clarification
- Could ask for consent later if want to publish with name

---

### Use Case 4: Quick Community Feedback

**Scenario:** Workshop participant drops quick feedback, no need for follow-up

**Form Filled:**
- ✅ Anonymous (checked)
- Title: "Workshop was great"
- Content: "Really liked the new youth program workshop"
- No contact info
- ❌ Wants follow-up (unchecked)

**Staff Sees:**
- Community Voice attribution
- No contact info
- No follow-up badge
- Quick "Publish Anonymously" button

**Result:** Quick approve and publish

## 🎯 Review Workflow

### Step 1: Story Arrives (status: submitted)

1. Go to `/picc/community-voice`
2. See new story in list
3. Check badges:
   - Anonymous or named?
   - Wants follow-up?
   - Consent to publish with name?
4. Check contact info if provided

### Step 2: Review Content

1. Click "View Full Story" to read
2. Check for:
   - Cultural sensitivity
   - Personal details that need review
   - Quality and appropriateness

### Step 3: Decision

**Option A: Publish Immediately**
- Click "Publish with Name" (if consent given)
- OR "Publish Anonymously"
- Story goes live

**Option B: Follow Up First**
- If "📞 Wants follow-up" badge present
- Use contact email/phone shown
- Reach out for more details
- Then decide on publishing

**Option C: Move to Draft**
- Needs work or more review
- Click "Move to Draft"
- Can publish later

**Option D: Delete**
- Inappropriate or duplicate
- Click trash icon

## 📊 Metadata Storage

All contact and consent info stored in story `metadata` JSON field:

```json
{
  "contact_email": "person@example.com",
  "contact_phone": "0412 345 678",
  "wants_follow_up": true,
  "consent_to_publish_with_name": true,
  "anonymous": false,
  "submission_source": "share_voice_form"
}
```

**Benefits:**
- Flexible structure
- Easy to add more fields later
- Contact info never exposed publicly
- Can query by follow-up status

## 🔒 Privacy & Security

### What's Private (Staff Only)
- ✅ Contact email
- ✅ Contact phone
- ✅ Follow-up preference
- ✅ Publishing consent flag

### What's Public (When Published)
- Story title
- Story content
- Attribution (if consent given)
- Category/tags

### Publishing Rules

**Can Publish with Name IF:**
- ✅ Person unchecked "Anonymous"
- ✅ Person checked "Consent to publish with name"

**Must Publish Anonymously IF:**
- ✅ Person checked "Anonymous" OR
- ✅ Person did NOT give consent to publish with name

**Can Use for Thematic Reports (Always):**
- ✅ Any story, regardless of consent
- ✅ Must de-identify (remove names, details)
- ✅ Part of aggregate summaries

## 📞 Follow-up Best Practices

### When "Wants Follow-up" is Checked

**Do:**
1. Contact within 1-2 weeks
2. Use method they provided (email or phone)
3. Explain who you are (PICC staff)
4. Thank them for sharing
5. Ask clarifying questions
6. Discuss publishing options
7. Respect their wishes

**Email Template:**
```
Subject: Thank you for sharing your story with PICC

Kia ora [Name or "Community Member"],

Thank you for sharing your story "[Title]" with Palm Island Community Company.
We appreciate you taking the time to share your voice.

We'd like to follow up with you to [reason - discuss publishing / gather more details /
check cultural protocols / etc.].

Would you be available for a brief chat? You can reply to this email or call us at
[PICC number].

Warm regards,
[Your name]
PICC Community Stories Team
```

**Don't:**
- Share their contact info with anyone else
- Publish before discussing if they requested follow-up
- Pressure them to consent to anything

## 🚀 Quick Actions Reference

| Story Type | Consent Status | Action |
|------------|---------------|---------|
| Anonymous, no follow-up | N/A | Publish anonymously immediately |
| Anonymous, wants follow-up | N/A | Contact first, then publish anonymously |
| Named, has consent | ✓ Can publish with name | Publish with name |
| Named, NO consent | ❌ No publishing consent | Use for reports only (de-identified) OR contact to request consent |
| Named, wants follow-up | Either | Contact first, discuss options |

## 💡 Examples in Action

### Example 1: Storm Recovery Workshop

**Situation:** You ran a storm recovery workshop with 15 participants. 3 people submitted stories via the form.

**Story 1:**
- Anonymous
- No contact info
- Quick publish anonymously ✓

**Story 2:**
- Anonymous
- Email provided
- Wants follow-up
- Action: Email them, thank them, ask if they want to share more or discuss how story might be used

**Story 3:**
- Name: "Auntie Mary"
- Consented to publish with name
- Action: Publish with name ✓

**Outcome:**
- 2 stories live on site (1 anonymous, 1 with name)
- 1 follow-up conversation in progress
- All 3 can be used in quarterly thematic report

### Example 2: Youth Program Feedback

**Situation:** Youth coordinator shares form link. 8 submissions come in.

**Quick Review:**
- 6 anonymous, no follow-up → Quick publish
- 1 anonymous, wants follow-up → Contact first
- 1 named with consent → Publish with name

**20 minutes later:**
- 7 stories published
- 1 email sent for follow-up
- All stories tagged "youth_program" for thematic analysis

## ✅ System Features

### Form Features (`/share-voice`)
- Contact fields (email, phone) - optional
- Follow-up checkbox
- Publishing consent checkbox (non-anonymous only)
- Clear privacy explanations
- Beautiful, accessible UI

### Review Features (`/picc/community-voice`)
- Contact info displayed clearly (staff only)
- Visual badges for consent and follow-up
- Quick publish buttons with context
- Support for both `submitted` and `pending_review` statuses
- Filter by status
- Search functionality

### Data Features
- Metadata stored securely
- Contact info never exposed publicly
- Query-able for follow-up workflows
- Compatible with existing story system

## 🎓 Training Tips

### For PICC Staff

1. **Check badges first** - They tell you what you can do
2. **Contact info = private** - Never share or publish
3. **Follow-up = priority** - Reach out within 1-2 weeks
4. **Respect consent** - Only publish with name if consent given
5. **Use for reports** - All stories can go in thematic summaries (de-identified)

### For Community Workers

1. **Share the form link** - `/share-voice`
2. **Explain anonymity** - Default is anonymous
3. **Explain follow-up** - Optional, for those who want to discuss more
4. **Explain consent** - Only needed if they want their name published
5. **Reassure privacy** - Contact info stays private with staff

## 📈 Next Steps

### Already Working
- ✅ Contact fields on form
- ✅ Follow-up checkbox
- ✅ Publishing consent
- ✅ Display in review interface
- ✅ Quick publish buttons

### Could Add Later
- Email notification when follow-up requested
- Follow-up tracking (contacted/not contacted)
- Consent request workflow (ask for consent after submission)
- Bulk actions for publishing multiple stories
- Report on follow-up response rates

## 🔧 Technical Details

**Updated Files:**
- `/app/(public)/share-voice/page.tsx` - Added contact and consent fields
- `/app/picc/community-voice/page.tsx` - Display contact info and consent status
- `/app/api/stories/route.ts` - Metadata handling

**Database:**
- No schema changes needed
- Uses existing `metadata` JSONB field on stories table
- Contact info stored in: `metadata.contact_email`, `metadata.contact_phone`
- Flags stored in: `metadata.wants_follow_up`, `metadata.consent_to_publish_with_name`

**Privacy:**
- Metadata field not exposed in public API
- Only visible in staff admin interface
- Not returned in public story queries
