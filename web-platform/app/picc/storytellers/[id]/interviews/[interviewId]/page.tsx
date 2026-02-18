'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
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

export default function InterviewDetailPage() {
  const params = useParams();
  const storytellerId = params.id as string;
  const interviewId = params.interviewId as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [storyteller, setStoryteller] = useState<Storyteller | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'raw' | 'edited' | 'notes'>('raw');

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [{ data: st }, { data: iv }] = await Promise.all([
        supabase.from('storytellers').select('id, full_name, preferred_name').eq('id', storytellerId).single(),
        supabase.from('interviews').select('*').eq('id', interviewId).single(),
      ]);
      if (st) setStoryteller(st);
      if (iv) setInterview(iv);
      setLoading(false);
    }

    load();
  }, [storytellerId, interviewId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-gray-500">Interview not found.</p>
        <Link href={`/picc/storytellers/${storytellerId}/interviews`} className="text-picc-red hover:underline mt-2 inline-block">
          Back to interviews
        </Link>
      </div>
    );
  }

  const name = storyteller?.preferred_name || storyteller?.full_name || 'Unknown';
  const hasEdited = interview.edited_transcript && interview.edited_transcript.trim().length > 0;
  const hasNotes = interview.interview_notes && interview.interview_notes.trim().length > 0;

  const transcript = tab === 'edited' ? interview.edited_transcript : tab === 'notes' ? interview.interview_notes : interview.raw_transcript;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/picc/storytellers/${storytellerId}/interviews`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-picc-red mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {name}&apos;s Interviews
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{interview.interview_title || 'Interview'}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {interview.interview_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(interview.interview_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          {interview.interview_duration_minutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {interview.interview_duration_minutes} minutes
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            interview.status === 'edited' ? 'bg-green-100 text-green-700' :
            interview.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {interview.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('raw')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'raw' ? 'border-picc-red text-picc-red' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          Raw Transcript
        </button>
        {hasEdited && (
          <button
            onClick={() => setTab('edited')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'edited' ? 'border-picc-red text-picc-red' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Edited Transcript
          </button>
        )}
        {hasNotes && (
          <button
            onClick={() => setTab('notes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'notes' ? 'border-picc-red text-picc-red' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notes
          </button>
        )}
      </div>

      {/* Transcript content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
            {transcript || 'No content available.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
