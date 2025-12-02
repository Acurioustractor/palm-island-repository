# Community Voices & Groups Framework

A comprehensive system for capturing anonymous contributions, group discussions, and collective voices alongside individual storytellers.

## Overview

This system enables:
- ✅ **Anonymous individual contributions** - "Community Voice"
- ✅ **Anonymous group discussions** - "Community Group"
- ✅ **Named groups** - Council of Elders, Youth Voices, Women's Circle, Men's Group
- ✅ **Individual storytellers** - Named people

## Standard Profiles Created

### 1. Community Voice
**ID:** `c0000000-0000-0000-0000-000000000001`
**Use for:** Anonymous individual contributions
**Example:** "A community member shares their thoughts on the new health program..."

### 2. Council of Elders
**ID:** `c0000000-0000-0000-0000-000000000002`
**Use for:** Collective wisdom from Elder gatherings
**Example:** "The Council of Elders discusses traditional fishing practices..."

### 3. Youth Voices
**ID:** `c0000000-0000-0000-0000-000000000003`
**Use for:** Young people's perspectives and ideas
**Example:** "Youth group shares their vision for the community center..."

### 4. Women's Circle
**ID:** `c0000000-0000-0000-0000-000000000004`
**Use for:** Women's gatherings and discussions
**Example:** "Women's Circle talks about supporting young mothers..."

### 5. Community Group
**ID:** `c0000000-0000-0000-0000-000000000005`
**Use for:** Anonymous group discussions
**Example:** "A group of community members discussed storm preparedness..."

### 6. Men's Group
**ID:** `c0000000-0000-0000-0000-000000000006`
**Use for:** Men's perspectives and discussions
**Example:** "Men's Group shares their experience with mentoring programs..."

## When to Use Each Option

### ✅ Use "Community Voice" when:
- Someone wants to share anonymously
- You have a quote/thought but no attribution
- Privacy is important
- Individual doesn't want their name public

**Example Story:**
```
Title: "Thoughts on the New Youth Program"
Storyteller: Community Voice
Content: "I've seen the young people really respond to this program.
It's giving them something positive to focus on..."
```

### ✅ Use "Community Group" when:
- Multiple people discussed something together
- Group discussion without specific names
- Workshop or gathering feedback
- Collective thoughts from unnamed participants

**Example Story:**
```
Title: "Community Discussion: Storm Recovery"
Storyteller: Community Group
Content: "During a community meeting, people shared their experiences
recovering from the cyclone. Common themes included..."
```

### ✅ Use Named Groups when:
- Official group has gathered (Council of Elders, Youth Voices, etc.)
- Collective voice representing that group
- Group wants attribution

**Example Story:**
```
Title: "Youth Vision for 2025"
Storyteller: Youth Voices
Content: "The youth group came together to discuss what they want
to see in Palm Island over the next year..."
```

### ✅ Use Individual Storytellers when:
- Person wants their name attached
- Elder sharing traditional knowledge with attribution
- Personal story they want to own

## How to Create Stories with Community Voices

### Option 1: Public Story Form (`/stories/new`)

1. Go to `/stories/new`
2. Under "Storyteller" dropdown, you'll see:
   ```
   ━━━ Community Voices ━━━
     Community Voice (anonymous individual)
     Community Group (anonymous group)

   ━━━ Groups & Circles ━━━
     Council of Elders
     Youth Voices
     Women's Circle
     Men's Group

   ━━━ Individual Storytellers ━━━
     Uncle Frank Foster
     Auntie Mary
     [etc...]
   ```
3. Select the appropriate option
4. Fill in the story details
5. Submit

### Option 2: Admin Interview Upload

When uploading interviews/transcripts:
1. If no specific person → Use "Community Voice"
2. If group discussion → Use appropriate group profile
3. If specific person → Create/use their individual profile

## Database Structure

The system uses the existing `profiles` table with these profiles:

