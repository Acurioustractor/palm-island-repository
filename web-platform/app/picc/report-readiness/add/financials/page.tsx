'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { DollarSign, ArrowLeft, Check, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface FinancialEntry {
  id: string
  category: string
  description: string
  amount: number
}

export default function AddFinancialsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <AddFinancialsContent />
    </Suspense>
  )
}

function AddFinancialsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const fy = searchParams.get('fy') || '2025-26'
  const fyInt = parseInt(fy.split('-')[0]) + 1

  const [category, setCategory] = useState('revenue')
  const [entries, setEntries] = useState<FinancialEntry[]>([
    { id: '1', category: 'revenue', description: '', amount: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addEntry = () => {
    setEntries([...entries, { id: Date.now().toString(), category, description: '', amount: 0 }])
  }

  const updateEntry = (id: string, field: keyof FinancialEntry, value: string | number) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id))
    }
  }

  const saveEntries = async () => {
    setSaving(true)
    try {
      for (const entry of entries) {
        if (entry.amount > 0 && entry.description.trim()) {
          const { error } = await supabase
            .from('annual_financials')
            .insert({
              fiscal_year: fyInt,
              category: entry.category,
              description: entry.description,
              amount: entry.amount,
              metadata: { source: 'report-readiness-add' }
            })
          
          if (error) throw error
        }
      }
      setSaved(true)
      setTimeout(() => {
        router.push('/picc/report-readiness')
      }, 1500)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0)

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
          <DollarSign className="w-8 h-8 text-picc-red" />
          <h1 className="text-3xl font-bold text-gray-900">Add Financial Data</h1>
        </div>
        <p className="text-gray-600">
          Add your revenue, expenses, or grants for <strong>FY {fy}</strong>. This information will appear in your annual report.
        </p>
        
        {/* Quick Help */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Quick tips:</strong> 
            • Revenue = money coming in (fees, sales)
            • Grants = government or org funding
            • Expenses = money going out
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">✅ Financial data saved successfully!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Entries */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Financial Items</h2>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg"
              >
                <option value="revenue">💰 Revenue</option>
                <option value="expense">📤 Expense</option>
                <option value="grant">🏛️ Grant</option>
                <option value="asset">🏠 Asset</option>
                <option value="liability">💳 Liability</option>
              </select>
              <button
                onClick={addEntry}
                className="flex items-center gap-1 text-sm px-3 py-1.5 bg-picc-red text-white rounded-lg hover:bg-picc-red/90"
              >
                <Plus className="w-4 h-4" />
                Add Another
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      What is this? <span className="text-gray-400">(description)</span>
                    </label>
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., Queensland Health Grant"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      How much? <span className="text-gray-400">(in dollars)</span>
                    </label>
                    <input
                      type="number"
                      value={entry.amount || ''}
                      onChange={(e) => updateEntry(entry.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                  title={entries.length === 1 ? "Keep at least one item" : "Remove this item"}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {entries.filter(e => e.amount > 0 && e.description.trim()).length} entries with data
            </div>
            <div className="text-lg font-bold text-gray-900">
              Total: ${totalAmount.toLocaleString()}
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
            onClick={saveEntries}
            disabled={saving}
            className="px-6 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Financial Data'}
          </button>
        </div>
      </div>
    </div>
  )
}
