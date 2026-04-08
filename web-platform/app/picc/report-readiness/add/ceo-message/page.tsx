'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageSquare, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function AddCEOMessagePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <AddCEOMessageContent />
    </Suspense>
  )
}

function AddCEOMessageContent() {
  const router = useRouter()
  const supabase = createClient()
  
  const [title, setTitle] = useState('CEO Message')
  const [content, setContent] = useState('')
  const [messageType, setMessageType] = useState<'ceo' | 'chair'>('ceo')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveMessage = async () => {
    if (!content.trim()) {
      alert('Please enter a message')
      return
    }

    setSaving(true)
    try {
      // First check if there's an existing report
      const { data: existingReport } = await supabase
        .from('annual_reports')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingReport) {
        // Update existing report
        const updateData = messageType === 'ceo' 
          ? { leadership_message: content }
          : { acknowledgments: content }
        
        const { error } = await supabase
          .from('annual_reports')
          .update(updateData)
          .eq('id', existingReport.id)
        
        if (error) throw error
      } else {
        // Create new report
        const insertData = messageType === 'ceo'
          ? { leadership_message: content, title }
          : { acknowledgments: content, title }
        
        const { error } = await supabase
          .from('annual_reports')
          .insert(insertData)
        
        if (error) throw error
      }
      
      setSaved(true)
      setTimeout(() => {
        router.push('/picc/report-readiness')
      }, 1500)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save message. Please try again.')
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
          <MessageSquare className="w-8 h-8 text-picc-red" />
          <h1 className="text-3xl font-bold text-gray-900">
            Add Leadership Message
          </h1>
        </div>
        <p className="text-gray-600">
          Write your leadership message to community members, stakeholders, and funders. This is the heart of your annual report!
        </p>

        {/* Tips */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 What to include:</strong> 
            Thank the community, highlight key achievements, acknowledge partners, share your vision for the future.
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">✅ Message saved to your annual report!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who is writing this message?
              </label>
              <select
                value={messageType}
                onChange={(e) => {
                  setMessageType(e.target.value as 'ceo' | 'chair')
                  setTitle(e.target.value === 'ceo' ? 'CEO Message' : 'Chair Message')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
              >
                <option value="ceo">👩‍💼 CEO / Executive Leader</option>
                <option value="chair">🪑 Chair / Board President (Acknowledgements)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading <span className="text-gray-400">(what shows above the message)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="e.g., CEO Message 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your message <span className="text-gray-400">(the letter to our community)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="Dear Community Members,

Thank you for another year of working together...

[Write your message here]"
                rows={12}
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
            onClick={saveMessage}
            disabled={saving || !content.trim()}
            className="px-6 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save to Annual Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
