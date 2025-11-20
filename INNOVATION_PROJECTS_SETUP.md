# Innovation Projects Setup Guide

PICC's Innovation Showcase - The Station, Elders Trips, On-Country Server, and Annual Reports

## Quick Setup

### Step 1: Create Project Records

Run this SQL in your Supabase SQL Editor:

```sql
-- Run: web-platform/lib/empathy-ledger/innovation-projects.sql
```

This creates 4 innovation project records:

1. **The Station** (`the-station`)
2. **Elders Trips** (`elders-trips`)
3. **On-Country Server** (`on-country-server`)
4. **Automated Annual Reports** (`annual-report`)

### Step 2: Access the Pages

Once projects are created in the database, they're automatically accessible via:

- http://localhost:3000/picc/projects/the-station
- http://localhost:3000/picc/projects/elders-trips
- http://localhost:3000/picc/projects/on-country-server
- http://localhost:3000/picc/projects/annual-report
- http://localhost:3000/picc/projects/photo-studio (should already exist)

### Step 3: Navigation Links

The PICC admin navigation already has links to these projects under:
**Innovation Projects > [Project Name]**

## Project Details

### 1. The Station 🏢
**Community hub connecting culture, learning, and innovation**

- **Status**: Active
- **Type**: Infrastructure
- **Focus Areas**: Education, Culture, Employment, Innovation

A physical and digital space where traditional knowledge meets modern technology.

**Features**:
- Community learning space
- Cultural programs with Elders
- Technology access
- Youth hub
- Innovation lab

### 2. Elders Trips 👴
**Connecting Elders with Country and sharing cultural knowledge**

- **Status**: Active
- **Type**: Program
- **Focus Areas**: Culture, Health, Education, Elders

Takes Elders on cultural connection trips to traditional Country.

**Outcomes**:
- Cultural knowledge preservation
- Intergenerational learning
- Elder wellbeing
- Photo/video documentation

### 3. On-Country Server 💾
**Community-controlled data storage and digital infrastructure**

- **Status**: Planning
- **Type**: Infrastructure
- **Focus Areas**: Data Sovereignty, Infrastructure, Innovation

Local server infrastructure ensuring community data never leaves the island without permission.

**Benefits**:
- Data sovereignty
- Cultural safety for sensitive knowledge
- Resilience (works offline)
- No third-party access
- Faster local content access

### 4. Automated Annual Reports 📊
**Generate funder reports from real community stories**

- **Status**: Active
- **Type**: System
- **Focus Areas**: Innovation, Governance

Generates annual reports directly from stories shared by community members throughout the year.

**Process**:
1. Community shares stories year-round
2. Stories tagged by program area
3. AI helps format for funder requirements
4. Staff review and finalize
5. Authentic community voice in reports

**Benefits**:
- Real stories from community members (not consultants)
- Continuous documentation
- Saves time and money
- Better evidence of impact

## How the Dynamic Routing Works

All project pages use the same template at:
```
/app/picc/projects/[slug]/page.tsx
```

This page:
1. Looks up the project by `slug` in the database
2. Loads project details, updates, media, milestones
3. Displays a rich project showcase page
4. Links to immersive stories (if available)

## Adding Project Content

### Add Project Updates

Go to: `/picc/projects/[slug]/updates/new`

Example: `/picc/projects/the-station/updates/new`

### Add Project Photos/Media

1. Upload to Media Library: `/picc/media/upload`
2. Tag with project slug
3. Or use the project's story builder

### Link Stories to Projects

When creating stories, set the `project_id` field to link them to a specific project.

### Create Milestones

Milestones can be added directly in the database:

```sql
INSERT INTO project_milestones (
  project_id,
  title,
  description,
  target_date,
  status
) VALUES (
  (SELECT id FROM projects WHERE slug = 'the-station'),
  'Grand Opening',
  'Official opening ceremony with community',
  '2024-03-15',
  'completed'
);
```

## Customization

### Add Immersive Stories

To link an immersive scrollytelling story to a project:

1. Create the immersive story at `/immersive-stories/[story-slug]`
2. Add the mapping in `/app/picc/projects/[slug]/page.tsx`:

```typescript
const storyUrls: Record<string, string> = {
  'photo-studio': '/immersive-stories/photo-studio-journey',
  'the-station': '/immersive-stories/the-station-story', // Add this
  'elders-trips': '/immersive-stories/elders-journey',    // Add this
};
```

### Add Hero Images

Update project records with `hero_image_url`:

```sql
UPDATE projects
SET hero_image_url = 'https://your-image-url.jpg'
WHERE slug = 'the-station';
```

### Set Budget & Timeline

```sql
UPDATE projects
SET
  budget_total = 150000,
  budget_spent = 45000,
  start_date = '2023-06-01',
  target_completion_date = '2025-12-31'
WHERE slug = 'the-station';
```

## Project Status Values

- `planning` - In design/planning phase
- `active` - Currently running
- `on_hold` - Temporarily paused
- `completed` - Finished
- `archived` - No longer active

## Next Steps

1. **Run the SQL** to create project records
2. **Add photos** to each project via media library
3. **Write updates** about project progress
4. **Link stories** created about these projects
5. **Create immersive stories** for major projects (optional but recommended)

## Public Showcase

Projects marked as `is_public = true` and `featured = true` will appear on:
- Public projects page: `/projects`
- PICC dashboard highlights
- Innovation showcase sections

Share project URLs with funders, partners, and community to demonstrate PICC's innovation work!
