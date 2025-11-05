# API Requirements & Integration Guide
## Palm Island Platform

**Date:** November 5, 2025

---

## Required APIs

### 1. Supabase (Core Infrastructure) ⭐ REQUIRED

**Purpose:** Database, Authentication, File Storage
**Cost:** $25/month (Pro plan)
**Setup:** Immediate

```bash
# Sign up: https://supabase.com
# Create project
# Get credentials from Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
```

**Features Used:**
- PostgreSQL database with pgvector extension
- Row Level Security for data sovereignty
- Authentication (email/password, magic links)
- File storage for photos/videos
- Real-time subscriptions
- Automatic API generation

---

### 2. OpenAI API (AI/ML Features) ⭐ PHASE 2

**Purpose:** Embeddings for semantic search, text generation
**Cost:** ~$50/month estimated
**Setup:** When implementing semantic search

```bash
# Sign up: https://platform.openai.com
# Create API key
# Add to environment

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
```

**Use Cases:**
```typescript
// 1. Generate embeddings for semantic search
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-large",
  input: storyContent,
  dimensions: 1536
})

// 2. AI-assisted story categorization
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: `Categorize this story: ${story}` }]
})

// 3. Generate report narratives
const narrative = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: `Write annual report section: ${data}` }]
})
```

---

### 3. Vector Database (Semantic Search) ⭐ PHASE 2

**Option A: Qdrant (Recommended for self-hosted)**
- Free tier: 1GB storage
- Cloud: https://cloud.qdrant.io
- Self-hosted: Easy with Docker

```bash
QDRANT_URL=https://xxx-xxx-xxx.qdrant.io:6333
QDRANT_API_KEY=your-api-key
```

```typescript
// Store embeddings
await qdrant.upsert("stories", {
  points: [{
    id: storyId,
    vector: embedding,
    payload: { title, content, category }
  }]
})

// Semantic search
const results = await qdrant.search("stories", {
  vector: queryEmbedding,
  limit: 10
})
```

**Option B: Pinecone (Cloud-hosted)**
- Free tier: 1 index, 1GB storage
- https://www.pinecone.io

```bash
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=us-west1-gcp-free
PINECONE_INDEX_NAME=palm-island-stories
```

---

### 4. Anthropic Claude (Alternative LLM) - OPTIONAL

**Purpose:** Alternative to OpenAI for text generation
**Cost:** Pay-as-you-go
**Setup:** Optional alternative

```bash
# Sign up: https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
```

**Use Case:**
```typescript
// Generate culturally-sensitive narratives
const message = await anthropic.messages.create({
  model: "claude-3-sonnet-20240229",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: "Generate a community-appropriate summary of this story..."
  }]
})
```

---

### 5. Vercel (Hosting) ⭐ REQUIRED

**Purpose:** Web hosting, serverless functions, CDN
**Cost:** $20/month (Pro plan)
**Setup:** Immediate

```bash
# Sign up: https://vercel.com
# Install CLI: npm i -g vercel
# Deploy: vercel --prod
```

**Features:**
- Automatic deployments from GitHub
- Edge functions
- Analytics
- Preview deployments
- Custom domains

---

### 6. Analytics - OPTIONAL

**Option A: Plausible (Privacy-friendly, Recommended)**
- Cost: $9/month or self-hosted (free)
- https://plausible.io
- GDPR compliant, no cookies

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=palmisland.org.au
```

**Option B: Vercel Analytics**
- Included with Vercel Pro
- Privacy-friendly
- Web Vitals tracking

---

### 7. Error Tracking - RECOMMENDED

**Sentry**
- Free tier: 5,000 errors/month
- https://sentry.io

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

```typescript
// Automatic error tracking
Sentry.captureException(error)
```

---

### 8. Email Service - OPTIONAL

**Option A: Resend (Recommended)**
- Free tier: 100 emails/day
- https://resend.com
- Simple API

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

```typescript
// Send magic link email
await resend.emails.send({
  from: 'Palm Island <noreply@palmisland.org.au>',
  to: user.email,
  subject: 'Your login link',
  html: `<a href="${magicLink}">Click to login</a>`
})
```

**Option B: SendGrid**
- Free tier: 100 emails/day
- https://sendgrid.com

---

### 9. Image Processing - INCLUDED

**Sharp (Already in package.json)**
- Included in Next.js
- Server-side image optimization
- Thumbnail generation

```typescript
import sharp from 'sharp'

