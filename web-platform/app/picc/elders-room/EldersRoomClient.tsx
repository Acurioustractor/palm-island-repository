'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  MessageSquare,
  Settings,
  CheckCircle,
  XCircle,
  Save,
  User,
  Star,
  EyeOff,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Tab = 'content' | 'youth' | 'settings'

interface Elder {
  id: string
  full_name: string
  preferred_name: string | null
  profile_image_url: string | null
}

interface YouthEngagement {
  id: string
  engagement_type: string
  content: string
  author_name: string | null
  author_age_group: string | null
  status: string
  elder_id: string | null
  story_id: string | null
  created_at: string
}

interface RoomSettings {
  id?: string
  elder_id: string
  display_name_override: string | null
  welcome_message: string | null
  featured_quote_ids: string[]
  featured_story_ids: string[]
  hidden_content_ids: string[]
  sharing_preferences: { allow_external: boolean; allow_youth_engagement: boolean }
  theme_preference: string
}

interface QuoteItem {
  id: string
  quote_text: string
  theme: string | null
}

interface StoryItem {
  id: string
  title: string
  excerpt: string | null
}

interface EldersRoomClientProps {
  elders: Elder[]
  initialPendingEngagements: YouthEngagement[]
}

const defaultSettings: Omit<RoomSettings, 'elder_id'> = {
  display_name_override: null,
  welcome_message: null,
  featured_quote_ids: [],
  featured_story_ids: [],
  hidden_content_ids: [],
  sharing_preferences: { allow_external: false, allow_youth_engagement: true },
  theme_preference: 'default',
}

