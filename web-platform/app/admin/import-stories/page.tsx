'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, CheckCircle, XCircle, Loader } from 'lucide-react';

interface ImportResult {
  storyteller: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
  characters?: number;
}

const STORYTELLERS_URL = 'https://raw.githubusercontent.com/Acurioustractor/Great-Palm-Island-PICC/main/data/storytellers.json';

export default function ImportStoriesPage() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [summary, setSummary] = useState<{
    imported: number;
    skipped: number;
    errors: number;
  } | null>(null);

  async function startImport() {
    setImporting(true);
    setResults([]);
    setSummary(null);

    const supabase = createClient();
    const importResults: ImportResult[] = [];
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    try {
      // Fetch storytellers from GitHub
      const response = await fetch(STORYTELLERS_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const storytellers = await response.json();

      // Filter those with transcripts
      const withTranscripts = storytellers.filter((s: any) => {
        const transcript = s.metadata?.['Transcript (from Media)'];
        return transcript && transcript.length > 0;
      });

      if (withTranscripts.length === 0) {
        importResults.push({
          storyteller: 'System',
          status: 'error',
          message: 'No transcripts found in source data',
        });
        setResults(importResults);
        setImporting(false);
        return;
      }

      // Import each story
      for (const storyteller of withTranscripts) {
        try {
          // Find profile by Airtable ID
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('metadata->>airtable_id', storyteller.id)
            .single();

          if (profileError || !profile) {
            importResults.push({
              storyteller: storyteller.name,
              status: 'skipped',
              message: `No matching profile (Airtable ID: ${storyteller.id})`,
            });
            skipped++;
            continue;
          }

          // Get transcript
          const transcript = Array.isArray(storyteller.metadata['Transcript (from Media)'])
            ? storyteller.metadata['Transcript (from Media)'].join('\n\n')
            : storyteller.metadata['Transcript (from Media)'];

          // Check if already imported
          const { data: existingStory } = await supabase
            .from('stories')
            .select('id')
            .eq('storyteller_id', profile.id)
            .eq('metadata->>source', 'airtable_transcript')
            .eq('metadata->>airtable_id', storyteller.id)
            .single();

          if (existingStory) {
            importResults.push({
              storyteller: storyteller.name,
              status: 'skipped',
              message: 'Already imported',
            });
            skipped++;
            continue;
          }

          // Import story
          const { error: storyError } = await supabase
            .from('stories')
            .insert({
              storyteller_id: profile.id,
              title: `${storyteller.name}'s Story`,
              content: transcript,
              media_type: 'text',
              access_level: 'public',
              status: 'published',
              metadata: {
                source: 'airtable_transcript',
                airtable_id: storyteller.id,
                personal_quote: storyteller.metadata?.['Personal Quote'],
                consent_status: storyteller.metadata?.['Consent Status'],
                imported_at: new Date().toISOString(),
              }
            });

          if (storyError) {
            importResults.push({
              storyteller: storyteller.name,
              status: 'error',
              message: storyError.message,
            });
            errors++;
          } else {
            importResults.push({
              storyteller: storyteller.name,
              status: 'success',
              message: 'Story imported',
              characters: transcript.length,
            });
            imported++;
          }

        } catch (error: any) {
          importResults.push({
            storyteller: storyteller.name,
            status: 'error',
            message: error.message,
          });
          errors++;
        }

        // Update UI after each storyteller
        setResults([...importResults]);
      }

      setSummary({ imported, skipped, errors });
    } catch (error: any) {
      importResults.push({
        storyteller: 'System',
        status: 'error',
        message: `Failed to fetch data: ${error.message}`,
      });
      setResults(importResults);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Import Stories from Transcripts</h1>
          <p className="text-purple-100">
            Automatically import stories from the Great-Palm-Island-PICC repository
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What This Does</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                This tool fetches storyteller data from the external GitHub repository and imports
                transcripts as stories into your database.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-blue-900 font-medium">Source:</p>
                <p className="text-blue-800 text-sm font-mono break-all">{STORYTELLERS_URL}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-2">✅ Will Import:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Storytellers with transcripts</li>
                    <li>• Matching by Airtable ID</li>
                    <li>• Full transcript content</li>
                    <li>• Personal quotes & metadata</li>
                  </ul>
                </div>
                <div className="border-2 border-yellow-200 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-900 mb-2">⏭️ Will Skip:</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Already imported stories</li>
                    <li>• No matching profile</li>
                    <li>• Empty transcripts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Import Button */}
          {!importing && results.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Download className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Import
              </h3>
              <p className="text-gray-600 mb-6">
                Click the button below to start importing stories from transcripts
              </p>
              <button
                onClick={startImport}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Start Import
              </button>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
              <Loader className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Importing Stories...
              </h3>
              <p className="text-gray-600">
                Processed {results.length} storyteller{results.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <>
              {/* Summary */}
              {summary && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-500 text-white rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{summary.imported}</div>
                    <div className="text-lg">Imported</div>
                  </div>
                  <div className="bg-yellow-500 text-white rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{summary.skipped}</div>
                    <div className="text-lg">Skipped</div>
                  </div>
                  <div className="bg-red-500 text-white rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{summary.errors}</div>
                    <div className="text-lg">Errors</div>
                  </div>
                </div>
              )}

              {/* Detailed Results */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Import Details</h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        result.status === 'success'
                          ? 'bg-green-50 border-l-4 border-green-500'
                          : result.status === 'skipped'
                          ? 'bg-yellow-50 border-l-4 border-yellow-500'
                          : 'bg-red-50 border-l-4 border-red-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : result.status === 'skipped' ? (
                          <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{result.storyteller}</div>
                          <div className="text-sm text-gray-600">{result.message}</div>
                        </div>
                      </div>
                      {result.characters && (
                        <div className="text-sm text-gray-500">
                          {result.characters.toLocaleString()} chars
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {summary && (
                <div className="mt-8 flex gap-4 justify-center">
                  <Link
                    href="/admin"
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
                  >
                    Back to Dashboard
                  </Link>
                  <Link
                    href="/storytellers"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
                  >
                    View Storytellers
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