await sharp(imageBuffer)
  .resize(800, 600, { fit: 'cover' })
  .webp({ quality: 80 })
  .toFile(outputPath)
```

---

### 10. Maps - OPTIONAL (PHASE 2)

**Mapbox**
- Free tier: 50,000 map loads/month
- https://www.mapbox.com

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic...
```

---

## API Integration Priority

### Phase 1: MVP (Immediate)
```
✅ Supabase (Database, Auth, Storage) - REQUIRED
✅ Vercel (Hosting) - REQUIRED
✅ Sharp (Image processing) - Included
⚪ Plausible Analytics - Optional
⚪ Sentry - Recommended
```

### Phase 2: Enhanced Features (Month 2-3)
```
⚪ OpenAI (Embeddings for semantic search)
⚪ Qdrant or Pinecone (Vector database)
⚪ Resend (Email notifications)
```

### Phase 3: Advanced Features (Month 4-6)
```
⚪ Anthropic Claude (Advanced AI)
⚪ Mapbox (Geographic features)
⚪ Additional ML services as needed
```

---

## Cost Summary

### Minimum Viable Product (MVP)
```
Supabase Pro:        $25/month
Vercel Pro:          $20/month
Domain:              $1.25/month
─────────────────────────────────
Total:               $46.25/month
Annual:              $555/year
```

### With Full Features
```
Supabase:            $25/month
Vercel:              $20/month
OpenAI:              $50/month (estimated usage)
Qdrant Cloud:        $0 (free tier) or $25/month
Plausible:           $9/month
Resend:              $0 (free tier)
Domain:              $1.25/month
─────────────────────────────────
Total:               $105-$130/month
Annual:              $1,260-$1,560/year
```

### Cost Reduction Options
```
- Use Supabase free tier initially (0-2 users): -$25/month
- Self-host Qdrant: -$25/month
- Use Vercel free tier initially: -$20/month
- Self-host Plausible: -$9/month
```

---

## Security Best Practices

### API Key Management

```typescript
// ✅ GOOD: Environment variables
const apiKey = process.env.OPENAI_API_KEY

// ❌ BAD: Hardcoded
const apiKey = "sk-proj-xxxxxxxxxxxx"

// ✅ GOOD: Server-side only
// app/api/generate-embedding/route.ts
export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  // ...
}

// ❌ BAD: Client-side access to secret keys
// components/MyComponent.tsx
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

### Rate Limiting

```typescript
// Protect API routes
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
})

export async function POST(req: Request) {
  const { success } = await ratelimit.limit(req.headers.get("x-forwarded-for"))
  if (!success) return new Response("Too many requests", { status: 429 })

  // Process request...
}
```

---

## Testing API Integrations

### 1. Supabase Connection Test

```bash
# Create test file: scripts/test-supabase.ts
node --loader ts-node/esm scripts/test-supabase.ts
```

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data, error } = await supabase.from('stories').select('count')
console.log('Stories count:', data, error)
```

### 2. OpenAI Test

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Test story content",
})

console.log('Embedding generated:', embedding.data[0].embedding.length, 'dimensions')
```

### 3. Vector DB Test

```typescript
import { QdrantClient } from '@qdrant/js-client-rest'

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
})

const collections = await client.getCollections()
console.log('Collections:', collections)
```

---

## Next Steps

1. **Set up Supabase** (15 minutes)
   - Create account
   - Create project
   - Get API keys
   - Update .env.local

2. **Deploy to Vercel** (10 minutes)
   - Connect GitHub repository
   - Configure environment variables
   - Deploy

3. **Add Analytics** (5 minutes)
   - Sign up for Plausible or use Vercel Analytics
   - Add tracking code

4. **Phase 2: Add AI** (when ready)
   - Sign up for OpenAI
   - Set up vector database
   - Implement semantic search

---

**Status:** Environment configuration ready
**Next:** Create Supabase project and deploy database schema
