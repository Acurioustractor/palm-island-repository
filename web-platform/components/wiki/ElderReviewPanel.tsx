'use client';

import { useState } from 'react';
import {
  MessageSquare, CheckCircle, AlertTriangle, Plus, X, Send, Loader2,
} from 'lucide-react';

type ReviewType = 'correction' | 'addition' | 'sensitivity_flag' | 'approval';

interface ElderReviewPanelProps {
  artifactId?: string;
  storyId?: string;
  chapterRef?: string;
  /** Title of content being reviewed (for display) */
  contentTitle: string;
}

const REVIEW_TYPES: { value: ReviewType; label: string; description: string; icon: typeof MessageSquare }[] = [
  {
    value: 'correction',
    label: 'Needs Correction',
    description: 'Something here isn\'t quite right',
    icon: AlertTriangle,
  },
  {
    value: 'addition',
    label: 'I Have More Information',
    description: 'I can add to this story',
    icon: Plus,
  },
  {
    value: 'sensitivity_flag',
    label: 'Cultural Sensitivity',
    description: 'This needs elder review before publishing',
    icon: AlertTriangle,
  },
  {
    value: 'approval',
    label: 'Looks Correct',
    description: 'I confirm this is accurate',
    icon: CheckCircle,
  },
];

export default function ElderReviewPanel({
  artifactId,
  storyId,
  chapterRef,
  contentTitle,
}: ElderReviewPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewType, setReviewType] = useState<ReviewType | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewType || !name.trim()) return;
    if (reviewType !== 'approval' && !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/wiki/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifact_id: artifactId,
          story_id: storyId,
          chapter_ref: chapterRef,
          reviewer_name: name,
          review_type: reviewType,
          content: reviewType === 'approval' ? `Approved by ${name}` : content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-picc-ochre text-white rounded-full shadow-lg hover:bg-picc-ochre/90 transition-all hover:scale-105"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="font-medium">Elder Review</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-picc-ochre to-picc-ochre/80 px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">Elder Review</h3>
          <p className="text-sm text-white/80 line-clamp-1">{contentTitle}</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5">
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Thank You</h4>
            <p className="text-sm text-gray-600 mb-4">
              Your review has been submitted and will be reviewed by our team.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setReviewType(null);
                setContent('');
                setError(null);
              }}
              className="text-sm text-picc-ochre font-medium hover:text-picc-ochre/80 transition-colors"
            >
              Submit another review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-picc-ochre/30 focus:border-picc-ochre transition-all"
                required
              />
            </div>

            {/* Review Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What would you like to do?</label>
              <div className="grid grid-cols-2 gap-2">
                {REVIEW_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = reviewType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setReviewType(type.value)}
                      className={`text-left p-3 rounded-lg border-2 transition-all text-sm ${
                        isSelected
                          ? 'border-picc-ochre bg-picc-ochre/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-picc-ochre' : 'text-gray-400'}`} />
                      <span className={`block font-medium ${isSelected ? 'text-picc-ochre' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            {reviewType && reviewType !== 'approval' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {reviewType === 'correction'
                    ? 'What needs to be corrected?'
                    : reviewType === 'addition'
                    ? 'What would you like to add?'
                    : 'What are the cultural concerns?'}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="Share your knowledge..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-picc-ochre/30 focus:border-picc-ochre transition-all resize-none"
                  required
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Submit */}
            {reviewType && (
              <button
                type="submit"
                disabled={submitting || !name.trim() || (reviewType !== 'approval' && !content.trim())}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-picc-ochre text-white rounded-lg font-medium hover:bg-picc-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
