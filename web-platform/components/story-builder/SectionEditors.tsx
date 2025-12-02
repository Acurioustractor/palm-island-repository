'use client';

import { MediaUpload } from './MediaUpload';
import { Plus, Trash2, GripVertical } from 'lucide-react';

// Text Section Editor
export function TextSectionEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Section Title (Optional)
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Why This Matters"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Content
        </label>
        <textarea
          value={data.content || ''}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="Write your story content here..."
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Tip: Write 2-4 paragraphs. Keep it concise and impactful.
        </p>
      </div>
    </div>
  );
}

// Quote Section Editor
export function QuoteSectionEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quote
        </label>
        <textarea
          value={data.quote || ''}
          onChange={(e) => onChange({ ...data, quote: e.target.value })}
          placeholder="The exact words from the community member..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Author Name
        </label>
        <input
          type="text"
          value={data.author || ''}
          onChange={(e) => onChange({ ...data, author: e.target.value })}
          placeholder="e.g., Mary Johnson"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Role/Title (Optional)
        </label>
        <input
          type="text"
          value={data.role || ''}
          onChange={(e) => onChange({ ...data, role: e.target.value })}
          placeholder="e.g., Elder & Community Storyteller"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Side by Side Section Editor
export function SideBySideSectionEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Section Title (Optional)
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Community Led Photography"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <MediaUpload
        label="Media (Image or Video)"
        accept="both"
        currentUrl={data.mediaUrl}
        onUpload={(url, type) => onChange({ ...data, mediaUrl: url, mediaType: type })}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Media Position
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => onChange({ ...data, mediaPosition: 'left' })}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
              data.mediaPosition === 'left'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Media Left
          </button>
          <button
            onClick={() => onChange({ ...data, mediaPosition: 'right' })}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
              data.mediaPosition === 'right'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Media Right
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Content
        </label>
        <textarea
          value={data.content || ''}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="Write the text content that goes alongside the media..."
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Video Section Editor
export function VideoSectionEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Video Title (Optional)
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Studio Tour"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <MediaUpload
        label="Video File"
        accept="video"
        currentUrl={data.videoUrl}
        onUpload={(url) => onChange({ ...data, videoUrl: url })}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Caption (Optional)
        </label>
        <textarea
          value={data.caption || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="Brief description of what viewers will see..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Full Bleed Image Editor
export function FullBleedImageEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <MediaUpload
        label="Image"
        accept="image"
        currentUrl={data.imageUrl}
        onUpload={(url) => onChange({ ...data, imageUrl: url })}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Alt Text (for accessibility)
        </label>
        <input
          type="text"
          value={data.alt || ''}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Describe the image"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Caption (Optional)
        </label>
        <input
          type="text"
          value={data.caption || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="Caption appears at bottom of image"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Gallery Section Editor
export function GallerySectionEditor({ data, onChange }: any) {
  const images = data.images || [];

  const addImage = () => {
    onChange({
      ...data,
      images: [...images, { url: '', alt: '', caption: '' }],
    });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ ...data, images: newImages });
  };

  const removeImage = (index: number) => {
    onChange({
      ...data,
      images: images.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Gallery Title (Optional)
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Community Portraits"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Images ({images.length})
          </label>
          <button
            onClick={addImage}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No images yet. Click "Add Image" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {images.map((image: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">
                      Image {index + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <MediaUpload
                    accept="image"
                    currentUrl={image.url}
                    onUpload={(url) => updateImage(index, 'url', url)}
                  />

                  <input
                    type="text"
                    value={image.alt || ''}
                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                    placeholder="Alt text (describe the image)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImage(index, 'caption', e.target.value)}
                    placeholder="Caption (optional)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Timeline Section Editor
export function TimelineSectionEditor({ data, onChange }: any) {
  const events = data.events || [];

  const addEvent = () => {
    onChange({
      ...data,
      events: [...events, { date: '', title: '', description: '', isComplete: true }],
    });
  };

  const updateEvent = (index: number, field: string, value: any) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    onChange({ ...data, events: newEvents });
  };

  const removeEvent = (index: number) => {
    onChange({
      ...data,
      events: events.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Timeline Title (Optional)
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Our Journey"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Events ({events.length})
          </label>
          <button
            onClick={addEvent}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No events yet. Click "Add Event" to start.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">
                      Event {index + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => removeEvent(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={event.date || ''}
                    onChange={(e) => updateEvent(index, 'date', e.target.value)}
                    placeholder="Date (e.g., January 2023)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    value={event.title || ''}
                    onChange={(e) => updateEvent(index, 'title', e.target.value)}
                    placeholder="Event title"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <textarea
                    value={event.description || ''}
                    onChange={(e) => updateEvent(index, 'description', e.target.value)}
                    placeholder="Description (1-2 sentences)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={event.isComplete !== false}
                      onChange={(e) => updateEvent(index, 'isComplete', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Mark as complete</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Parallax Section Editor
export function ParallaxSectionEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <MediaUpload
        label="Background Image"
        accept="image"
        currentUrl={data.imageUrl}
        onUpload={(url) => onChange({ ...data, imageUrl: url })}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Main Text
        </label>
        <input
          type="text"
          value={data.text || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="e.g., Our Land, Our Lens"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Tip: Keep it short and impactful (2-5 words)
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Subtitle (Optional)
        </label>
        <input
          type="text"
          value={data.subtitle || ''}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="Optional smaller text below"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
