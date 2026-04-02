'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Sparkles, Send, User } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type EngagementType = 'question' | 'response' | 'reflection'
type AgeGroup = 'under-12' | '12-17' | '18-25' | '26-35'

interface YouthEngagementEntry {
  id: string
  engagement_type: EngagementType
  content: string
  author_name: string | null
  author_age_group: AgeGroup | null
  elder_responded: boolean
  elder_response: string | null
  created_at: string
}

interface YouthEngagementProps {
  elderId?: string
  storyId?: string
}

const engagementLabels: Record<EngagementType, { label: string; icon: typeof Heart }> = {
  question: { label: 'Ask a Question', icon: MessageCircle },
  response: { label: 'Share a Response', icon: Heart },
  reflection: { label: 'Write a Reflection', icon: Sparkles },
}

const ageGroupLabels: Record<AgeGroup, string> = {
  'under-12': 'Under 12',
  '12-17': '12 - 17',
  '18-25': '18 - 25',
  '26-35': '26 - 35',
}

export default function YouthEngagement({ elderId, storyId }: YouthEngagementProps) {
  const { success, error: showError } = useToast()
  const [entries, setEntries] = useState<YouthEngagementEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')
  const [engagementType, setEngagementType] = useState<EngagementType>('question')
  const [content, setContent] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [elderId, storyId])

  async function fetchEntries() {
    try {
      const params = new URLSearchParams()
      if (elderId) params.set('elder_id', elderId)
      if (storyId) params.set('story_id', storyId)
      const res = await fetch(`/api/elders/youth-engagement?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.engagements ?? [])
      }
    } catch {
      // silently fail on fetch
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/elders/youth-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elder_id: elderId || null,
          story_id: storyId || null,
          engagement_type: engagementType,
          content: content.trim(),
          author_name: name.trim() || null,
          author_age_group: ageGroup || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      success(
        'Thank you!',
        'Your message will be reviewed by the Elders.'
      )
      setContent('')
      setName('')
      setAgeGroup('')
    } catch (err: any) {
      showError('Something went wrong', err.message || 'Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16 mb-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">
          Connect with our Elders
        </h2>
        <p className="text-stone-600 max-w-xl mx-auto">
          Share your thoughts, ask questions, or reflect on the wisdom of our Elders.
          Your voice matters to the community.
        </p>
      </div>

      {/* Submission Form */}
      <div className="max-w-2xl mx-auto mb-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5"
        >
          {/* Engagement type selector */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              What would you like to share?
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(engagementLabels) as EngagementType[]).map((type) => {
                const { label, icon: Icon } = engagementLabels[type]
                const active = engagementType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEngagementType(type)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? 'bg-picc-ochre text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name + Age Group row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ye-name" className="block text-sm font-semibold text-stone-700 mb-1">
                Your Name <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                id="ye-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name or nickname"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-picc-ochre/40 focus:border-picc-ochre"
              />
            </div>
            <div>
              <label htmlFor="ye-age" className="block text-sm font-semibold text-stone-700 mb-1">
                Age Group
              </label>
              <select
                id="ye-age"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-picc-ochre/40 focus:border-picc-ochre"
              >
                <option value="">Select age group</option>
                {(Object.keys(ageGroupLabels) as AgeGroup[]).map((ag) => (
                  <option key={ag} value={ag}>
                    {ageGroupLabels[ag]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="ye-content" className="block text-sm font-semibold text-stone-700 mb-1">
              Your Message
            </label>
            <textarea
              id="ye-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder={
                engagementType === 'question'
                  ? 'What would you like to ask our Elders?'
                  : engagementType === 'reflection'
                    ? 'Share what you have been thinking about...'
                    : 'Share your response to an Elder\'s story...'
              }
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-picc-ochre/40 focus:border-picc-ochre resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full flex items-center justify-center gap-2 bg-picc-ochre hover:bg-picc-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Approved engagements */}
      {!loading && entries.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-stone-700 mb-4">Community Voices</h3>
          <div className="space-y-4">
            {entries.map((entry) => {
              const { icon: Icon } = engagementLabels[entry.engagement_type] ?? engagementLabels.reflection
              return (
                <div
                  key={entry.id}
                  className="bg-warm-50 border border-stone-200 rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-picc-ochre/10 p-2">
                      <Icon className="w-4 h-4 text-picc-ochre" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-stone-700">
                          {entry.author_name || 'Community Member'}
                        </span>
                        {entry.author_age_group && (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                            {ageGroupLabels[entry.author_age_group] ?? entry.author_age_group}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-700 whitespace-pre-line">{entry.content}</p>

                      {entry.elder_responded && entry.elder_response && (
                        <div className="mt-3 bg-white border border-picc-ochre/20 rounded-xl p-4">
                          <p className="text-xs font-semibold text-picc-ochre mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Elder Response
                          </p>
                          <p className="text-stone-700 text-sm whitespace-pre-line">
                            {entry.elder_response}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <p className="text-center text-stone-400 text-sm">
          Be the first to connect with our Elders.
        </p>
      )}
    </section>
  )
}
