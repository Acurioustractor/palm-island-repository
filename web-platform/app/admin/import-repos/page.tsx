'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Download, Plus, Trash2, CheckCircle, XCircle, Loader, Github } from 'lucide-react';

interface RepoSource {
  id: string;
  url: string;
  name: string;
}

interface ImportResult {
  repo: string;
  status: 'success' | 'error';
  message: string;
  imported: number;
}

export default function ImportReposPage() {
  const [repos, setRepos] = useState<RepoSource[]>([
    {
      id: '1',
      url: 'https://raw.githubusercontent.com/Acurioustractor/Great-Palm-Island-PICC/main/data/storytellers.json',
      name: 'Great Palm Island PICC - Storytellers'
    }
  ]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);

  function addRepo() {
    if (!newRepoUrl || !newRepoName) return;

    setRepos([
      ...repos,
      {
        id: Date.now().toString(),
        url: newRepoUrl,
        name: newRepoName,
      }
    ]);
    setNewRepoUrl('');
    setNewRepoName('');
  }

  function removeRepo(id: string) {
    setRepos(repos.filter(r => r.id !== id));
  }

  async function importFromRepos() {
    setImporting(true);
    setResults([]);

    const supabase = createClient();
    const importResults: ImportResult[] = [];

    for (const repo of repos) {
      try {
        // Fetch data from URL
        const response = await fetch(repo.url);
        if (!response.ok) {
          importResults.push({
            repo: repo.name,
            status: 'error',
            message: `HTTP ${response.status}`,
            imported: 0,
          });
          continue;
        }

        const data = await response.json();

        // Determine data type and import accordingly
        let imported = 0;

        if (Array.isArray(data)) {
          // Assume it's storytellers if it has name/id fields
          const hasStorytellerFields = data[0]?.name && data[0]?.id;

          if (hasStorytellerFields) {
            // Import storytellers
            for (const item of data) {
              try {
                // Check if already exists by external ID
                const { data: existing } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('metadata->>external_id', item.id)
                  .single();

                if (existing) continue; // Skip duplicates

                // Create profile
                const { error } = await supabase
                  .from('profiles')
                  .insert({
                    full_name: item.name,
                    preferred_name: item.preferred_name || item.name,
                    bio: item.bio || '',
                    location: item.location || 'Palm Island',
                    profile_image_url: item.profileImage || null,
                    storyteller_type: item.type || 'community_member',
                    is_elder: item.is_elder || false,
                    metadata: {
                      external_id: item.id,
                      source: repo.name,
                      imported_at: new Date().toISOString(),
                      ...item.metadata,
                    }
                  });

                if (!error) imported++;

                // Import transcript if available
                if (item.metadata?.['Transcript (from Media)']) {
                  const transcript = Array.isArray(item.metadata['Transcript (from Media)'])
                    ? item.metadata['Transcript (from Media)'].join('\n\n')
                    : item.metadata['Transcript (from Media)'];

                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('metadata->>external_id', item.id)
                    .single();

                  if (profile) {
                    await supabase
                      .from('stories')
                      .insert({
                        storyteller_id: profile.id,
                        title: `${item.name}'s Story`,
                        content: transcript,
                        media_type: 'text',
                        access_level: 'public',
                        status: 'published',
                        metadata: {
                          source: repo.name,
                          external_id: item.id,
                          imported_at: new Date().toISOString(),
                        }
                      });
                  }
                }
              } catch (err) {
                console.error('Error importing item:', err);
              }
            }
          }
        }

        importResults.push({
          repo: repo.name,
          status: 'success',
          message: `Imported ${imported} items`,
          imported,
        });

      } catch (error: any) {
        importResults.push({
          repo: repo.name,
          status: 'error',
          message: error.message,
          imported: 0,
        });
      }

      setResults([...importResults]);
    }

    setImporting(false);
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
          <h1 className="text-4xl font-bold mb-2">Import from GitHub Repos</h1>
          <p className="text-purple-100">
            Add multiple GitHub repository URLs and import data from all of them
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Add New Repo */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Github className="w-6 h-6 mr-2 text-purple-600" />
              Add Repository Source
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="e.g., Historical Documents"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Data URL
                </label>
                <input
                  type="url"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must be a direct URL to a JSON file (use raw.githubusercontent.com for GitHub)
                </p>
              </div>

              <button
                onClick={addRepo}
                disabled={!newRepoUrl || !newRepoName}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Repository
              </button>
            </div>
          </div>

          {/* Repository List */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Repository Sources ({repos.length})
            </h2>

            {repos.length === 0 ? (
              <p className="text-gray-600">No repositories added yet.</p>
            ) : (
              <div className="space-y-3">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{repo.name}</div>
                      <div className="text-sm text-gray-600 font-mono truncate max-w-xl">
                        {repo.url}
                      </div>
                    </div>
                    <button
                      onClick={() => removeRepo(repo.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Import Button */}
          {!importing && results.length === 0 && repos.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Download className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Import
              </h3>
              <p className="text-gray-600 mb-6">
                Import data from {repos.length} repositor{repos.length === 1 ? 'y' : 'ies'}
              </p>
              <button
                onClick={importFromRepos}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Start Import
              </button>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Loader className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Importing...
              </h3>
              <p className="text-gray-600">
                Processed {results.length} of {repos.length} repositories
              </p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && !importing && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Import Results</h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      result.status === 'success'
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'bg-red-50 border-l-4 border-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{result.repo}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                      </div>
                    </div>
                    {result.imported > 0 && (
                      <div className="text-sm font-bold text-green-700">
                        +{result.imported}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <Link
                  href="/storytellers"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all text-center"
                >
                  View Storytellers
                </Link>
                <button
                  onClick={() => {
                    setResults([]);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Import More
                </button>
              </div>
            </div>
          )}

          {/* Help */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">How to Use</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Add JSON data URLs from GitHub repositories</li>
              <li>• Data should be an array of objects with name/id fields</li>
              <li>• System automatically detects storytellers and imports them</li>
              <li>• Transcripts in metadata are imported as stories</li>
              <li>• Duplicates are skipped (matched by external_id)</li>
            </ul>

            <div className="mt-4 p-3 bg-white rounded border border-blue-300">
              <p className="text-xs text-gray-600 font-mono break-all">
                Example URL:<br />
                https://raw.githubusercontent.com/user/repo/main/data.json
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
