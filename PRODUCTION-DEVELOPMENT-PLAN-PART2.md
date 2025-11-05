# Production & Development Plan - Part 2
## Sprints 2-4: Core Features & Annual Report MVP

**Continuation of:** PRODUCTION-DEVELOPMENT-PLAN.md
**Date:** November 5, 2025

---

## Sprint 2: Core Features Development (Days 15-28)

### Week 3: Story Display & Submission

#### Day 15-17: Story Pages

**Task 2.1: Story List Page**

Create `web-platform/app/stories/page.tsx`:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase'
import { StoryCard } from '@/components/StoryCard'
import { StoryFilters } from '@/components/StoryFilters'

export const metadata = {
  title: 'Stories | Palm Island Story Server',
  description: 'Browse community stories from Palm Island'
}

export default async function StoriesPage({
  searchParams
}: {
  searchParams: { category?: string; search?: string }
}) {
  const supabase = createServerSupabaseClient()

  // Build query
  let query = supabase
    .from('stories')
    .select(`
      *,
      storyteller:profiles!storyteller_id(full_name, display_name, avatar_url),
      service:organization_services(name, slug)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.category) {
    query = query.contains('category', [searchParams.category])
  }

  if (searchParams.search) {
    query = query.textSearch('search_vector', searchParams.search)
  }

  const { data: stories, error } = await query

  if (error) {
    console.error('Error fetching stories:', error)
    return <div>Error loading stories</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Stories</h1>
        <p className="text-lg text-gray-600">
          Voices, memories, and knowledge from Palm Island
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <aside className="lg:col-span-1">
          <StoryFilters currentCategory={searchParams.category} />
        </aside>

        {/* Story grid */}
        <main className="lg:col-span-3">
          {stories && stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No stories found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
```

**Task 2.2: Story Detail Page**

Create `web-platform/app/stories/[id]/page.tsx`:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { StoryContent } from '@/components/StoryContent'
import { RelatedStories } from '@/components/RelatedStories'
import { StoryContext } from '@/components/StoryContext'
import { trackStoryView } from '@/lib/analytics'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: story } = await supabase
    .from('stories')
    .select('title, summary')
    .eq('id', params.id)
    .single()

  if (!story) return {}

  return {
    title: `${story.title} | Palm Island Story Server`,
    description: story.summary || story.title
  }
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: story, error } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:profiles!storyteller_id(
        full_name,
        display_name,
        avatar_url,
        community_role
      ),
      service:organization_services(name, slug),
      media:media_files(*)
    `)
    .eq('id', params.id)
    .eq('published', true)
    .single()

  if (error || !story) {
    notFound()
  }

  // Track view (server-side)
  await trackStoryView(story.id)

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        {story.featured_image_url && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={story.featured_image_url}
              alt={story.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          {story.category?.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>

        <div className="flex items-center gap-4 text-gray-600">
          {story.storyteller && (
            <div className="flex items-center gap-2">
              {story.storyteller.avatar_url && (
                <img
                  src={story.storyteller.avatar_url}
                  alt={story.storyteller.display_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {story.storyteller.display_name || story.storyteller.full_name}
                </p>
                {story.storyteller.community_role && (
                  <p className="text-sm">{story.storyteller.community_role}</p>
                )}
              </div>
            </div>
          )}

          {story.story_date && (
            <time dateTime={story.story_date}>
              {format(new Date(story.story_date), 'MMMM d, yyyy')}
            </time>
          )}

          {story.service && (
            <div className="text-sm">
              <span className="text-gray-500">Service: </span>
              <span className="font-medium">{story.service.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <StoryContent content={story.content} media={story.media} />
      </div>

      {/* Context sidebar */}
      <aside className="mb-12">
        <StoryContext story={story} />
      </aside>

      {/* Related stories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Related Stories</h2>
        <RelatedStories storyId={story.id} category={story.category} />
      </section>
    </article>
  )
}
```

**Task 2.3: Story Components**

Create `web-platform/components/StoryCard.tsx`:

