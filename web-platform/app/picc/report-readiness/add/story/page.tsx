'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function AddStoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <AddStoryContent />
    </Suspense>
  )
}

function AddStoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const fy = searchParams.get('fy') || '2025-26'
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('service-story')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveStory = async () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('stories')
        .insert({
          title,
          summary: summary || content.slice(0, 200),
          content: content || summary,
          category,
          status: 'draft',
          created_by: user?.id,
          tags: [`fy:${fy}`, 'annual-report', 'service-story'],
          metadata: {
            source: 'report-readiness-add',
            fiscal_year: fy
          },
          tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532'
        })
      
      if (error) throw error
      
      setSaved(true)
      setTimeout(() => {
        router.push('/picc/report-readiness')
      }, 1500)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save story. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/report-readiness"
          className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Report Readiness
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-picc-red" />
          <h1 className="text-3xl font-bold text-gray-900">Add Service Story</h1>
        </div>
        <p className="text-gray-600">
          Share a story about your services or community work for <strong>FY {fy}</strong>. Stories help bring your annual report to life!
        </p>
        
        {/* What makes a good story */}
        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>💡 What makes a great story:</strong> 
            Who was helped? What happened? How did it change their life? 
            Real stories from real people make the report meaningful.
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">✅ Story saved! Taking you back...</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Story Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's this story about? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="e.g., Deadly Choices Program Helps Local Family"
              />
              <p className="text-xs text-gray-500 mt-1">Give your story a catchy title</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What type of story is this?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
              >
                <option value="service-story">🏥 A service we provided</option>
                <option value="community-event">🎉 A community event</option>
                <option value="elder-story">👴 Story from an Elder</option>
                <option value="youth-story">👦 Story from a young person</option>
                <option value="health-program">💪 Health program success</option>
                <option value="education">📚 Education & training</option>
                <option value="cultural">文化 Cultural celebration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short summary <span className="text-gray-400">(what shows in the report)</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="A 1-2 sentence summary that will appear in the report..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full story <span className="text-gray-400">(the details)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="Tell the full story here - who, what, when, where, and the outcome..."
                rows={8}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/picc/report-readiness"
            className="px-6 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
          <button
            onClick={saveStory}
            disabled={saving || !title.trim()}
            className="px-6 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Create Story (Draft)'}
          </button>
        </div>
      </div>
    </div>
  )
}
