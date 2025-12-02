'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, MapPin, Calendar, BookOpen, Quote as QuoteIcon,
  Star, CheckCircle, Plus, Sparkles, Loader2, Image as ImageIcon,
  Edit, Mic, FileText, Camera, Clock, Heart, Award
} from 'lucide-react';
import { StorytellerQuoteCard } from '@/components/storyteller/StorytellerQuoteCard';

interface Profile {
  id: string;
  full_name: string;
  preferred_name?: string;
  community_role?: string;
  bio?: string;
  storyteller_type?: string;
  is_elder?: boolean;
  is_cultural_advisor?: boolean;
  location?: string;
  traditional_country?: string;
  language_group?: string;
  age_range?: string;
  profile_image_url?: string;
  stories_contributed?: number;
  created_at: string;
  expertise_areas?: string[];
  languages_spoken?: string[];
}

interface ExtractedQuote {
  id: string;
  quote_text: string;
  attribution: string;
  context?: string;
  theme?: string;
  sentiment?: string;
  impact_area?: string;
  is_validated: boolean;
  suggested_for_report: boolean;
  used_in_report_id?: string;
  created_at: string;
}

interface Interview {
  id: string;
  interview_title: string;
  interview_date: string;
  interview_type: string;
  status: string;
  raw_transcript?: string;
  key_themes?: string[];
}

interface MediaFile {
  id: string;
  public_url: string;
  title?: string;
  file_type: string;
}

