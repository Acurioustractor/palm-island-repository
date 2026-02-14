'use client';

import { useState } from 'react';
import { Sparkles, FileText, ListChecks, Send, Loader2, CheckCircle2, AlertTriangle, X, BookOpen } from 'lucide-react';

type InputMode = 'transcript' | 'structured';

interface GeneratedStory {
  title: string;
  summary: string;
  content: string;
  story_type: string;
  emotional_theme: string;
  suggested_tags: string[];
  key_quotes: string[];
  contains_traditional_knowledge: boolean;
  cultural_sensitivity_level: string;
  elder_approval_needed: boolean;
  related_service: string | null;
  storyteller_name: string;
  is_elder_story: boolean;
}

interface StoryCreatorPanelProps {
  onStoryCreated?: (story: GeneratedStory) => void;
  onClose?: () => void;
}

export default function StoryCreatorPanel({ onStoryCreated, onClose }: StoryCreatorPanelProps) {
  const [mode, setMode] = useState<InputMode>('transcript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedStory | null>(null);
  const [saving, setSaving] = useState(false);

  // Common fields
  const [storytellerName, setStorytellerName] = useState('');
  const [isElder, setIsElder] = useState(false);

  // Transcript mode
  const [transcript, setTranscript] = useState('');

  // Structured mode
  const [who, setWho] = useState('');
  const [what, setWhat] = useState('');
  const [impact, setImpact] = useState('');
  const [quote, setQuote] = useState('');
  const [service, setService] = useState('');
  const [context, setContext] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body: any = {
        storyteller_name: storytellerName || undefined,
        is_elder: isElder,
      };

      if (mode === 'transcript') {
        if (!transcript.trim()) {
          setError('Please enter a transcript or notes');
          setLoading(false);
          return;
        }
        body.input_type = 'text';
        body.text = transcript;
      } else {
        if (!what.trim()) {
          setError('Please fill in at least the "What happened" field');
          setLoading(false);
          return;
        }
        body.input_type = 'structured';
        body.structured = { who, what, impact, quote, service, context };
      }

      const res = await fetch('/api/stories/generate-from-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();
      setResult(data.story);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          summary: result.summary,
          content: result.content,
          story_type: result.story_type,
          category: result.story_type,
          emotional_theme: result.emotional_theme,
          status: 'draft',
          access_level: 'internal',
          contains_traditional_knowledge: result.contains_traditional_knowledge,
          cultural_sensitivity_level: result.cultural_sensitivity_level,
          tags: result.suggested_tags,
          is_elder_story: result.is_elder_story,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save story');
      }

      onStoryCreated?.(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-picc-ochre" />
          <h2 className="text-lg font-semibold text-gray-900">AI Story Creator</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* If we have a result, show it */}
        {result ? (
          <StoryPreview
            story={result}
            onSave={handleSave}
            saving={saving}
            onBack={() => setResult(null)}
            error={error}
          />
        ) : (
          <>
            {/* Storyteller Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storyteller Name</label>
                <input
                  type="text"
                  value={storytellerName}
                  onChange={e => setStorytellerName(e.target.value)}
                  placeholder="e.g., Uncle Allan, Sarah Jones"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isElder}
                    onChange={e => setIsElder(e.target.checked)}
                    className="rounded border-gray-300 text-picc-ochre focus:ring-picc-ochre-300"
                  />
                  <span className="text-sm text-gray-700">This person is an Elder</span>
                </label>
              </div>
            </div>

            {/* Input Mode Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-0.5">
              <TabButton
                active={mode === 'transcript'}
                onClick={() => setMode('transcript')}
                icon={<FileText className="w-4 h-4" />}
                label="Paste Transcript"
              />
              <TabButton
                active={mode === 'structured'}
                onClick={() => setMode('structured')}
                icon={<ListChecks className="w-4 h-4" />}
                label="Structured Notes"
              />
            </div>

            {/* Transcript Mode */}
            {mode === 'transcript' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Transcript or Notes
                </label>
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="Paste the interview transcript, raw notes, or summary here. The AI will extract a story from whatever you provide..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Include direct quotes for better results. The AI will preserve the storyteller&apos;s voice.
                </p>
              </div>
            )}

            {/* Structured Mode */}
            {mode === 'structured' && (
              <div className="space-y-4">
                <Field label="Who is this about?" value={who} onChange={setWho} placeholder="Name, role, community connection" />
                <Field label="What happened?" value={what} onChange={setWhat} placeholder="The core event, achievement, or journey" required />
                <Field label="What was the impact?" value={impact} onChange={setImpact} placeholder="How did this change things? What was achieved?" />
                <Field label="Direct quote (if any)" value={quote} onChange={setQuote} placeholder="Their exact words..." />
                <Field label="Related PICC service" value={service} onChange={setService} placeholder="e.g., Family Wellbeing Centre, Youth Service" />
                <Field label="Additional context" value={context} onChange={setContext} placeholder="Anything else the AI should know..." />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-picc-ochre text-white rounded-xl font-semibold hover:bg-picc-ochre-600 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating story...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Story Draft
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        active
          ? 'bg-warm-50 text-picc-ochre border-b-2 border-picc-ochre'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
      />
    </div>
  );
}

function StoryPreview({ story, onSave, saving, onBack, error }: {
  story: GeneratedStory;
  onSave: () => void;
  saving: boolean;
  onBack: () => void;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-picc-ochre hover:text-picc-ochre-600 font-medium"
      >
        &larr; Back to editor
      </button>

      <div className="bg-gray-50 rounded-xl p-5 space-y-3">
        <h3 className="text-xl font-bold text-gray-900">{story.title}</h3>
        <p className="text-sm text-gray-500 italic">{story.summary}</p>
        <div className="prose prose-sm max-w-none text-gray-700">
          {story.content.split('\n').filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <span className="text-gray-500">Type:</span>{' '}
          <span className="font-medium text-gray-900">{story.story_type?.replace('_', ' ')}</span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <span className="text-gray-500">Theme:</span>{' '}
          <span className="font-medium text-gray-900">{story.emotional_theme}</span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <span className="text-gray-500">Sensitivity:</span>{' '}
          <span className={`font-medium ${
            story.cultural_sensitivity_level === 'high' ? 'text-red-600' :
            story.cultural_sensitivity_level === 'medium' ? 'text-picc-ochre' : 'text-sage-600'
          }`}>
            {story.cultural_sensitivity_level}
          </span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <span className="text-gray-500">Service:</span>{' '}
          <span className="font-medium text-gray-900">{story.related_service || 'None'}</span>
        </div>
      </div>

      {/* Cultural Flags */}
      {(story.contains_traditional_knowledge || story.elder_approval_needed) && (
        <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg p-3 space-y-1">
          {story.contains_traditional_knowledge && (
            <p className="text-sm text-picc-ochre flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Contains traditional knowledge - review required
            </p>
          )}
          {story.elder_approval_needed && (
            <p className="text-sm text-picc-ochre flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Elder approval required before publishing
            </p>
          )}
        </div>
      )}

      {/* Tags */}
      {story.suggested_tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {story.suggested_tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-warm-100 text-picc-ochre rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Quotes */}
      {story.key_quotes?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Key Quotes:</h4>
          {story.key_quotes.map((q, i) => (
            <blockquote key={i} className="text-sm italic text-gray-600 border-l-2 border-picc-ochre-300 pl-3">
              &ldquo;{q}&rdquo;
            </blockquote>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-xl font-semibold hover:bg-sage-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          Save as Draft
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Edit Input
        </button>
      </div>
    </div>
  );
}
