'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lightbulb, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function AddInnovationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <AddInnovationContent />
    </Suspense>
  )
}

function AddInnovationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const fy = searchParams.get('fy') || '2025-26'
  const fyInt = parseInt(fy.split('-')[0]) + 1

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [impact, setImpact] = useState('')
  const [status, setStatus] = useState('completed')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveInnovation = async () => {
    if (!title.trim()) {
      alert('Please enter a project title')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('innovation_projects')
        .insert({
          title,
          description: description || null,
          impact: impact || null,
          status,
          fiscal_year: fyInt,
          created_by: user?.id,
          metadata: { source: 'report-readiness-add' },
          tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532'
        })
      
      if (error) throw error
      
      setSaved(true)
      setTimeout(() => {
        router.push('/picc/report-readiness')
      }, 1500)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save innovation project. Please try again.')
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
          <Lightbulb className="w-8 h-8 text-picc-red" />
          <h1 className="text-3xl font-bold text-gray-900">Add Innovation Project</h1>
        </div>
        <p className="text-gray-600">
          Document any new programs, technology, or ways of working that you've tried in <strong>FY {fy}</strong>. Show funders and community what makes PICC innovative!
        </p>

        {/* Tips */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 What counts as innovation?</strong> 
            New computer systems, new programs for community, better ways to deliver services, partnerships with other organisations - anything new and exciting!
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">✅ Innovation project saved!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's the project called? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="e.g., New Computer System for Appointments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How far along is it?
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
              >
                <option value="completed">✅ Finished - it's done!</option>
                <option value="in_progress">🔄 In Progress - still working on it</option>
                <option value="planning">📝 Planning - just thinking about it</option>
                <option value="pilot">🧪 Pilot - testing it out first</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What is it? <span className="text-gray-400">(describe what you did)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="e.g., We started using a new computer system to book appointments..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What difference did it make? <span className="text-gray-400">(the results)</span>
              </label>
              <textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="e.g., Now bookings are faster and community members can book their own appointments..."
                rows={3}
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
            onClick={saveInnovation}
            disabled={saving || !title.trim()}
            className="px-6 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Innovation Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