```typescript
import Link from 'next/link'
import { format } from 'date-fns'

interface StoryCardProps {
  story: {
    id: string
    title: string
    summary?: string
    featured_image_url?: string
    category?: string[]
    story_date?: string
    storyteller?: {
      display_name?: string
      full_name?: string
    }
    view_count?: number
  }
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link
      href={`/stories/${story.id}`}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      {story.featured_image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={story.featured_image_url}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {story.category && story.category.length > 0 && (
          <div className="flex gap-2 mb-2">
            {story.category.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">
          {story.title}
        </h3>

        {story.summary && (
          <p className="text-gray-600 mb-4 line-clamp-3">{story.summary}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          {story.storyteller && (
            <span>{story.storyteller.display_name || story.storyteller.full_name}</span>
          )}

          {story.story_date && (
            <time dateTime={story.story_date}>
              {format(new Date(story.story_date), 'MMM d, yyyy')}
            </time>
          )}
        </div>
      </div>
    </Link>
  )
}
```

#### Day 18-21: Story Submission

**Task 2.4: Story Submission Form**

Create `web-platform/app/stories/submit/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { StorySubmissionForm } from '@/components/StorySubmissionForm'
import { useAuth } from '@/hooks/useAuth'

export default function SubmitStoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to submit a story.
          </p>
          <a
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Insert story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          organization_id: formData.organization_id,
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          storyteller_id: user.id,
          category: formData.category,
          themes: formData.themes,
          service_id: formData.service_id,
          location_name: formData.location_name,
          story_date: formData.story_date,
          access_level: formData.access_level || 'community',
          published: false, // Will be reviewed before publishing
          created_by: user.id
        })
        .select()
        .single()

      if (storyError) throw storyError

      // Upload media files if any
      if (formData.media && formData.media.length > 0) {
        for (const file of formData.media) {
          // Upload to storage
          const fileExt = file.name.split('.').pop()
          const fileName = `${story.id}/${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('story-images')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('story-images')
            .getPublicUrl(fileName)

          // Create media file record
          await supabase.from('media_files').insert({
            organization_id: formData.organization_id,
            file_name: file.name,
            file_path: fileName,
            file_type: 'image',
            mime_type: file.type,
            file_size: file.size,
            story_id: story.id,
            uploaded_by: user.id,
            access_level: formData.access_level || 'community'
          })
        }
      }

      // Success!
      router.push(`/stories/${story.id}?submitted=true`)
    } catch (err: any) {
      console.error('Error submitting story:', err)
      setError(err.message || 'Failed to submit story')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
        <p className="text-gray-600 mb-8">
          Your story matters. Share your experiences, knowledge, and memories with the community.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <StorySubmissionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
```

Create `web-platform/components/StorySubmissionForm.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface StorySubmissionFormProps {
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

export function StorySubmissionForm({ onSubmit, isSubmitting }: StorySubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: [] as string[],
    themes: [] as string[],
    service_id: '',
    location_name: '',
    story_date: '',
    access_level: 'community',
    media: [] as File[]
  })

  const [services, setServices] = useState<any[]>([])
  const [mediaPreview, setMediaPreview] = useState<string[]>([])

  useEffect(() => {
    // Fetch services for dropdown
    const fetchServices = async () => {
      const { data } = await supabase
        .from('organization_services')
        .select('id, name, slug')
        .order('name')
      if (data) setServices(data)
    }
    fetchServices()
  }, [])

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData({ ...formData, media: files })

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setMediaPreview(previews)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const categories = ['health', 'culture', 'youth', 'family', 'education', 'community', 'events']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Story Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Give your story a title"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Summary (1-2 sentences)
        </label>
        <input
          type="text"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Brief summary of your story"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Story *
        </label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={12}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Tell your story..."
        />
        <p className="text-sm text-gray-500 mt-1">
          Share as much or as little as you're comfortable with.
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Category *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.category.includes(cat)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, category: [...formData.category, cat] })
                  } else {
                    setFormData({
                      ...formData,
                      category: formData.category.filter(c => c !== cat)
                    })
                  }
                }}
                className="rounded"
              />
              <span className="text-sm capitalize">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Service */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Related PICC Service (optional)
        </label>
        <select
          value={formData.service_id}
          onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select a service...</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Location (optional)
        </label>
        <input
          type="text"
          value={formData.location_name}
          onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Cultural Centre, Beach Area"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-2">
          When did this happen? (optional)
        </label>
        <input
          type="date"
          value={formData.story_date}
          onChange={(e) => setFormData({ ...formData, story_date: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Add Photos (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleMediaChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        />
        {mediaPreview.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {mediaPreview.map((preview, idx) => (
              <img
                key={idx}
                src={preview}
                alt={`Preview ${idx + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* Access level */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Who can see this story?
        </label>
        <div className="space-y-2">
          <label className="flex items-start gap-2">
            <input
              type="radio"
              value="public"
              checked={formData.access_level === 'public'}
              onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
              className="mt-1"
            />
            <div>
              <p className="font-medium">Everyone (Public)</p>
              <p className="text-sm text-gray-600">Anyone can view this story</p>
            </div>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              value="community"
              checked={formData.access_level === 'community'}
              onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
              className="mt-1"
            />
            <div>
              <p className="font-medium">Community Only</p>
              <p className="text-sm text-gray-600">Only Palm Island community members</p>
            </div>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              value="restricted"
              checked={formData.access_level === 'restricted'}
              onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
              className="mt-1"
            />
            <div>
              <p className="font-medium">Restricted</p>
              <p className="text-sm text-gray-600">Only approved viewers</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Story'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <p className="text-sm text-gray-600">
        * Your story will be reviewed before being published to ensure it meets community guidelines.
      </p>
    </form>
  )
}
```

---

### Week 4: Search & Authentication

#### Day 22-24: Search Implementation

**Task 2.5: Basic Search**

Create `web-platform/components/SearchBar.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/stories?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stories..."
        className="w-full px-4 py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-green-500"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
    </form>
  )
}
```

Create search API endpoint `web-platform/app/api/search/route.ts`:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Build search query
  let dbQuery = supabase
    .from('stories')
    .select(`
      id,
      title,
      summary,
      featured_image_url,
      category,
      story_date,
      storyteller:profiles!storyteller_id(display_name, full_name)
    `)
    .eq('published', true)
    .textSearch('search_vector', query)
    .limit(limit)

  // Apply filters
  if (category) {
    dbQuery = dbQuery.contains('category', [category])
  }

  const { data: stories, error } = await dbQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    query,
    results: stories,
    count: stories?.length || 0
  })
}
```

#### Day 25-28: Authentication

**Task 2.6: Authentication Setup**

Create auth pages:

`web-platform/app/auth/signin/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to Palm Island Story Server</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="w-full py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 font-medium"
          >
            Send Magic Link
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-green-600 hover:text-green-700">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
```

Create auth hook `web-platform/hooks/useAuth.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

---

## Sprint 2 Deliverables Checklist

```
✅ Story list page with filtering
✅ Story detail pages
✅ Story submission form
✅ Photo upload functionality
✅ Basic search implementation
✅ User authentication (sign in/up)
✅ Magic link authentication
✅ Protected routes
✅ User profile integration
✅ Mobile-responsive design
```

---

## Sprint 3: Enhanced Features (Days 29-42)

### Covered in next section...

**Key Features:**
- Advanced search with filters
- Story relationships and recommendations
- Media gallery management
- Admin dashboard
- Mobile optimization enhancements
- Performance optimizations

---

## Sprint 4: Annual Report MVP (Days 43-56)

### Week 7-8: Report System

**Task 4.1: Data Aggregation Service**

Create `web-platform/lib/annual-report/data-aggregator.ts`:

```typescript
import { supabaseAdmin } from '@/lib/supabase'

export interface AnnualReportData {
  period: {
    startDate: string
    endDate: string
    year: number
  }
  stories: {
    total: number
    byCategory: Record<string, number>
    byService: Record<string, number>
    featured: any[]
  }
  services: {
    name: string
    storyCount: number
    impactMetrics?: any
  }[]
  impact: {
    totalPeopleReached: number
    storiesCollected: number
    communityEngagement: number
  }
  metadata: {
    generatedAt: string
    generatedBy: string
  }
}

export async function aggregateAnnualReportData(
  year: number,
  organizationSlug: string = 'picc'
): Promise<AnnualReportData> {
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  // Get organization
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('slug', organizationSlug)
    .single()

  if (!org) throw new Error('Organization not found')

  // Aggregate stories
  const { data: stories } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('organization_id', org.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('published', true)

  // Aggregate by category
  const byCategory: Record<string, number> = {}
  stories?.forEach((story) => {
    story.category?.forEach((cat: string) => {
      byCategory[cat] = (byCategory[cat] || 0) + 1
    })
  })

  // Aggregate by service
  const { data: serviceData } = await supabaseAdmin
    .from('stories')
    .select(`
      service_id,
      organization_services(name)
    `)
    .eq('organization_id', org.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .not('service_id', 'is', null)

  const byService: Record<string, number> = {}
  serviceData?.forEach((item: any) => {
    const serviceName = item.organization_services?.name
    if (serviceName) {
      byService[serviceName] = (byService[serviceName] || 0) + 1
    }
  })

  // Get featured stories
  const { data: featured } = await supabaseAdmin
    .from('stories')
    .select(`
      id,
      title,
      summary,
      featured_image_url,
      category,
      storyteller:profiles!storyteller_id(display_name, full_name)
    `)
    .eq('organization_id', org.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('featured', true)
    .limit(10)

  // Get service summaries
  const { data: services } = await supabaseAdmin
    .from('organization_services')
    .select('id, name')
    .eq('organization_id', org.id)

  const serviceSummaries = await Promise.all(
    (services || []).map(async (service) => {
      const { count } = await supabaseAdmin
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', service.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      return {
        name: service.name,
        storyCount: count || 0
      }
    })
  )

  return {
    period: {
      startDate,
      endDate,
      year
    },
    stories: {
      total: stories?.length || 0,
      byCategory,
      byService,
      featured: featured || []
    },
    services: serviceSummaries,
    impact: {
      totalPeopleReached: 0, // TODO: Calculate from service data
      storiesCollected: stories?.length || 0,
      communityEngagement: 0 // TODO: Calculate from views
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'system'
    }
  }
}
```

**Task 4.2: Report Generator**

Create `web-platform/lib/annual-report/report-generator.ts`:

```typescript
import { AnnualReportData } from './data-aggregator'

export async function generateReportHTML(
  data: AnnualReportData,
  template: 'government' | 'community' | 'funder' = 'government'
): Promise<string> {
  // Use different templates based on audience
  switch (template) {
    case 'government':
      return generateGovernmentReport(data)
    case 'community':
      return generateCommunityReport(data)
    case 'funder':
      return generateFunderReport(data)
    default:
      return generateGovernmentReport(data)
  }
}

function generateGovernmentReport(data: AnnualReportData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>PICC Annual Report ${data.period.year}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 { color: #2C5F2D; border-bottom: 3px solid #2C5F2D; padding-bottom: 10px; }
        h2 { color: #2C5F2D; margin-top: 30px; }
        .metric { background: #f0f9f0; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .metric-value { font-size: 36px; font-weight: bold; color: #2C5F2D; }
        .metric-label { font-size: 14px; color: #666; }
        .story-card { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #2C5F2D; color: white; }
      </style>
    </head>
    <body>
      <h1>Palm Island Community Corporation</h1>
      <h2>Annual Report ${data.period.year}</h2>

      <div class="metric">
        <div class="metric-value">${data.stories.total}</div>
        <div class="metric-label">Community Stories Collected</div>
      </div>

      <h2>Executive Summary</h2>
      <p>
        During ${data.period.year}, Palm Island Community Corporation collected
        ${data.stories.total} stories from our community, representing the voices,
        experiences, and knowledge of our people.
      </p>

      <h2>Service Delivery</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Stories Collected</th>
          </tr>
        </thead>
        <tbody>
          ${data.services
            .map(
              (service) => `
            <tr>
              <td>${service.name}</td>
              <td>${service.storyCount}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>Featured Stories</h2>
      ${data.stories.featured
        .slice(0, 5)
        .map(
          (story) => `
        <div class="story-card">
          <h3>${story.title}</h3>
          <p>${story.summary || ''}</p>
          <p><small>— ${story.storyteller?.display_name || story.storyteller?.full_name}</small></p>
        </div>
      `
        )
        .join('')}

      <hr style="margin: 40px 0;">
      <p style="text-align: center; color: #666; font-size: 12px;">
        Generated on ${new Date(data.metadata.generatedAt).toLocaleDateString()}
      </p>
    </body>
    </html>
  `
}

function generateCommunityReport(data: AnnualReportData): string {
  // Simplified, visual community version
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Our Year Together ${data.period.year}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          font-size: 48px;
          color: #2C5F2D;
          text-align: center;
          margin-bottom: 10px;
        }
        .subtitle {
          text-align: center;
          font-size: 24px;
          color: #666;
          margin-bottom: 40px;
        }
        .big-number {
          text-align: center;
          font-size: 72px;
          font-weight: bold;
          color: #2C5F2D;
          margin: 30px 0 10px 0;
        }
        .big-label {
          text-align: center;
          font-size: 20px;
          color: #666;
          margin-bottom: 40px;
        }
        .story-highlight {
          background: linear-gradient(135deg, #2C5F2D 0%, #4A8F4D 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin: 30px 0;
        }
        .story-highlight h2 {
          margin-top: 0;
        }
      </style>
    </head>
    <body>
      <h1>Our Year Together</h1>
      <div class="subtitle">Palm Island Community ${data.period.year}</div>

      <div class="big-number">${data.stories.total}</div>
      <div class="big-label">Stories Shared</div>

      <p style="font-size: 18px; text-align: center; max-width: 600px; margin: 40px auto;">
        Every story matters. Every voice counts. This year, our community came together
        to share ${data.stories.total} stories—memories, wisdom, experiences, and hope
        for the future.
      </p>

      ${data.stories.featured
        .slice(0, 3)
        .map(
          (story) => `
        <div class="story-highlight">
          <h2>${story.title}</h2>
          <p style="font-size: 18px;">${story.summary || ''}</p>
          <p><em>— ${story.storyteller?.display_name || story.storyteller?.full_name}</em></p>
        </div>
      `
        )
        .join('')}

      <p style="text-align: center; margin-top: 60px; font-size: 18px;">
        <strong>Thank you</strong> to everyone who shared their story this year.
      </p>
    </body>
    </html>
  `
}

function generateFunderReport(data: AnnualReportData): string {
  // Impact-focused funder version
  return generateGovernmentReport(data) // Similar to government for now
}
```

**Task 4.3: Report API Endpoint**

Create `web-platform/app/api/reports/annual/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { aggregateAnnualReportData } from '@/lib/annual-report/data-aggregator'
import { generateReportHTML } from '@/lib/annual-report/report-generator'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const template = searchParams.get('template') as 'government' | 'community' | 'funder' || 'government'
  const format = searchParams.get('format') || 'html'

  try {
    // Aggregate data
    const data = await aggregateAnnualReportData(year)

    if (format === 'json') {
      return NextResponse.json(data)
    }

    // Generate HTML
    const html = await generateReportHTML(data, template)

    if (format === 'pdf') {
      // TODO: Convert HTML to PDF using Puppeteer
      // For now, return HTML
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html'
        }
      })
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

**Task 4.4: Report Viewer Page**

Create `web-platform/app/reports/annual/[year]/page.tsx`:

```typescript
import { aggregateAnnualReportData } from '@/lib/annual-report/data-aggregator'
import { generateReportHTML } from '@/lib/annual-report/report-generator'

export default async function AnnualReportPage({
  params,
  searchParams
}: {
  params: { year: string }
  searchParams: { template?: string }
}) {
  const year = parseInt(params.year)
  const template = (searchParams.template as any) || 'government'

  const data = await aggregateAnnualReportData(year)
  const html = await generateReportHTML(data, template)

  return (
    <div>
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Annual Report {year}</h1>
          <p className="text-sm text-gray-600">
            Template: {template} | Generated: {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/reports/annual?year=${year}&template=${template}&format=pdf`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download PDF
          </a>
          <a
            href={`/api/reports/annual?year=${year}&format=json`}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Export Data
          </a>
        </div>
      </div>

      <div
        className="p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
```

---

## Sprint 4 Deliverables Checklist

```
✅ Data aggregation system
✅ Report templates (government, community, funder)
✅ Automated report generation
✅ Report viewer page
✅ PDF export capability (basic)
✅ JSON data export
✅ Service metrics calculation
✅ Story selection for reports
✅ Year-based filtering
✅ Template switching
```

---

## Testing the Annual Report

```bash
# 1. Generate 2024 report (government template)
open http://localhost:3000/reports/annual/2024

# 2. Generate community-friendly version
open http://localhost:3000/reports/annual/2024?template=community

# 3. Export data as JSON
curl http://localhost:3000/api/reports/annual?year=2024&format=json

# 4. Test PDF download (will need Puppeteer setup)
open http://localhost:3000/api/reports/annual?year=2024&format=pdf
```

---

**Document Status:** Part 2 Complete
**Next:** PRODUCTION-DEVELOPMENT-PLAN-PART3.md (Sprint 5-6: On-Country Infrastructure & Launch)
