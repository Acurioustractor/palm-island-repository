# 🤖 Set Up AI Features (Semantic Search) - Step by Step

**Goal:** Get semantic search working so you can search stories by meaning, not just keywords!

**Time:** 15-20 minutes

---

## ✅ Prerequisites Check

Before we start, make sure:
- [x] Database is set up (you're done ✅)
- [x] App runs locally (`npm run dev`)
- [ ] OpenAI API key (we'll get this now)

---

## 🎯 Step 1: Get OpenAI API Key (5 minutes)

### A. Create OpenAI Account

1. **Go to:** https://platform.openai.com
2. **Click:** "Sign up" (or "Log in" if you have an account)
3. **Sign up with:** Email, Google, or Microsoft account

### B. Add Payment Method

⚠️ **Important:** OpenAI requires a payment method, BUT the costs are very low:
- **Initial setup:** ~$0.01 (1 cent)
- **Monthly usage:** ~$1-5/month for typical usage
- **Per search:** ~$0.00002 (0.002 cents)

1. **Go to:** https://platform.openai.com/settings/organization/billing
2. **Click:** "Add payment method"
3. **Add:** Credit/debit card
4. **Set usage limit:** $10/month (recommended to start)

### C. Create API Key

1. **Go to:** https://platform.openai.com/api-keys
2. **Click:** "Create new secret key"
3. **Name it:** "Palm Island Story Server"
4. **Permissions:** All (default)
5. **Click:** "Create secret key"
6. **COPY THE KEY NOW** (starts with `sk-proj-...`)
   - ⚠️ You can only see it once!
   - Save it somewhere safe temporarily

---

## 🎯 Step 2: Add API Key to Your App (2 minutes)

### A. Open your .env.local file

```bash
cd web-platform
code .env.local
```

Or:
```bash
nano .env.local
```

### B. Add these lines

Add or update these variables:

```bash
# OpenAI API Key for AI features
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Model Configuration (these are good defaults)
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Enable AI Features
NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=true
NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION=false
```

### C. Save the file

- VS Code: **Cmd+S** (or Ctrl+S)
- Nano: **Ctrl+X**, then **Y**, then **Enter**

---

## 🎯 Step 3: Restart Your App (1 minute)

The app needs to reload the new environment variables.

### In your terminal where `npm run dev` is running:

1. **Press:** `Ctrl+C` (stops the server)
2. **Run again:** `npm run dev`
3. **Wait:** For "Ready" message
4. **Open browser:** http://localhost:3000

---

## 🎯 Step 4: Test the Research Hub (2 minutes)

### A. Navigate to Research Page

**Go to:** http://localhost:3000/research

You should see:
- ✅ "AI-Powered Research" heading
- ✅ Four feature cards (Semantic Search, Theme Explorer, Quote Finder, Research Assistant)
- ✅ "Try Semantic Search" button

### B. Click "Semantic Search"

**Go to:** http://localhost:3000/research/semantic-search

You should see:
- ✅ Search box with sparkle icon
- ✅ "Search in: All Content / Stories / Documents" options
- ✅ Example queries
- ✅ Search tips

---

## 🎯 Step 5: Check If You Have Stories (2 minutes)

Before we can search, we need to know if you have stories to search!

### Run this in Supabase SQL Editor:

```sql
-- Check how many published stories you have
SELECT COUNT(*) as total_stories
FROM stories
WHERE is_published = true;

-- See a few stories
SELECT id, title, created_at
FROM stories
WHERE is_published = true
ORDER BY created_at DESC
LIMIT 5;
```

**Tell me:** How many stories do you have?

---

## 🎯 Step 6A: If You Have Stories - Generate Embeddings

**Only do this if you have stories!**

### A. Create the script

Create file: `web-platform/scripts/generate-embeddings.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/openai/embeddings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Starting embedding generation...\n');

  // Get all published stories without embeddings
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching stories:', error);
    return;
  }

  if (!stories || stories.length === 0) {
    console.log('No published stories found.');
    return;
  }

  console.log(`Found ${stories.length} published stories\n`);

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    console.log(`[${i + 1}/${stories.length}] Processing: ${story.title}`);

    try {
      // Fetch the full story
      const { data: fullStory } = await supabase
        .from('stories')
        .select('id, title, content, summary')
        .eq('id', story.id)
        .single();

      if (!fullStory) {
        console.log('  ❌ Story not found');
        failed++;
        continue;
      }

      // Combine text for embedding
      const textToEmbed = [
        fullStory.title,
        fullStory.summary || '',
        fullStory.content || ''
      ].filter(Boolean).join('\n\n');

      if (!textToEmbed.trim()) {
        console.log('  ⚠️  No content to embed');
        failed++;
        continue;
      }

      // Generate embedding
      const embedding = await generateEmbedding(textToEmbed);

      // Store in database
      const { error: upsertError } = await supabase
        .from('story_embeddings')
        .upsert({
          story_id: story.id,
          embedding: JSON.stringify(embedding),
          model_version: 'text-embedding-3-small',
          token_count: Math.ceil(textToEmbed.length / 4)
        }, {
          onConflict: 'story_id'
        });

      if (upsertError) {
        console.log(`  ❌ Failed to store: ${upsertError.message}`);
        failed++;
      } else {
        console.log('  ✅ Embedding generated and stored');
        successful++;
      }

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${stories.length}`);
}