```sql
-- All 6 profiles created with fixed IDs (c0000000-0000-0000-0000-00000000000X)
-- They appear in storyteller dropdowns
-- Stories link via storyteller_id foreign key
-- Multiple stories can share the same community voice profile
```

## Managing Community Member Placeholders

### Delete Old "Community Member X" Profiles

If you have old placeholder profiles like "Community Member 1", "Community Member 2", etc., delete them:

```bash
cd web-platform
node scripts/cleanup-community-members.js
```

This removes all profiles starting with "Community Member".

### Moving Forward

Instead of creating "Community Member X" profiles:
- Use "Community Voice" for anonymous individuals
- Use "Community Group" for anonymous groups
- Create real profiles only when you have actual names

## Viewing Community Voices

All community voices appear in the storytellers page:

```
/picc/storytellers
```

You'll see cards for:
- Community Voice (showing count of anonymous stories)
- Council of Elders (showing group discussions)
- Youth Voices
- Women's Circle
- Community Group
- Men's Group

Each shows:
- Total stories contributed
- Recent stories
- View all stories from that voice

## Best Practices

### ✅ DO:
- Use Community Voice for truly anonymous contributions
- Use named groups when you have official group gatherings
- Add context in story title/content about who shared (without naming)
- Tag stories appropriately

### ❌ DON'T:
- Create fake "Community Member X" profiles
- Use individual profiles for anonymous content
- Lose attribution when you have real names
- Mix anonymous and named content under one profile

## Examples in Practice

### Scenario 1: Workshop Feedback
**Situation:** You ran a workshop, collected sticky notes with thoughts, no names

**Solution:**
- Storyteller: Community Group
- Title: "Workshop Feedback: Youth Services"
- Content: Summarize the themes and key quotes

### Scenario 2: Anonymous Health Story
**Situation:** Someone shared a personal health journey but wants privacy

**Solution:**
- Storyteller: Community Voice
- Title: "A Personal Journey Through the Health System"
- Content: Their story (de-identified)

### Scenario 3: Elder Council Meeting
**Situation:** Official Elder council discusses traditional practices

**Solution:**
- Storyteller: Council of Elders
- Title: "Council Discussion: Passing Knowledge to Youth"
- Content: Summary of discussion
- Optional: Add individual Elder quotes in content

### Scenario 4: Named Person
**Situation:** Uncle Frank wants to share his storm recovery story

**Solution:**
- Storyteller: Uncle Frank Foster (individual profile)
- Title: "Uncle Frank's Storm Recovery Story"
- Content: His story with attribution

## Technical Notes

### Profile IDs
All community voice profiles use special IDs starting with `c0000000`:
- Prevents conflicts with user-generated UUIDs
- Easy to filter/identify in queries
- Consistent across environments

### Counters
The `stories_contributed` counter automatically increments when stories are added.

### Directory Visibility
All community voice profiles have:
- `show_in_directory: true`
- `profile_visibility: 'public'`

They appear in public storyteller listings.

## Migration Path

If you have existing "Community Member X" profiles:

1. **Audit:** Check if any have real content
   ```bash
   # Check via Supabase dashboard or:
   cd web-platform
   # Look at profiles
   ```

2. **Backup:** Export any real stories

3. **Clean:** Run cleanup script
   ```bash
   node scripts/cleanup-community-members.js
   ```

4. **Migrate:** Move any real content to appropriate community voice

## Future Enhancements

Possible additions:
- `group_members` field to list participants (when known)
- `is_group` and `is_anonymous` flags for filtering
- Dedicated group discussion interface
- Multi-contributor stories

## Support

Questions about which storyteller to use?

**General rule:**
- Real name & willing to share → Individual profile
- Anonymous individual → Community Voice
- Anonymous/unnamed group → Community Group
- Named official group → Council/Youth/Women's/Men's

When in doubt, use Community Voice or Community Group and add context in the story content.
