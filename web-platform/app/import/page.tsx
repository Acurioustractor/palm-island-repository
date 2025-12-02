'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UserPlus,
  FileText,
  Upload,
  Image,
  Mic,
  FolderPlus,
  Database
} from 'lucide-react';

export default function ImportHubPage() {
  const importOptions = [
    {
      title: 'Add Storyteller',
      description: 'Add a new community member to the platform',
      icon: UserPlus,
      href: '/storytellers/add',
      color: 'teal',
      available: true
    },
    {
      title: 'Import Transcript',
      description: 'Import an interview transcript or oral history',
      icon: FileText,
      href: '/stories/import-transcript',
      color: 'orange',
      available: true
    },
    {
      title: 'Submit Story',
      description: 'Add a new community story directly',
      icon: Upload,
      href: '/stories/submit',
      color: 'blue',
      available: true
    },
    {
      title: 'Bulk Import People',
      description: 'Import multiple community members from a spreadsheet',
      icon: Database,
      href: '/import/bulk-people',
      color: 'purple',
      available: false,
      comingSoon: true
    },
    {
      title: 'Bulk Import Stories',
      description: 'Import multiple stories or transcripts at once',
      icon: FolderPlus,
      href: '/import/bulk-stories',
      color: 'green',
      available: false,
      comingSoon: true
    },
    {
      title: 'Upload Photos',
      description: 'Upload photos for the community gallery',
      icon: Image,
      href: '/photos/upload',
      color: 'pink',
      available: false,
      comingSoon: true
    },
    {
      title: 'Upload Audio',
      description: 'Upload audio recordings for transcription',
      icon: Mic,
      href: '/audio/upload',
      color: 'indigo',
      available: false,
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Import Content
            </h1>
            <p className="text-gray-600">
              Add people, stories, transcripts, and media to the Palm Island community platform.
            </p>
          </div>
        </div>

        {/* Import Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {importOptions.map((option) => {
            const Icon = option.icon;
            const colorClasses = {
              teal: 'bg-teal-50 border-teal-200 hover:border-teal-400',
              orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
              blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
              purple: 'bg-purple-50 border-purple-200',
              green: 'bg-green-50 border-green-200',
              pink: 'bg-pink-50 border-pink-200',
              indigo: 'bg-indigo-50 border-indigo-200'
            };
            const iconColors = {
              teal: 'text-teal-600',
              orange: 'text-orange-600',
              blue: 'text-blue-600',
              purple: 'text-purple-400',
              green: 'text-green-400',
              pink: 'text-pink-400',
              indigo: 'text-indigo-400'
            };

            if (option.available) {
              return (
                <Link
                  key={option.title}
                  href={option.href}
                  className={`block p-6 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg ${colorClasses[option.color as keyof typeof colorClasses]}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                      <Icon className={`w-8 h-8 ${iconColors[option.color as keyof typeof iconColors]}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {option.title}
                      </h2>
                      <p className="text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            } else {
              return (
                <div
                  key={option.title}
                  className={`block p-6 rounded-xl border-2 opacity-60 cursor-not-allowed ${colorClasses[option.color as keyof typeof colorClasses]}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                      <Icon className={`w-8 h-8 ${iconColors[option.color as keyof typeof iconColors]}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                        {option.title}
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-normal">
                          Coming Soon
                        </span>
                      </h2>
                      <p className="text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tips for Importing Content</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Before Adding People</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure you have their consent</li>
                <li>• Know their preferred name and role</li>
                <li>• Identify which service they're connected to</li>
                <li>• Check if they're an elder or cultural advisor</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Before Importing Transcripts</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add the storyteller to the platform first</li>
                <li>• Review for any sensitive or sacred content</li>
                <li>• Note the recording date and duration</li>
                <li>• Flag content requiring cultural review</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cultural Protocol Reminder */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-800 mb-2">Cultural Protocol Reminder</h3>
          <p className="text-sm text-amber-700">
            All content imported to this platform must follow cultural protocols. Elder stories and traditional
            knowledge require cultural advisor approval before publishing. The community maintains full ownership
            and control over all content.
          </p>
        </div>
      </div>
    </div>
  );
}
