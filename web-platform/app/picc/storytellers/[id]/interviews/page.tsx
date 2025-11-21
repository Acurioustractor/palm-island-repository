'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Plus, Calendar, Clock, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Interview {
  id: string;
  interview_title: string;
  interview_date: string;
  interview_duration_minutes: number;
  raw_transcript: string;
  edited_transcript: string;
  interview_notes: string;
  status: string;
  created_at: string;
}

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
}

export default function StorytellerInterviewsPage() {
  const params = useParams();
  const router = useRouter();
  const storytellerId = params.id as string;

  const [storyteller, setStoryteller] = useState<Storyteller | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newInterview, setNewInterview] = useState({
    interview_title: '',
    interview_date: '',
    interview_duration_minutes: 0,
    raw_transcript: '',
    interview_notes: ''
  });

  useEffect(() => {
    loadData();
  }, [storytellerId]);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Load storyteller
      const { data: storytellerData, error: storytellerError } = await supabase
        .from('profiles')
        .select('id, full_name, preferred_name')
        .eq('id', storytellerId)
        .single();

      if (storytellerError) throw storytellerError;
      setStoryteller(storytellerData);

      // Load interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .eq('storyteller_id', storytellerId)
        .order('interview_date', { ascending: false });

      if (interviewsError) throw interviewsError;
      setInterviews(interviewsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('interviews')
        .insert({
          storyteller_id: storytellerId,
          tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
          organization_id: '3c2011b9-f80d-4289-b300-0cd383cff479',
          interview_title: newInterview.interview_title,
          interview_date: newInterview.interview_date,
          interview_duration_minutes: newInterview.interview_duration_minutes,
          raw_transcript: newInterview.raw_transcript,
          interview_notes: newInterview.interview_notes,
          status: 'raw'
        })
        .select()
        .single();

      if (error) throw error;

      // Update storyteller's interview count
      await supabase
        .from('profiles')
        .update({
          interviews_completed: interviews.length + 1
        })
        .eq('id', storytellerId);

      alert('Interview added successfully!');
      setShowAddForm(false);
      setNewInterview({
        interview_title: '',
        interview_date: '',
        interview_duration_minutes: 0,
        raw_transcript: '',
        interview_notes: ''
      });
      loadData();
    } catch (error: any) {
      console.error('Error adding interview:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interviewId);

      if (error) throw error;

      // Update count
      await supabase
        .from('profiles')
        .update({
          interviews_completed: Math.max(0, interviews.length - 1)
        })
        .eq('id', storytellerId);

      alert('Interview deleted');
      loadData();
    } catch (error: any) {
      console.error('Error deleting interview:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interviews...</p>
        </div>
      </div>
    );
  }

  if (!storyteller) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-600">Storyteller not found</p>
          <Link href="/picc/storytellers" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Storytellers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interviews: {storyteller.preferred_name || storyteller.full_name}
            </h1>
            <p className="text-gray-600">
              Manage interview transcripts and raw recordings
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Interview
          </button>
        </div>

        <Link
          href="/picc/storytellers"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Storytellers
        </Link>
      </div>

      {/* Add Interview Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Interview</h2>
          <form onSubmit={handleAddInterview}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Title *
                </label>
                <input
                  type="text"
                  required
                  value={newInterview.interview_title}
                  onChange={(e) => setNewInterview({ ...newInterview, interview_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Youth Services Interview - Roy Prior"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={newInterview.interview_date}
                  onChange={(e) => setNewInterview({ ...newInterview, interview_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={newInterview.interview_duration_minutes}
                onChange={(e) => setNewInterview({ ...newInterview, interview_duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 45"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raw Transcript *
              </label>
              <textarea
                required
                value={newInterview.raw_transcript}
                onChange={(e) => setNewInterview({ ...newInterview, raw_transcript: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Paste the full interview transcript here..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Paste the unedited, verbatim transcript from the interview recording
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Notes
              </label>
              <textarea
                value={newInterview.interview_notes}
                onChange={(e) => setNewInterview({ ...newInterview, interview_notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Context, key themes, or follow-up notes..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Interview
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interview List */}
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
            <p className="text-gray-600 mb-4">
              Add interview transcripts to link them to this storyteller
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add First Interview
            </button>
          </div>
        ) : (
          interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {interview.interview_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {interview.interview_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(interview.interview_date).toLocaleDateString()}
                      </div>
                    )}

                    {interview.interview_duration_minutes > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {interview.interview_duration_minutes} minutes
                      </div>
                    )}

                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      interview.status === 'raw' ? 'bg-yellow-100 text-yellow-700' :
                      interview.status === 'transcribed' ? 'bg-blue-100 text-blue-700' :
                      interview.status === 'edited' ? 'bg-purple-100 text-purple-700' :
                      interview.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteInterview(interview.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Delete interview"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {interview.interview_notes && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
                  <p className="text-sm text-gray-700">{interview.interview_notes}</p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Transcript Preview:</h4>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6 font-mono">
                    {interview.raw_transcript}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/picc/storytellers/${storytellerId}/interviews/${interview.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Transcript
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
