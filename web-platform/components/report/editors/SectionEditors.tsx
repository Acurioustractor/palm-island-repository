'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, X, Plus } from 'lucide-react'
import { useEditor } from './InlineReportEditor'
import ImagePicker from './ImagePicker'

// ============================================
// TEXT EDITOR - for executive summary, acknowledgments, etc.
// ============================================
export function TextEditor() {
  const { editingData, updateEditingData, openImagePicker } = useEditor()

  if (!editingData) return null

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          value={editingData.title || ''}
          onChange={(e) => updateEditingData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
          placeholder="Section title"
        />
      </div>
      {editingData.subtitle !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            value={editingData.subtitle || ''}
            onChange={(e) => updateEditingData({ subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
            placeholder="Section subtitle"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={editingData.content || ''}
          onChange={(e) => updateEditingData({ content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent min-h-[200px] resize-y"
          placeholder="Enter content..."
        />
      </div>
    </div>
  )
}

// ============================================
// QUOTE EDITOR
// ============================================
export function QuoteEditor() {
  const { editingData, updateEditingData, openImagePicker } = useEditor()
  const [showImagePicker, setShowImagePicker] = useState(false)

  if (!editingData) return null

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
        <textarea
          value={editingData.quote || ''}
          onChange={(e) => updateEditingData({ quote: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent min-h-[100px] resize-y"
          placeholder="The quote text..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            value={editingData.author || ''}
            onChange={(e) => updateEditingData({ author: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
            placeholder="Person's name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            value={editingData.role || ''}
            onChange={(e) => updateEditingData({ role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
            placeholder="Community Elder"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
        <div className="flex items-center gap-3">
          {editingData.image ? (
            <div className="relative">
              <img src={editingData.image} alt="" className="w-20 h-20 object-cover rounded-lg" />
              <button
                onClick={() => updateEditingData({ image: '' })}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowImagePicker(true)}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-picc-ochre-300 hover:bg-warm-100 transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowImagePicker(true)}
            className="text-sm text-picc-ochre hover:text-picc-earth-500"
          >
            {editingData.image ? 'Change' : 'Add'} photo
          </button>
        </div>
      </div>
      <ImagePicker
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(m) => {
          updateEditingData({ image: m.public_url })
          setShowImagePicker(false)
        }}
        title="Select Photo"
      />
    </div>
  )
}

// ============================================
// LEADERSHIP MESSAGE EDITOR
// ============================================
export function LeadershipEditor() {
  const { editingData, updateEditingData } = useEditor()
  const [showImagePicker, setShowImagePicker] = useState(false)

  if (!editingData) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            value={editingData.name || ''}
            onChange={(e) => updateEditingData({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
            placeholder="Rachel Atkinson"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={editingData.role || 'ceo'}
            onChange={(e) => updateEditingData({ role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent bg-white"
          >
            <option value="ceo">Chief Executive Officer</option>
            <option value="chair">Board Chairperson</option>
            <option value="deputy">Deputy CEO</option>
            <option value="director">Director</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
        <div className="flex items-center gap-3">
          {editingData.image ? (
            <div className="relative">
              <img src={editingData.image} alt="" className="w-24 h-24 object-cover rounded-lg" />
              <button
                onClick={() => updateEditingData({ image: '' })}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowImagePicker(true)}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-picc-ochre-300 hover:bg-warm-100 transition-colors"
            >
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowImagePicker(true)}
            className="text-sm text-picc-ochre hover:text-picc-earth-500"
          >
            {editingData.image ? 'Change' : 'Add'} photo
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={editingData.message || ''}
          onChange={(e) => updateEditingData({ message: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent min-h-[200px] resize-y"
          placeholder="Leadership message content..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Signature (optional)</label>
        <input
          value={editingData.signature || ''}
          onChange={(e) => updateEditingData({ signature: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
          placeholder="Rachel"
        />
      </div>

      <ImagePicker
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(m) => {
          updateEditingData({ image: m.public_url })
          setShowImagePicker(false)
        }}
        title="Select Leadership Photo"
      />
    </div>
  )
}

// ============================================
// STATS EDITOR
// ============================================
export function StatsEditor() {
  const { editingData, updateEditingData } = useEditor()

  if (!editingData) return null

  const stats = editingData.stats || editingData.items || []

  const updateStat = (index: number, field: string, value: any) => {
    const newStats = [...stats]
    newStats[index] = { ...newStats[index], [field]: value }
    updateEditingData({ stats: newStats, items: newStats })
  }

  const addStat = () => {
    const newStats = [...stats, { value: 0, label: 'New Stat' }]
    updateEditingData({ stats: newStats, items: newStats })
  }

  const removeStat = (index: number) => {
    const newStats = stats.filter((_: any, i: number) => i !== index)
    updateEditingData({ stats: newStats, items: newStats })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {stats.map((stat: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 grid grid-cols-4 gap-2">
              <input
                value={stat.value || ''}
                onChange={(e) => updateStat(idx, 'value', e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="197"
              />
              <input
                value={stat.label || ''}
                onChange={(e) => updateStat(idx, 'label', e.target.value)}
                className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="Staff Members"
              />
              <input
                value={stat.suffix || ''}
                onChange={(e) => updateStat(idx, 'suffix', e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="%"
              />
            </div>
            <button
              onClick={() => removeStat(idx)}
              className="p-1.5 text-red-500 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addStat}
        className="flex items-center gap-1 text-sm text-picc-ochre hover:text-picc-earth-500"
      >
        <Plus className="w-4 h-4" /> Add stat
      </button>
    </div>
  )
}

// ============================================
// VIDEO EDITOR
// ============================================
export function VideoEditor() {
  const { editingData, updateEditingData } = useEditor()
  const [showImagePicker, setShowImagePicker] = useState(false)

  if (!editingData) return null

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
        <input
          value={editingData.title || ''}
          onChange={(e) => updateEditingData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
          placeholder="Video title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube, Vimeo)</label>
        <input
          value={editingData.url || ''}
          onChange={(e) => updateEditingData({ url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          value={editingData.description || ''}
          onChange={(e) => updateEditingData({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent resize-y"
          rows={2}
          placeholder="Video description..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail (optional)</label>
        <div className="flex items-center gap-3">
          {editingData.thumbnail ? (
            <div className="relative">
              <img src={editingData.thumbnail} alt="" className="w-32 h-20 object-cover rounded-lg" />
              <button
                onClick={() => updateEditingData({ thumbnail: '' })}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowImagePicker(true)}
              className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-picc-ochre-300 hover:bg-warm-100 transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowImagePicker(true)}
            className="text-sm text-picc-ochre hover:text-picc-earth-500"
          >
            {editingData.thumbnail ? 'Change' : 'Add'} thumbnail
          </button>
        </div>
      </div>
      <ImagePicker
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(m) => {
          updateEditingData({ thumbnail: m.public_url })
          setShowImagePicker(false)
        }}
        title="Select Thumbnail"
      />
    </div>
  )
}

// ============================================
// IMAGE SECTION EDITOR (Hero, Gallery item, etc.)
// ============================================
export function ImageSectionEditor() {
  const { editingData, updateEditingData } = useEditor()
  const [showImagePicker, setShowImagePicker] = useState(false)

  if (!editingData) return null

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
        <div
          onClick={() => setShowImagePicker(true)}
          className="cursor-pointer group"
        >
          {editingData.image ? (
            <div className="relative rounded-lg overflow-hidden">
              <img src={editingData.image} alt="" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                  Click to change
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-picc-ochre-300 hover:bg-warm-100 transition-colors">
              <div className="text-center">
                <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-500">Click to select image</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
        <input
          value={editingData.title || ''}
          onChange={(e) => updateEditingData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
          placeholder="Image title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
        <input
          value={editingData.subtitle || ''}
          onChange={(e) => updateEditingData({ subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
          placeholder="Image subtitle"
        />
      </div>

      <ImagePicker
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(m) => {
          updateEditingData({ image: m.public_url })
          setShowImagePicker(false)
        }}
        title="Select Image"
      />
    </div>
  )
}
