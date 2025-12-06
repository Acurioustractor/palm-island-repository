# Community Voices - UI Navigation Guide

Quick reference for where to find Community Voices and Groups in your platform.

## 📍 Where to Find It in the Sidebar

### PICC Platform Navigation

Open the sidebar and look for the **"People"** section (teal icon):

```
┌─────────────────────────────┐
│ 📊 Dashboard               │
│ 📖 Stories                 │
│ 👥 People ← YOU ARE HERE   │
│   ├── Storytellers         │
│   ├── Add Storyteller      │
│   ├── Community Voice ✨   │  ← Click here!
│   └── Cultural Protocols   │
│ 📄 Living Ledger           │
│ 🖼️  Media & Projects       │
│ ⚙️  Settings               │
└─────────────────────────────┘
```

## 🎯 Main Pages

### 1. **Community Voice Page**
**Path:** `/picc/community-voice`
**Sidebar:** People → Community Voice

**What you'll see:**
- ✨ Anonymous Voices section (Community Voice, Community Group)
- 👥 Named Groups section (Council of Elders, Youth Voices, Women's Circle, Men's Group)
- Quick guide on when to use each
- List of all stories from community voices
- Review and approval workflow

### 2. **Storytellers Page**
**Path:** `/picc/storytellers`
**Sidebar:** People → Storytellers

**What you'll see:**
- All storyteller profiles including:
  - Individual storytellers (Uncle Frank, Auntie Mary, etc.)
  - Community Voice
  - Council of Elders
  - Youth Voices
  - Women's Circle
  - Men's Group
  - Community Group
- Each shows story count
- Click any to view their stories

### 3. **Create New Story**
**Path:** `/picc/create` or `/stories/new`
**Sidebar:** Quick Actions → "Add New Story" (purple button at top)

**What you'll see:**
- Storyteller dropdown organized in sections:
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
    [all your real people]
  ```

## 🎨 Color Coding

In the UI, sections use different colors:

- **Purple** 🟣 - Anonymous voices
- **Teal** 🟢 - Groups and circles
- **Blue** 🔵 - Individual storytellers

## 📝 Quick Actions

### To Create Anonymous Story:
1. Click **"Add New Story"** (purple button top of sidebar)
2. Under "Storyteller", select **"Community Voice"**
3. Fill in story details
4. Save

### To Create Group Story:
1. Click **"Add New Story"**
2. Under "Storyteller", select group (Council of Elders, Youth Voices, etc.)
3. Fill in story details
4. Save

### To View Community Stories:
1. Click **"Community Voice"** in sidebar (under People)
2. See all anonymous and group stories
3. Filter by status, search, approve/publish

### To View All Storytellers:
1. Click **"Storytellers"** in sidebar (under People)
2. Scroll through all profiles
3. Community voices are mixed with individuals

## 🔍 Finding Things

### "Where are my community voices?"
→ Sidebar: **People → Community Voice**

### "How do I add an anonymous story?"
→ **Add New Story** button → Select "Community Voice" from dropdown

### "Where do I see Council of Elders stories?"
→ **People → Storytellers** → Click "Council of Elders" card

### "How do I create a new group?"
→ The 6 standard groups are pre-created. Use them from the dropdown.

## 📱 Mobile Navigation

On mobile:
1. Tap hamburger menu (☰) in top-left
2. Find **People** section
3. Tap **Community Voice**

## 🎓 Learn More

- **Full Guide:** `COMMUNITY-VOICES-GUIDE.md` (in project root)
- **Setup:** `migrations/community-voices-and-groups.sql`
- **Cleanup:** `scripts/cleanup-community-members.js`

## ✅ Quick Checklist

- [ ] I can find "Community Voice" in the sidebar
- [ ] I can create a story with "Community Voice" selected
- [ ] I can see Community Voice in the storytellers list
- [ ] I understand when to use each option
- [ ] I've read the full guide

## 💡 Pro Tips

1. **Don't create "Community Member X" profiles anymore**
   - Use "Community Voice" instead

2. **Use groups for official gatherings**
   - Council of Elders for elder meetings
   - Youth Voices for youth programs
   - etc.

3. **Individual stories need consent**
   - Only create individual profiles when you have real names and permission

4. **Community Voice protects privacy**
   - Perfect for sensitive stories
   - Encourages open sharing
