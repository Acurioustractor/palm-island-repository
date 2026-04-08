'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageSquareQuote, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function AddQuotePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <AddQuoteContent />
    </Suspense>
  )
}

function AddQuoteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const isElder = searchParams.get('type') === 'elder'
  const [quote, setQuote] = useState('')
  const [attribution, setAttribution] = useState('')
  const [context, setContext] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveQuote = async () => {
    if (!quote.trim()) {
      alert('Please enter a quote')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('extracted_quotes')
        .insert({
          quote_text: quote,
          attribution: attribution || 'Community Member',
          context: context || null,
          is_curated: true,
          source_type: 'report-readiness-add',
          created_by: user?.id,
          metadata: {
            is_elder: isElder,
            is_community_voice: !isElder,
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
      alert('Failed to save quote. Please try again.')
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
          <MessageSquareQuote className="w-8 h-8 text-picc-red" />
          <h1 className="text-3xl font-bold text-gray-900">
            {isElder ? 'Add Elder Quote' : 'Add Community Quote'}
          </h1>
        </div>
        <p className="text-gray-600">
          {isElder 
            ? 'Capture wisdom and messages from our Elders to share in the annual report.'
            : 'Add inspiring words from community members - these bring the report to life!'
          }
        </p>

        {/* Tips */}
        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>💡 Tips for great quotes:</strong> 
            {isElder 
              ? " Ask Elders about their hopes for the community, memories of Palm Island, or wisdom to share."
              : " Ask community members what PICC means to them, or how our services helped."
            }
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">✅ Quote saved!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Quote Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What did they say? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="Type the exact words they said..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who said it? <span className="text-gray-400">(name or description)</span>
              </label>
              <input
                type="text"
                value={attribution}
                onChange={(e) => setAttribution(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder={isElder ? "e.g., Aunty Mary Wappana" : "e.g., Local youth, or a community member"}
              />
              {isElder && (
                <p className="text-xs text-gray-500 mt-1">Using "Elder", "Aunty", or "Uncle" helps us recognise these special voices</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When/where? <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="e.g., At the NAIDOC Week celebration, July 2025"
                rows={2}
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
            onClick={saveQuote}
            disabled={saving || !quote.trim()}
            className="px-6 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Quote'}
          </button>
        </div>
      </div>
    </div>
  )
}
