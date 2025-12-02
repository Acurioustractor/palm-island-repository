# 🚀 Local Setup Guide - Run the Wiki in VS Code

## Prerequisites

You need these installed on your computer:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** - [Download here](https://git-scm.com/)

---

## Step 1: Open in VS Code

### Option A: Clone the Repository (If not already local)
```bash
git clone https://github.com/Acurioustractor/palm-island-repository.git
cd palm-island-repository
code .
```

### Option B: Open Existing Folder
1. Open VS Code
2. File → Open Folder
3. Navigate to your `palm-island-repository` folder
4. Click "Select Folder"

---

## Step 2: Install Dependencies

Open the **Terminal** in VS Code (View → Terminal or `` Ctrl+` ``)

```bash
# Navigate to web-platform directory
cd web-platform

# Install all dependencies (this takes 2-3 minutes)
npm install
```

You should see something like:
```
added 500+ packages in 2m
```

---

## Step 3: Set Up Environment Variables

Create a file called `.env.local` in the `web-platform` folder:

**In VS Code:**
1. Right-click on `web-platform` folder
2. New File
3. Name it: `.env.local`

**Add this content:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MTU5OTksImV4cCI6MjAzNTQ5MTk5OX0.JGqYN9QyXfzWqZPJrFPGLxNz_lTXN2ydKI71hQGQ0e0

# Optional: For AI features (can leave empty for now)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional: For analytics (can leave empty for now)
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

**Save the file** (Ctrl+S or Cmd+S)

---

## Step 4: Start the Development Server

In the VS Code terminal (still in `web-platform` folder):

```bash
npm run dev
```

You should see:
```
✓ Ready in 3.5s
○ Compiling / ...
✓ Compiled / in 1.2s
```

The server is now running! 🎉

---

## Step 5: View in Your Browser

Open your browser and go to:

**http://localhost:3000**

You should see the Palm Island Community Repository homepage with the new wiki navigation on the left!

---

## 🧭 Navigate the Wiki

### Main Pages:
- **Home**: http://localhost:3000
- **All Stories**: http://localhost:3000/stories
- **Categories**: http://localhost:3000/wiki/categories
- **People Directory**: http://localhost:3000/wiki/people
- **Knowledge Graph**: http://localhost:3000/wiki/graph
- **Search**: http://localhost:3000/search
- **Analytics**: http://localhost:3000/analytics

### Features to Try:
1. ✅ Click on any story to see the new infobox and related content
2. ✅ Use the sidebar navigation (collapsible sections)
3. ✅ Browse categories and see story counts
4. ✅ Search for stories with filters
5. ✅ View the knowledge graph visualization
6. ✅ Check out the analytics dashboard

---

## 🛠️ Useful VS Code Tips

### View Multiple Files Side-by-Side
1. Right-click a file in the sidebar
2. Select "Split Right" or "Split Down"

### Recommended Extensions
Install these VS Code extensions for better development:
- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **Prettier** (esbenp.prettier-vscode)
- **TypeScript** (built-in, but ensure it's enabled)

### Terminal Shortcuts
- **Open Terminal**: `` Ctrl+` `` (backtick)
- **New Terminal**: `Ctrl+Shift+` `
- **Split Terminal**: Click the split icon in terminal panel

---

## 📁 Project Structure Overview

```
web-platform/
├── app/                      # Next.js pages
│   ├── layout.tsx           # Main layout with WikiNavigation
│   ├── page.tsx             # Homepage
│   ├── stories/             # Story pages
│   │   ├── [id]/page.tsx    # Individual story (enhanced!)
│   │   └── page.tsx         # Stories list
│   ├── wiki/                # Wiki pages (NEW!)
│   │   ├── categories/      # Browse categories
│   │   ├── people/          # People directory
│   │   └── graph/           # Knowledge graph
│   ├── search/              # Search page (NEW!)
│   └── analytics/           # Analytics dashboard (NEW!)
├── components/              # React components
│   └── wiki/               # Wiki components (NEW!)
│       ├── WikiNavigation.tsx
│       ├── Breadcrumbs.tsx
│       ├── StoryInfobox.tsx
│       ├── TableOfContents.tsx
│       ├── RelatedContent.tsx
│       ├── KnowledgeGraph.tsx
│       └── EnhancedProfileEditor.tsx
├── lib/                     # Utilities and configs
├── migrations/              # Database migrations (NEW!)
│   └── 001_wiki_infrastructure.sql
└── package.json            # Dependencies
```

---

## 🔧 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:**
```bash
cd web-platform
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Stop the server (Ctrl+C)
# Then run on a different port:
PORT=3001 npm run dev
```
Visit: http://localhost:3001

### Issue: Styles not loading
**Solution:**
```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache:
rm -rf .next
npm run dev
```

### Issue: Database connection errors
The app will still work without database - it just won't load existing stories. You can:
1. Run the migration: `psql $DATABASE_URL < migrations/001_wiki_infrastructure.sql`
2. Or continue browsing the UI (navigation, layouts work without DB)

---

## 🎨 Making Changes

### To edit a page:
1. Find the file in `app/` folder
2. Edit in VS Code
3. Save (Ctrl+S)
4. Browser auto-refreshes! (Hot reload)

### To edit a component:
1. Find the file in `components/wiki/`
2. Edit and save
3. Changes appear immediately

### To edit styles:
- Tailwind CSS classes are inline in components
- Global styles: `app/globals.css`

---

## 📊 Database Setup (Optional)

If you want to run the database migration:

```bash
# Make sure you have PostgreSQL installed and DATABASE_URL set
export DATABASE_URL="your_database_connection_string"

# Run the migration
cd web-platform
psql $DATABASE_URL < migrations/001_wiki_infrastructure.sql
```

This creates:
- Version control tables
- Backlinks system
- Categories with default data
- Knowledge graph structure
- Analytics tracking

---

## 🚀 Quick Start Checklist

- [ ] Open project in VS Code
- [ ] Open terminal (`` Ctrl+` ``)
- [ ] `cd web-platform`
- [ ] `npm install`
- [ ] Create `.env.local` file
- [ ] `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Explore the wiki!

---

## 🎉 You're All Set!

The wiki-style platform is now running locally. You can:
- Browse all pages
- See the new navigation
- Test the components
- View the knowledge graph
- Make changes and see them live

**Happy exploring!** 🌊

---

## 💡 Next Steps

1. **Explore the pages** - Click through categories, people, graph
2. **Check the code** - See how components work
3. **Make tweaks** - Try changing colors, text, layouts
4. **Read the docs** - Check `WIKI-DESIGN-ARCHITECTURE.md`
5. **Run the migration** - If you want full database features

---

**Need help?** Check the other documentation files:
- `WIKI-DESIGN-ARCHITECTURE.md` - Full design spec
- `IMPLEMENTATION-GUIDE-WIKI.md` - Build guide
- `WIKI-BUILD-COMPLETE.md` - Features summary