export default function StorytellerProfilePage() {
  const params = useParams();
  const storytellerId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [quotes, setQuotes] = useState<ExtractedQuote[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quotes' | 'interviews' | 'photos'>('quotes');

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', storytellerId)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Load quotes
    const { data: quotesData } = await (supabase as any)
      .from('extracted_quotes')
      .select('*')
      .eq('profile_id', storytellerId)
      .order('created_at', { ascending: false });

    if (quotesData) {
      setQuotes(quotesData);
    }

    // Load interviews
    const { data: interviewsData } = await (supabase as any)
      .from('interviews')
      .select('*')
      .eq('storyteller_id', storytellerId)
      .order('interview_date', { ascending: false });

    if (interviewsData) {
      setInterviews(interviewsData);
    }

    // Load photos where this person is tagged
    const { data: photosData } = await (supabase as any)
      .from('media_files')
      .select('id, public_url, title, file_type')
      .contains('faces_detected', [storytellerId])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .limit(20);

    if (photosData) {
      setPhotos(photosData);
    }

    setLoading(false);
  }, [storytellerId, supabase]);

  useEffect(() => {
    if (storytellerId) {
      loadData();
    }
  }, [storytellerId, loadData]);

  const analyzeInterview = async (interview: Interview) => {
    if (!interview.raw_transcript) {
      alert('No transcript available for this interview');
      return;
    }

    setAnalyzing(interview.id);

    try {
      const response = await fetch('/api/interviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_id: interview.id,
          storyteller_id: storytellerId,
          storyteller_name: profile?.preferred_name || profile?.full_name
        })
      });

      const result = await response.json();

      if (result.success) {
        // Reload data to get new quotes
        loadData();
        alert(`Analysis complete! Extracted ${result.analysis.total_quotes_found} quotes.`);
      } else {
        alert('Analysis failed: ' + result.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze interview');
    }

    setAnalyzing(null);
  };

  const validateQuote = async (quoteId: string, validated: boolean) => {
    await (supabase as any)
      .from('extracted_quotes')
      .update({ is_validated: validated })
      .eq('id', quoteId);

    setQuotes(quotes.map(q =>
      q.id === quoteId ? { ...q, is_validated: validated } : q
    ));
  };

  const toggleReportSuggestion = async (quoteId: string, suggested: boolean) => {
    await (supabase as any)
      .from('extracted_quotes')
      .update({ suggested_for_report: suggested })
      .eq('id', quoteId);

    setQuotes(quotes.map(q =>
      q.id === quoteId ? { ...q, suggested_for_report: suggested } : q
    ));
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-500 mt-2">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Storyteller not found</p>
        <Link href="/picc/storytellers" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Storytellers
        </Link>
      </div>
    );
  }

  const displayName = profile.preferred_name || profile.full_name;
  const validatedQuotes = quotes.filter(q => q.is_validated);
  const reportQuotes = quotes.filter(q => q.suggested_for_report);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        href="/picc/storytellers"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Storytellers
      </Link>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          {profile.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={displayName}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold border-4 border-white/30">
              {displayName.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              {profile.is_elder && (
                <span className="px-3 py-1 bg-amber-400 text-amber-900 text-sm font-bold rounded-full">
                  Elder
                </span>
              )}
              {profile.is_cultural_advisor && (
                <span className="px-3 py-1 bg-purple-300 text-purple-900 text-sm font-bold rounded-full">
                  Cultural Advisor
                </span>
              )}
            </div>

            {profile.community_role && (
              <p className="text-xl text-purple-100 mb-2">{profile.community_role}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-purple-100">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile.traditional_country && (
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {profile.traditional_country}
                </span>
              )}
              {profile.language_group && (
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {profile.language_group}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-purple-100 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/picc/storytellers/${storytellerId}/edit`}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
            <Link
              href={`/picc/storytellers/${storytellerId}/interviews`}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Interviews
            </Link>
            <Link
              href={`/picc/storytellers/${storytellerId}/upload`}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Upload Photo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold">{quotes.length}</div>
            <div className="text-sm text-purple-200">Quotes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{validatedQuotes.length}</div>
            <div className="text-sm text-purple-200">Validated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{interviews.length}</div>
            <div className="text-sm text-purple-200">Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{photos.length}</div>
            <div className="text-sm text-purple-200">Photos</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'quotes'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <QuoteIcon className="w-4 h-4 inline mr-2" />
          Quotes ({quotes.length})
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'interviews'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mic className="w-4 h-4 inline mr-2" />
          Interviews ({interviews.length})
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'photos'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Photos ({photos.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'quotes' && (
        <div>
          {/* Report Ready Quotes */}
          {reportQuotes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Report-Ready Quotes ({reportQuotes.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {reportQuotes.map(quote => (
                  <div
                    key={quote.id}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5"
                  >
                    <blockquote className="text-gray-700 italic mb-3">
                      "{quote.quote_text}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {quote.theme && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                            {quote.theme}
                          </span>
                        )}
                        {quote.is_validated && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <button
                        onClick={() => toggleReportSuggestion(quote.id, false)}
                        className="text-xs text-amber-600 hover:text-amber-700"
                      >
                        Remove from reports
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Quotes */}
          <h2 className="text-lg font-bold text-gray-900 mb-4">All Quotes</h2>
          {quotes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <QuoteIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No quotes extracted yet</p>
              <p className="text-sm text-gray-400">
                Add an interview and analyze it to extract quotes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map(quote => (
                <div
                  key={quote.id}
                  className={`bg-white border rounded-xl p-5 ${
                    quote.is_validated ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  <blockquote className="text-gray-700 italic mb-3 text-lg">
                    "{quote.quote_text}"
                  </blockquote>

                  {quote.context && (
                    <p className="text-sm text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                      Context: {quote.context}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {quote.theme && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {quote.theme}
                        </span>
                      )}
                      {quote.sentiment && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {quote.sentiment}
                        </span>
                      )}
                      {quote.impact_area && (
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                          {quote.impact_area}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => validateQuote(quote.id, !quote.is_validated)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          quote.is_validated
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {quote.is_validated ? 'Validated' : 'Validate'}
                      </button>
                      <button
                        onClick={() => toggleReportSuggestion(quote.id, !quote.suggested_for_report)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          quote.suggested_for_report
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        {quote.suggested_for_report ? 'For Report' : 'Add to Report'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'interviews' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Interviews</h2>
            <Link
              href={`/picc/storytellers/${storytellerId}/interviews`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Interview
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Mic className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No interviews recorded yet</p>
              <Link
                href={`/picc/storytellers/${storytellerId}/interviews`}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Record first interview →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map(interview => (
                <div
                  key={interview.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{interview.interview_title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(interview.interview_date).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">
                          {interview.interview_type?.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          interview.status === 'approved' ? 'bg-green-100 text-green-700' :
                          interview.status === 'transcribed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {interview.status}
                        </span>
                      </div>

                      {interview.key_themes && interview.key_themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {interview.key_themes.map((theme, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {interview.raw_transcript && (
                        <button
                          onClick={() => analyzeInterview(interview)}
                          disabled={analyzing === interview.id}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {analyzing === interview.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Extract Quotes
                            </>
                          )}
                        </button>
                      )}
                      <Link
                        href={`/picc/storytellers/${storytellerId}/interviews`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>

                  {interview.raw_transcript && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {interview.raw_transcript}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Photos featuring {displayName}</h2>
            <Link
              href="/picc/media/gallery"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Browse All Photos →
            </Link>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No photos tagged with {displayName} yet</p>
              <Link
                href="/picc/media/gallery"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Tag photos in gallery →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(photo => (
                <Link
                  key={photo.id}
                  href="/picc/media/gallery"
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                >
                  <img
                    src={photo.public_url}
                    alt={photo.title || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
