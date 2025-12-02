'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, X, MessageSquare, Users, Calendar } from 'lucide-react';

export default function NewConversationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    conversation_title: '',
    conversation_type: 'listening_tour',
    session_date: new Date().toISOString().split('T')[0],
    facilitator_name: '',
    location: 'Palm Island',
    participant_count: '',
    session_notes: '',
    key_themes: '',
    raw_transcript: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      const { error } = await (supabase
        .from('community_conversations') as any)
        .insert({
          conversation_title: formData.conversation_title,
          conversation_type: formData.conversation_type,
          session_date: formData.session_date,
          facilitator_name: formData.facilitator_name || null,
          location: formData.location || null,
          participant_count: formData.participant_count ? parseInt(formData.participant_count) : null,
          session_notes: formData.session_notes || null,
          key_themes: formData.key_themes ? formData.key_themes.split(',').map(t => t.trim()) : [],
          raw_transcript: formData.raw_transcript || null,
          status: 'recorded',
          tenant_id: process.env.NEXT_PUBLIC_TENANT_ID,
          organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID
        });

      if (error) throw error;

      alert('Conversation recorded successfully!');
      router.push('/picc/conversations');
    } catch (error: any) {
      console.error('Error saving conversation:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/picc/conversations"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Conversations
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Record Community Conversation</h1>
        </div>
        <p className="text-gray-600">
          Document a community listening session, feedback meeting, or elder circle
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Session Details</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Title *
              </label>
              <input
                type="text"
                required
                value={formData.conversation_title}
                onChange={(e) => setFormData({ ...formData, conversation_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Community Listening Tour - November"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Type *
              </label>
              <select
                required
                value={formData.conversation_type}
                onChange={(e) => setFormData({ ...formData, conversation_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="listening_tour">Listening Tour</option>
                <option value="service_feedback">Service Feedback</option>
                <option value="elder_session">Elder Session</option>
                <option value="youth_voice">Youth Voice</option>
                <option value="community_meeting">Community Meeting</option>
                <option value="focus_group">Focus Group</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Session Date
              </label>
              <input
                type="date"
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Participants
              </label>
              <input
                type="number"
                value={formData.participant_count}
                onChange={(e) => setFormData({ ...formData, participant_count: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Number of participants"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilitator Name
            </label>
            <input
              type="text"
              value={formData.facilitator_name}
              onChange={(e) => setFormData({ ...formData, facilitator_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Themes (comma-separated)
            </label>
            <input
              type="text"
              value={formData.key_themes}
              onChange={(e) => setFormData({ ...formData, key_themes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., housing, youth services, health"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Notes
            </label>
            <textarea
              value={formData.session_notes}
              onChange={(e) => setFormData({ ...formData, session_notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Summary notes from the session..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raw Transcript (Optional)
            </label>
            <textarea
              value={formData.raw_transcript}
              onChange={(e) => setFormData({ ...formData, raw_transcript: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
              placeholder="Paste the full session transcript here..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/picc/conversations"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Conversation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
