'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  FileText,
  Edit3,
  Check,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';

interface Interview {
  id: string;
  storyteller_id: string;
  interview_title: string;
  interview_date: string;
  interview_duration_minutes: number;
  raw_transcript: string;
  edited_transcript: string | null;
  interview_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
}

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storytellerId = params.id as string;
  const interviewId = params.interviewId as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [storyteller, setStoryteller] = useState<Storyteller | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'raw' | 'edited'>('raw');

  useEffect(() => {
    loadData();
  }, [storytellerId, interviewId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // Load storyteller
      const { data: storytellerData, error: storytellerError } = await supabase
        .from('profiles')
        .select('id, full_name, preferred_name')
        .eq('id', storytellerId)
        .single();

      if (storytellerError) throw storytellerError;
      setStoryteller(storytellerData);

      // Load interview
      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (interviewError) throw interviewError;
      setInterview(interviewData);
      setEditedTranscript(interviewData.edited_transcript || interviewData.raw_transcript);
      setEditedNotes(interviewData.interview_notes || '');

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!interview) return;

    try {
      setSaving(true);
      setError(null);
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('interviews')
        .update({
          edited_transcript: editedTranscript,
          interview_notes: editedNotes,
          status: editedTranscript !== interview.raw_transcript ? 'edited' : interview.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', interviewId);

      if (updateError) throw updateError;

      setSuccessMessage('Transcript saved successfully!');
      setIsEditing(false);
      loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('Copied to clipboard!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadTranscript = () => {
    if (!interview || !storyteller) return;

    const content = activeTab === 'edited' && interview.edited_transcript
      ? interview.edited_transcript
      : interview.raw_transcript;

    const filename = `${storyteller.full_name.replace(/\s+/g, '_')}_${interview.interview_title.replace(/\s+/g, '_')}_transcript.txt`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Link href={`/picc/storytellers/${storytellerId}/interviews`} className="text-blue-600 hover:underline">
            Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  if (!interview || !storyteller) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-600">Interview not found</p>
          <Link href={`/picc/storytellers/${storytellerId}/interviews`} className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/picc/storytellers/${storytellerId}/interviews`}
          className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {storyteller.preferred_name || storyteller.full_name}'s Interviews
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {interview.interview_title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {storyteller.preferred_name || storyteller.full_name}
              </span>
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

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTranscript(interview.edited_transcript || interview.raw_transcript);
                    setEditedNotes(interview.interview_notes || '');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Transcript
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {(interview.interview_notes || isEditing) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Interview Notes</h3>
          {isEditing ? (
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Add notes about this interview..."
            />
          ) : (
            <p className="text-sm text-gray-700">{interview.interview_notes || 'No notes'}</p>
          )}
        </div>
      )}

      {/* Transcript Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'raw'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Raw Transcript
              </button>
              <button
                onClick={() => setActiveTab('edited')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'edited'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit3 className="w-4 h-4 inline mr-2" />
                Edited Transcript
                {interview.edited_transcript && (
                  <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    Available
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 py-2">
              <button
                onClick={() => copyToClipboard(
                  activeTab === 'edited' && interview.edited_transcript
                    ? interview.edited_transcript
                    : interview.raw_transcript
                )}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={downloadTranscript}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Download transcript"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Content */}
        <div className="p-6">
          {activeTab === 'raw' ? (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                {interview.raw_transcript}
              </pre>
            </div>
          ) : isEditing ? (
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="w-full h-[600px] px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Edit the transcript here..."
            />
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                {interview.edited_transcript || (
                  <span className="text-gray-400 italic">
                    No edited transcript yet. Click "Edit Transcript" to create one.
                  </span>
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Word Count */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 text-sm text-gray-600">
          <span>
            Word count: {' '}
            {(activeTab === 'edited' && interview.edited_transcript
              ? interview.edited_transcript
              : interview.raw_transcript
            ).split(/\s+/).filter(Boolean).length.toLocaleString()}
          </span>
          <span className="mx-4">|</span>
          <span>
            Characters: {' '}
            {(activeTab === 'edited' && interview.edited_transcript
              ? interview.edited_transcript
              : interview.raw_transcript
            ).length.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