const tabConfig: { key: Tab; label: string; icon: typeof BookOpen }[] = [
  { key: 'content', label: 'My Content', icon: BookOpen },
  { key: 'youth', label: 'Youth Messages', icon: MessageSquare },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export default function EldersRoomClient({
  elders,
  initialPendingEngagements,
}: EldersRoomClientProps) {
  const { success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [selectedElderId, setSelectedElderId] = useState(elders[0]?.id ?? '')
  const [settings, setSettings] = useState<RoomSettings>({
    elder_id: selectedElderId,
    ...defaultSettings,
  })
  const [pendingEngagements, setPendingEngagements] = useState(initialPendingEngagements)
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [stories, setStories] = useState<StoryItem[]>([])
  const [saving, setSaving] = useState(false)

  // Load settings + content when elder changes
  useEffect(() => {
    if (!selectedElderId) return
    loadSettings()
    loadContent()
  }, [selectedElderId])

  async function loadSettings() {
    try {
      const res = await fetch(`/api/elders/room-settings?elder_id=${selectedElderId}`)
      if (res.ok) {
        const { settings: s } = await res.json()
        if (s) {
          setSettings(s)
        } else {
          setSettings({ elder_id: selectedElderId, ...defaultSettings })
        }
      }
    } catch {
      // use defaults
    }
  }

  async function loadContent() {
    // We use the server supabase client indirectly via a simple fetch
    // For now, load quotes and stories for this elder from the public API patterns
    try {
      const [quotesRes, storiesRes] = await Promise.all([
        fetch(`/api/elders/youth-engagement?elder_id=${selectedElderId}`).then(() => null),
        Promise.resolve(null),
      ])
      // Quotes and stories will be loaded via supabase client-side
      // For simplicity, we use the createClient from supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: q } = await supabase
        .from('extracted_quotes')
        .select('id, quote_text, theme')
        .eq('profile_id', selectedElderId)
        .eq('is_validated', true)
        .order('created_at', { ascending: false })
        .limit(50)
      setQuotes(q ?? [])

      const { data: s } = await supabase
        .from('stories')
        .select('id, title, excerpt')
        .eq('storyteller_id', selectedElderId)
        .order('created_at', { ascending: false })
        .limit(50)
      setStories(s ?? [])
    } catch {
      // silently handle
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/elders/room-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Save failed')
      success('Settings saved', 'Your preferences have been updated.')
    } catch {
      showError('Could not save', 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEngagementAction(id: string, action: 'approved' | 'rejected') {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const updates: Record<string, unknown> = {
        status: action,
        updated_at: new Date().toISOString(),
      }
      if (action === 'approved') {
        updates.is_public = true
      }
      const { error } = await supabase
        .from('youth_engagement')
        .update(updates)
        .eq('id', id)
      if (error) throw error
      setPendingEngagements((prev) => prev.filter((e) => e.id !== id))
      success(action === 'approved' ? 'Approved' : 'Rejected', 'The message has been updated.')
    } catch {
      showError('Action failed', 'Please try again.')
    }
  }

  function toggleFeaturedQuote(quoteId: string) {
    setSettings((prev) => {
      const ids = prev.featured_quote_ids.includes(quoteId)
        ? prev.featured_quote_ids.filter((id) => id !== quoteId)
        : [...prev.featured_quote_ids, quoteId]
      return { ...prev, featured_quote_ids: ids }
    })
  }

  function toggleFeaturedStory(storyId: string) {
    setSettings((prev) => {
      const ids = prev.featured_story_ids.includes(storyId)
        ? prev.featured_story_ids.filter((id) => id !== storyId)
        : [...prev.featured_story_ids, storyId]
      return { ...prev, featured_story_ids: ids }
    })
  }

  function toggleHidden(contentId: string) {
    setSettings((prev) => {
      const ids = prev.hidden_content_ids.includes(contentId)
        ? prev.hidden_content_ids.filter((id) => id !== contentId)
        : [...prev.hidden_content_ids, contentId]
      return { ...prev, hidden_content_ids: ids }
    })
  }

  const elderEngagements = pendingEngagements.filter(
    (e) => !e.elder_id || e.elder_id === selectedElderId
  )

  return (
    <div>
      {/* Elder selector */}
      {elders.length > 1 && (
        <div className="mb-6">
          <label htmlFor="elder-select" className="block text-sm font-semibold text-stone-700 mb-1">
            Managing as
          </label>
          <select
            id="elder-select"
            value={selectedElderId}
            onChange={(e) => setSelectedElderId(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-picc-ochre/40"
          >
            {elders.map((el) => (
              <option key={el.id} value={el.id}>
                {el.preferred_name || el.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200 mb-8">
        {tabConfig.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2
              ${activeTab === key
                ? 'border-picc-ochre text-picc-ochre'
                : 'border-transparent text-stone-500 hover:text-stone-700'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
            {key === 'youth' && elderEngagements.length > 0 && (
              <span className="ml-1 bg-picc-ochre text-white text-xs rounded-full px-2 py-0.5">
                {elderEngagements.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Quotes */}
          <div>
            <h3 className="text-lg font-bold text-stone-800 mb-3">Quotes</h3>
            {quotes.length === 0 ? (
              <p className="text-stone-400 text-sm">No validated quotes found.</p>
            ) : (
              <div className="space-y-2">
                {quotes.map((q) => {
                  const featured = settings.featured_quote_ids.includes(q.id)
                  const hidden = settings.hidden_content_ids.includes(q.id)
                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${
                        hidden ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-700 text-sm line-clamp-2">
                          &ldquo;{q.quote_text}&rdquo;
                        </p>
                        {q.theme && (
                          <span className="text-xs text-stone-400 mt-1 inline-block">{q.theme}</span>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => toggleFeaturedQuote(q.id)}
                          title={featured ? 'Remove from featured' : 'Feature this quote'}
                          className={`p-2 rounded-xl transition-colors ${
                            featured ? 'bg-picc-ochre/10 text-picc-ochre' : 'text-stone-400 hover:text-picc-ochre'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={featured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => toggleHidden(q.id)}
                          title={hidden ? 'Show this quote' : 'Hide this quote'}
                          className={`p-2 rounded-xl transition-colors ${
                            hidden ? 'bg-stone-200 text-stone-600' : 'text-stone-400 hover:text-stone-600'
                          }`}
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stories */}
          <div>
            <h3 className="text-lg font-bold text-stone-800 mb-3">Stories</h3>
            {stories.length === 0 ? (
              <p className="text-stone-400 text-sm">No stories found.</p>
            ) : (
              <div className="space-y-2">
                {stories.map((s) => {
                  const featured = settings.featured_story_ids.includes(s.id)
                  const hidden = settings.hidden_content_ids.includes(s.id)
                  return (
                    <div
                      key={s.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${
                        hidden ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-800 font-semibold text-sm">{s.title}</p>
                        {s.excerpt && (
                          <p className="text-stone-500 text-sm line-clamp-2 mt-0.5">{s.excerpt}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => toggleFeaturedStory(s.id)}
                          title={featured ? 'Remove from featured' : 'Feature this story'}
                          className={`p-2 rounded-xl transition-colors ${
                            featured ? 'bg-picc-ochre/10 text-picc-ochre' : 'text-stone-400 hover:text-picc-ochre'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={featured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => toggleHidden(s.id)}
                          title={hidden ? 'Show this story' : 'Hide this story'}
                          className={`p-2 rounded-xl transition-colors ${
                            hidden ? 'bg-stone-200 text-stone-600' : 'text-stone-400 hover:text-stone-600'
                          }`}
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-picc-ochre hover:bg-picc-ochre/90 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Content Preferences'}
          </button>
        </div>
      )}

      {/* Youth Messages Tab */}
      {activeTab === 'youth' && (
        <div>
          {elderEngagements.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No pending messages to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {elderEngagements.map((eng) => (
                <div
                  key={eng.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-semibold text-stone-700">
                          {eng.author_name || 'Anonymous'}
                        </span>
                        {eng.author_age_group && (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                            {eng.author_age_group}
                          </span>
                        )}
                        <span className="text-xs text-stone-400">
                          {eng.engagement_type}
                        </span>
                      </div>
                      <p className="text-stone-700 whitespace-pre-line">{eng.content}</p>
                      <p className="text-xs text-stone-400 mt-2">
                        {new Date(eng.created_at).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEngagementAction(eng.id, 'approved')}
                        title="Approve"
                        className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEngagementAction(eng.id, 'rejected')}
                        title="Reject"
                        className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-8 max-w-2xl">
          {/* Welcome Message */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Welcome Message
            </label>
            <p className="text-xs text-stone-400 mb-2">
              This message will appear at the top of your Elder profile page.
            </p>
            <textarea
              value={settings.welcome_message ?? ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, welcome_message: e.target.value || null }))
              }
              rows={4}
              placeholder="Welcome to my space. Here I share the stories and wisdom of our people..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-picc-ochre/40 resize-none"
            />
          </div>

          {/* Display Name Override */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Display Name Override
            </label>
            <p className="text-xs text-stone-400 mb-2">
              Leave blank to use your profile name.
            </p>
            <input
              type="text"
              value={settings.display_name_override ?? ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, display_name_override: e.target.value || null }))
              }
              placeholder="e.g. Aunty Rose"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-picc-ochre/40"
            />
          </div>

          {/* Sharing Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 mb-3">Sharing Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sharing_preferences.allow_youth_engagement}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sharing_preferences: {
                        ...prev.sharing_preferences,
                        allow_youth_engagement: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 rounded border-stone-300 text-picc-ochre focus:ring-picc-ochre/40"
                />
                <span className="text-sm text-stone-700">
                  Allow young people to send me messages and questions
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sharing_preferences.allow_external}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sharing_preferences: {
                        ...prev.sharing_preferences,
                        allow_external: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 rounded border-stone-300 text-picc-ochre focus:ring-picc-ochre/40"
                />
                <span className="text-sm text-stone-700">
                  Allow my content to be shared externally (reports, publications)
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-picc-ochre hover:bg-picc-ochre/90 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