main().catch(console.error);
```

### B. Run the script

```bash
npx tsx scripts/generate-embeddings.ts
```

**This will:**
- Generate embeddings for all your published stories
- Take ~10 seconds per 10 stories
- Cost ~$0.01 per 100 stories (super cheap!)

**Expected output:**
```
🚀 Starting embedding generation...

Found 15 published stories

[1/15] Processing: My First Story
  ✅ Embedding generated and stored
[2/15] Processing: Another Story
  ✅ Embedding generated and stored
...

📊 Summary:
✅ Successful: 15
❌ Failed: 0
📈 Total: 15
```

---

## 🎯 Step 6B: If You DON'T Have Stories - Create Test Stories

### Option 1: Create via UI

1. **Go to:** http://localhost:3000/stories/new
2. **Create a test story:**
   - Title: "Traditional Fishing Methods"
   - Content: "Our elders taught us to fish using traditional methods passed down through generations. We use handmade nets and read the tides..."
3. **Click:** "Publish"
4. **Create 2-3 more test stories** with different topics

### Option 2: Create via SQL

Run this in Supabase SQL Editor:

```sql
-- Create a test profile first (if you don't have one)
INSERT INTO profiles (full_name, preferred_name, storyteller_type)
VALUES ('Test Elder', 'Elder Joe', 'elder')
RETURNING id;

-- Use that ID in the stories below (replace YOUR_PROFILE_ID)

-- Insert test stories
INSERT INTO stories (storyteller_id, title, summary, content, is_published) VALUES
(
  'YOUR_PROFILE_ID',
  'Traditional Fishing Methods',
  'Stories about traditional fishing practices on Palm Island',
  'Our elders taught us to fish using traditional methods passed down through generations. We use handmade nets and read the tides. The moon tells us when fish will be plentiful. In the early morning, we go out in small boats and sing the old songs.',
  true
),
(
  'YOUR_PROFILE_ID',
  'Cyclone Stories',
  'Experiences from the big cyclones that hit our island',
  'I remember when the cyclone came in 2019. The wind was so strong it took the roof off our house. Everyone came together to help rebuild. The community showed its true strength during those difficult times. We shared food and shelter.',
  true
),
(
  'YOUR_PROFILE_ID',
  'Community Gathering',
  'Annual community events and cultural celebrations',
  'Every year we gather for the festival. There is dancing, singing, and traditional food. The elders tell stories to the young ones. It is a time when the whole community comes together and celebrates our culture and identity.',
  true
);
```

Then run the embedding generation script from Step 6A.

---

## 🎯 Step 7: Test Semantic Search! (5 minutes)

### A. Go to the search page

**Navigate to:** http://localhost:3000/research/semantic-search

### B. Try these test searches

**Search 1: Natural language question**
```
traditional fishing practices
```

**Expected:** Should find stories about fishing, even if they don't use the exact words "traditional fishing practices"

**Search 2: Conceptual search**
```
stories about community coming together
```

**Expected:** Should find stories about community, gatherings, helping each other, etc.

**Search 3: Theme-based search**
```
elder wisdom and cultural knowledge
```

**Expected:** Should find stories from elders, cultural content

### C. What to look for

✅ **Search returns results** (even if query words don't exactly match)
✅ **Similarity scores shown** (e.g., "85% match")
✅ **Results are relevant** to your query
✅ **Response time < 3 seconds**

---

## 🎯 Step 8: Verify It's Working

### A. Check the database

Run in Supabase SQL Editor:

```sql
-- Check how many embeddings were generated
SELECT COUNT(*) as embeddings_created
FROM story_embeddings;

-- Should match your published stories count
SELECT
  (SELECT COUNT(*) FROM stories WHERE is_published = true) as total_stories,
  (SELECT COUNT(*) FROM story_embeddings) as total_embeddings,
  CASE
    WHEN (SELECT COUNT(*) FROM stories WHERE is_published = true) =
         (SELECT COUNT(*) FROM story_embeddings)
    THEN '✅ All stories have embeddings'
    ELSE '⚠️ Some stories missing embeddings'
  END as status;
```

### B. Test the API directly

In VS Code, create: `web-platform/test-semantic-search.ts`

```typescript
async function test() {
  const response = await fetch('http://localhost:3000/api/ai/search/semantic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'traditional fishing',
      searchType: 'all',
      limit: 5
    })
  });

  const data = await response.json();
  console.log('Results:', data);
}

