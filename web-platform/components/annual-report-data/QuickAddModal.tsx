'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';

export type QuickAddType = 'highlight' | 'service_data' | 'photo' | 'board_member';

interface QuickAddModalProps {
  type: QuickAddType;
  reportId: string | null;
  fiscalYear: number;
  onClose: () => void;
  onSaved: (type: QuickAddType) => void;
}

const TITLES: Record<QuickAddType, string> = {
  highlight: 'Add Highlight',
  service_data: 'Add Service Data',
  photo: 'Upload Photo',
  board_member: 'Add Board Member',
};

export default function QuickAddModal({
  type,
  reportId,
  fiscalYear,
  onClose,
  onSaved,
}: QuickAddModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const firstInput = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    firstInput.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      let res: Response;

      switch (type) {
        case 'highlight': {
          res = await fetch('/api/annual-report-data/highlights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'highlight',
              report_id: reportId,
              title: formData.get('title'),
              description: formData.get('description'),
              highlight_type: formData.get('highlight_type') || 'achievement',
              is_featured: false,
              display_order: 0,
            }),
          });
          break;
        }
        case 'board_member': {
          res = await fetch('/api/annual-report-data/board', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: formData.get('full_name'),
              position: formData.get('position'),
              member_type: formData.get('member_type') || 'board',
            }),
          });
          break;
        }
        case 'service_data': {
          res = await fetch('/api/annual-report-data/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              organization_service_id: formData.get('service_id'),
              fiscal_year: fiscalYear,
              total_clients_served: parseInt(formData.get('clients') as string) || 0,
              total_service_hours: parseInt(formData.get('hours') as string) || 0,
            }),
          });
          break;
        }
        case 'photo': {
          res = await fetch('/api/annual-report-data/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.get('title'),
              url: formData.get('url'),
              section: formData.get('section') || 'general',
              fy_tag: `fy:${fiscalYear - 1}-${String(fiscalYear).slice(2)}`,
            }),
          });
          break;
        }
        default:
          throw new Error('Unknown type');
      }

      if (!res!.ok) {
        const data = await res!.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }

      onSaved(type);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      const form = (e.target as HTMLElement).closest('form');
      form?.requestSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{TITLES[type]}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'highlight' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  ref={firstInput as React.RefObject<HTMLInputElement>}
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="e.g., Record client numbers in Health Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="Describe the achievement or highlight..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="highlight_type" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none">
                  <option value="achievement">Achievement</option>
                  <option value="milestone">Milestone</option>
                  <option value="recognition">Recognition</option>
                  <option value="community_impact">Community Impact</option>
                </select>
              </div>
            </>
          )}

          {type === 'board_member' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  ref={firstInput as React.RefObject<HTMLInputElement>}
                  name="full_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  name="position"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="e.g., Director, Chairperson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="member_type" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none">
                  <option value="board">Board Member</option>
                  <option value="leadership">Leadership</option>
                  <option value="elder">Elder Advisory</option>
                </select>
              </div>
            </>
          )}

          {type === 'service_data' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service ID</label>
                <input
                  ref={firstInput as React.RefObject<HTMLInputElement>}
                  name="service_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="Organization service UUID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Clients Served</label>
                <input
                  name="clients"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Service Hours</label>
                <input
                  name="hours"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                />
              </div>
            </>
          )}

          {type === 'photo' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo Title</label>
                <input
                  ref={firstInput as React.RefObject<HTMLInputElement>}
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="Describe the photo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  name="url"
                  type="url"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Section</label>
                <select name="section" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none">
                  <option value="general">General</option>
                  <option value="cover">Cover</option>
                  <option value="services">Services</option>
                  <option value="community">Community</option>
                  <option value="events">Events</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">Cmd+Enter to save</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-picc-ochre rounded-lg hover:bg-picc-ochre-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                ) : null}
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
