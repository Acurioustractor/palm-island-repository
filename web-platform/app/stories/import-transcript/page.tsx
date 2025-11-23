'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Mic,
  Video,
  Calendar,
  Clock,
  User,
  Shield
} from 'lucide-react';
import Link from 'next/link';

// PICC Organization and Tenant IDs
const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479';
const PICC_TENANT_ID = '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';

interface Profile {
  id: string;
  full_name: string;
  storyteller_type: string;
}

interface Service {
  id: string;
  service_name: string;
  service_slug: string;
}

export default function ImportTranscriptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState({
    // Content
    title: '',
    content: '',
    summary: '',
    // Classification
    story_type: 'oral_history',
    story_category: 'culture',
    privacy_level: 'community',
    // People
    storyteller_id: '',
    interviewer_name: '',
    // Recording Details
    recording_date: '',
    duration_minutes: '',
    original_format: 'audio_recording',
    interview_location: 'Palm Island',
    language: 'English',
    // Service Connection
    service_id: '',
    // Cultural
    requires_cultural_review: false,
    contains_traditional_knowledge: false
  });

  const storyTypes = [
    { value: 'oral_history', label: 'Oral History', description: 'Recorded life story or memories' },
    { value: 'traditional_knowledge', label: 'Traditional Knowledge', description: 'Cultural practices, language, customs' },
    { value: 'personal_story', label: 'Personal Story', description: 'Individual experience or journey' },
    { value: 'service_story', label: 'Service Story', description: 'Experience with PICC services' },
    { value: 'impact_story', label: 'Impact Story', description: 'Story showing community impact' }
  ];

  const categories = [
    { value: 'culture', label: 'Culture & Language' },
    { value: 'health', label: 'Health & Healing' },
    { value: 'youth_development', label: 'Youth & Education' },
    { value: 'family_support', label: 'Family & Community' },
    { value: 'environment', label: 'Environment & Country' },
    { value: 'elder_care', label: 'Elder Wisdom' },
    { value: 'economic', label: 'Economic Development' },
    { value: 'womens_health', label: "Women's Stories" },
    { value: 'mens_health', label: "Men's Stories" },
    { value: 'community_events', label: 'Community Events' }
  ];

  const privacyLevels = [
    { value: 'public', label: 'Public', description: 'Visible to everyone', color: 'green' },
    { value: 'community', label: 'Community Only', description: 'Only visible to Palm Island community', color: 'blue' },
    { value: 'restricted', label: 'Restricted', description: 'Limited access, requires approval', color: 'orange' }
  ];

  const recordingFormats = [
    { value: 'audio_recording', label: 'Audio Recording', icon: Mic },
    { value: 'video_recording', label: 'Video Recording', icon: Video },
    { value: 'written_notes', label: 'Written Notes', icon: FileText }
  ];

  // Fetch profiles and services on mount
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch storytellers
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, storyteller_type')
        .eq('primary_organization_id', PICC_ORG_ID)
        .order('full_name');

      if (profileData) {
        setProfiles(profileData);
      }

      // Fetch services
      const { data: serviceData } = await supabase
        .from('organization_services')
        .select('id, service_name, service_slug')
        .eq('organization_id', PICC_ORG_ID)
        .eq('is_active', true)
        .order('service_name');

      if (serviceData) {
        setServices(serviceData);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.storyteller_id) {
      setError('Please select a storyteller');
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Please enter the transcript content');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Build metadata
      const metadata = {
        source_type: 'transcript',
        recording_date: formData.recording_date || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        original_format: formData.original_format,
        interview_location: formData.interview_location || null,
        language: formData.language,
        transcribed_by: formData.interviewer_name || null,
        requires_cultural_review: formData.requires_cultural_review,
        imported_at: new Date().toISOString()
      };

      // Create the story
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          tenant_id: PICC_TENANT_ID,
          organization_id: PICC_ORG_ID,
          service_id: formData.service_id || null,
          storyteller_id: formData.storyteller_id,
          author_id: formData.storyteller_id, // Usually same for transcripts
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          story_type: formData.story_type,
          story_category: formData.story_category,
          privacy_level: formData.privacy_level,
          is_public: formData.privacy_level === 'public',
          status: 'draft', // Always start as draft for review
          contains_traditional_knowledge: formData.contains_traditional_knowledge,
          cultural_sensitivity_level: formData.requires_cultural_review ? 'high' : 'low',
          elder_approval_required: formData.requires_cultural_review || formData.contains_traditional_knowledge,
          metadata: metadata
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      setTimeout(() => {
        router.push('/stories');
      }, 2000);

    } catch (err: any) {
      console.error('Error importing transcript:', err);
      setError(err.message || 'Failed to import transcript');
      setLoading(false);
    }
  };

  // Auto-set cultural review flag
  useEffect(() => {
    if (formData.story_type === 'traditional_knowledge' || formData.contains_traditional_knowledge) {
      setFormData(prev => ({ ...prev, requires_cultural_review: true }));
    }
  }, [formData.story_type, formData.contains_traditional_knowledge]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            Transcript Imported!
          </h1>
          <p className="text-gray-700 mb-2">
            <strong>{formData.title}</strong> has been imported as a draft story.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            It will need to be reviewed before publishing.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to stories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/stories"
            className="inline-flex items-center text-orange-600 hover:text-orange-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <FileText className="w-8 h-8 text-orange-600 mr-3" />
              <h1 className="text-3xl font-bold text-orange-900">
                Import Transcript
              </h1>
            </div>
            <p className="text-gray-600">
              Import an interview transcript, oral history, or recorded conversation as a story.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Storyteller Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Who is the Storyteller?
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storyteller *
                </label>
                <select
                  required
                  value={formData.storyteller_id}
                  onChange={(e) => setFormData({ ...formData, storyteller_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select the person speaking in the transcript...</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name} ({profile.storyteller_type})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Don't see the person? <Link href="/storytellers/add" className="text-orange-600 hover:underline">Add them first</Link>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer / Transcriber (Optional)
                </label>
                <input
                  type="text"
                  value={formData.interviewer_name}
                  onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Who conducted the interview or transcribed it?"
                />
              </div>
            </div>
          </div>

          {/* Transcript Content */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Transcript Content</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Interview: Traditional Fishing Practices with Uncle John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary (2-3 sentences) *
                </label>
                <textarea
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Brief summary of what the transcript covers..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Transcript *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste the full transcript here...

You can format it like:

Interviewer: Can you tell us about...

Storyteller: Yes, I remember when...

Or just paste the full text without speaker labels."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.content.length} characters • ~{Math.ceil(formData.content.split(/\s+/).length)} words
                </p>
              </div>
            </div>
          </div>

          {/* Recording Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-orange-600" />
              Recording Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Recording Date
                </label>
                <input
                  type="date"
                  value={formData.recording_date}
                  onChange={(e) => setFormData({ ...formData, recording_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 45"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Format
                </label>
                <div className="flex gap-2">
                  {recordingFormats.map(format => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, original_format: format.value })}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          formData.original_format === format.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          formData.original_format === format.value ? 'text-orange-600' : 'text-gray-400'
                        }`} />
                        <span className="text-xs">{format.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Location
                </label>
                <input
                  type="text"
                  value={formData.interview_location}
                  onChange={(e) => setFormData({ ...formData, interview_location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Palm Island, Cultural Centre"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Classification</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {storyTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, story_type: type.value })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.story_type === type.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.story_category}
                    onChange={(e) => setFormData({ ...formData, story_category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linked Service (Optional)
                  </label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">No specific service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.service_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Cultural */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              Privacy & Cultural Protocols
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Level *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {privacyLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, privacy_level: level.value })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.privacy_level === level.value
                          ? `border-${level.color}-500 bg-${level.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{level.label}</div>
                      <div className="text-xs text-gray-500">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.contains_traditional_knowledge}
                    onChange={(e) => setFormData({ ...formData, contains_traditional_knowledge: e.target.checked })}
                    className="mt-1 h-5 w-5 text-orange-600 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Contains Traditional Knowledge</div>
                    <div className="text-sm text-gray-600">
                      This transcript includes cultural practices, language, or sacred knowledge.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_cultural_review}
                    onChange={(e) => setFormData({ ...formData, requires_cultural_review: e.target.checked })}
                    className="mt-1 h-5 w-5 text-orange-600 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Requires Cultural Review</div>
                    <div className="text-sm text-gray-600">
                      This transcript should be reviewed by an elder or cultural advisor before publishing.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Cultural Warning */}
          {(formData.requires_cultural_review || formData.contains_traditional_knowledge) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Cultural Review Required
              </h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• This transcript will be saved as a draft pending cultural review</li>
                <li>• An elder or cultural advisor must approve before it can be published</li>
                <li>• Traditional knowledge content may have restricted access</li>
                <li>• Ensure the storyteller has given proper consent for this content</li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
            >
              {loading ? 'Importing...' : 'Import Transcript'}
            </button>
            <Link
              href="/stories"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Transcripts are saved as drafts and will need review before publishing.
            </p>
            <p className="mt-1">
              All community content remains 100% community-owned and controlled.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
