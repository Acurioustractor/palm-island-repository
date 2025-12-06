'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, ArrowRight, ArrowLeft, Sparkles, Check, Loader2,
  AlertCircle, HelpCircle, Edit3, Save, Send
} from 'lucide-react';

interface StoryPrompt {
  id: string;
  question: string;
  helpText: string;
  type: 'open' | 'feeling' | 'detail' | 'reflection';
  order: number;
}

interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  prompts: StoryPrompt[];
  culturalGuidance?: string;
}

interface StoryBuilderProps {
  onComplete?: (story: {
    title: string;
    content: string;
    summary: string;
    category: string;
    answers: Record<string, string>;
  }) => void;
  initialTemplate?: string;
}

export default function StoryBuilder({ onComplete, initialTemplate }: StoryBuilderProps) {
  const [templates, setTemplates] = useState<StoryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    content: string;
    summary: string;
    suggestedCategory: string;
  } | null>(null);
  const [followUpPrompts, setFollowUpPrompts] = useState<StoryPrompt[]>([]);
  const [culturalGuidance, setCulturalGuidance] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/ai/story-prompts?action=list');
      const data = await response.json();
      setTemplates(data.templates || []);

      if (initialTemplate) {
        const template = data.templates?.find((t: StoryTemplate) => t.id === initialTemplate);
        if (template) {
          setSelectedTemplate(template);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
    setLoading(false);
  }

  const selectTemplate = (template: StoryTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    setAnswers({});
    setGeneratedStory(null);
    setFollowUpPrompts([]);

    if (template.culturalGuidance) {
      setCulturalGuidance([template.culturalGuidance]);
    }
  };

  const currentPrompt = selectedTemplate?.prompts[currentStep];
  const allPrompts = [...(selectedTemplate?.prompts || []), ...followUpPrompts];
  const totalSteps = allPrompts.length;
  const isLastStep = currentStep >= totalSteps - 1;

  const handleAnswer = (answer: string) => {
    if (!currentPrompt) return;
    setAnswers(prev => ({
      ...prev,
      [currentPrompt.question]: answer
    }));
  };

  const nextStep = async () => {
    if (isLastStep) {
      generateStory();
    } else {
      setCurrentStep(prev => prev + 1);

      // Generate follow-up prompts after a few answers
      if (currentStep === 2 && selectedTemplate && followUpPrompts.length === 0) {
        try {
          const response = await fetch('/api/ai/story-prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'follow-up',
              answers,
              templateId: selectedTemplate.id,
              count: 2
            })
          });
          const data = await response.json();
          if (data.prompts) {
            setFollowUpPrompts(data.prompts);
          }
        } catch (error) {
          console.error('Error generating follow-up prompts:', error);
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateStory = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ai/story-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'draft',
          answers,
          style: 'first-person',
          includeQuotes: true
        })
      });
      const data = await response.json();
      setGeneratedStory({
        title: data.title,
        content: data.content,
        summary: data.summary,
        suggestedCategory: data.suggestedCategory
      });
    } catch (error) {
      console.error('Error generating story:', error);
    }
    setGenerating(false);
  };

  const handleComplete = () => {
    if (generatedStory && onComplete) {
      onComplete({
        ...generatedStory,
        category: generatedStory.suggestedCategory,
        answers
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  // Template Selection
  if (!selectedTemplate) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Story</h2>
          <p className="text-gray-600">
            Choose a story type to get started with guided prompts
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => selectTemplate(template)}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {template.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Story Generated - Review
  if (generatedStory) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <h2 className="text-xl font-bold text-white">Your Story</h2>
            <p className="text-purple-100 text-sm mt-1">
              Review and edit before saving
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={generatedStory.title}
                onChange={(e) => setGeneratedStory(prev =>
                  prev ? { ...prev, title: e.target.value } : null
                )}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                value={generatedStory.summary}
                onChange={(e) => setGeneratedStory(prev =>
                  prev ? { ...prev, summary: e.target.value } : null
                )}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Content
              </label>
              <textarea
                value={generatedStory.content}
                onChange={(e) => setGeneratedStory(prev =>
                  prev ? { ...prev, content: e.target.value } : null
                )}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setGeneratedStory(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Prompts
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Story
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Story Builder - Interview Mode
  const activePrompt = allPrompts[currentStep];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{selectedTemplate.name}</span>
          <span>Question {currentStep + 1} of {totalSteps}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Cultural Guidance */}
      {culturalGuidance.length > 0 && currentStep === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Cultural Guidance</h4>
              {culturalGuidance.map((guidance, i) => (
                <p key={i} className="text-sm text-amber-700 mt-1">{guidance}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question Card */}
      {activePrompt && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${activePrompt.type === 'feeling' ? 'bg-pink-100' :
                  activePrompt.type === 'reflection' ? 'bg-purple-100' :
                  activePrompt.type === 'detail' ? 'bg-blue-100' : 'bg-green-100'}
              `}>
                {activePrompt.type === 'feeling' ? '💭' :
                 activePrompt.type === 'reflection' ? '✨' :
                 activePrompt.type === 'detail' ? '📝' : '💬'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {activePrompt.question}
                </h3>
                {activePrompt.helpText && (
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    {activePrompt.helpText}
                  </p>
                )}
              </div>
            </div>

            <textarea
              value={answers[activePrompt.question] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={!answers[activePrompt.question]?.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : isLastStep ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Story
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Answered Questions Summary */}
      {Object.keys(answers).length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => {/* Toggle answers view */}}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {Object.keys(answers).length} questions answered
          </button>
        </div>
      )}
    </div>
  );
}