test();
```

Run:
```bash
npx tsx test-semantic-search.ts
```

**Expected:** Should return matching stories with similarity scores

---

## 🎉 Success Criteria

You know it's working when:

- ✅ Search page loads without errors
- ✅ Can enter queries and click search
- ✅ Results appear (if you have stories)
- ✅ Results are relevant to query
- ✅ Similarity scores show (e.g., "92% match")
- ✅ Can click results to view full story
- ✅ Different phrasings find same content
  - "fishing methods" and "catching fish" find same stories
  - "community gathering" and "people coming together" find same stories

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
**Fix:**
- Check your OpenAI API key in `.env.local`
- Make sure it starts with `sk-proj-`
- Try creating a new key

### Error: "No search results"
**Cause:** No embeddings generated yet
**Fix:** Run the embedding generation script (Step 6A)

### Error: "Module not found"
**Fix:**
```bash
npm install openai
```

### Search returns irrelevant results
**Cause:** Need more/better stories, or embeddings are old
**Fix:**
- Add more detailed story content
- Regenerate embeddings
- Try different queries

### Slow response (> 5 seconds)
**Cause:** OpenAI API can be slow sometimes
**Expected:** Usually 1-3 seconds is normal
**Fix:** This is usually temporary, try again

---

## 📊 Monitor Costs

### Check your OpenAI usage:

1. **Go to:** https://platform.openai.com/usage
2. **View:** Daily usage
3. **Expected costs:**
   - Embedding generation: $0.01 per 100 stories
   - Each search: $0.00002 (basically free)
   - Monthly: $1-5 for typical usage

### Set up usage alerts:

1. **Go to:** https://platform.openai.com/settings/organization/billing
2. **Set up:** Email notification at $5
3. **Set:** Hard limit at $10/month

---

## 🎯 Next Steps After Semantic Search Works

Once semantic search is working:

1. **Try different queries** - see what works best
2. **Add more stories** - more content = better results
3. **Share with team** - get feedback on search quality
4. **Enable other AI features:**
   - Theme extraction
   - Quote finder
   - Research assistant chat

---

## 📚 Reference Documentation

- **Full AI docs:** `AI_FEATURES_DOCUMENTATION.md`
- **Quick troubleshooting:** `AI_QUICK_START.md`
- **API setup:** `API_KEYS_SETUP_GUIDE.md`

---

## ✅ Checklist

- [ ] OpenAI account created
- [ ] Payment method added
- [ ] API key generated and copied
- [ ] API key added to `.env.local`
- [ ] Feature flag enabled (`NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=true`)
- [ ] App restarted
- [ ] Research page loads
- [ ] Have stories (or created test stories)
- [ ] Embeddings generated
- [ ] Search returns results
- [ ] Results are relevant

---

**Where are you in this process? Let me know if you hit any snags!** 🚀
