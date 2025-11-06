'use client';

import React from 'react';
import Link from 'next/link';
import SemanticSearch from '@/components/ai/SemanticSearch';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';

export default function SemanticSearchPage() {
  return (
    
      <div className="min-h-screen">
        {/* Navigation */}
        <div className="bg-white shadow-md">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <Link
              href="/research"
              className="flex items-center text-coral-warm hover:text-ocean-medium font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Research Tools
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-12">
          <div className="max-w-5xl mx-auto px-8">
            <div className="flex items-center gap-4 mb-4">
              <Sparkles className="w-12 h-12 text-coral-warm" />
              <h1 className="text-4xl md:text-5xl font-bold">Semantic Search</h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl">
              Search the archive using natural language. Ask questions, describe what you're looking for,
              and find content by meaning instead of just keywords.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Info Card */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-ocean-deep mb-2">How Semantic Search Works</h3>
                <p className="text-earth-dark text-sm mb-3">
                  Unlike traditional keyword search, semantic search understands the meaning of your query.
                  It finds relevant content even if the exact words don't match.
                </p>
                <div className="space-y-1 text-sm text-earth-dark">
                  <p><strong>Example:</strong> Searching for "traditional food preparation" will also find stories about "cooking bush tucker" or "making damper"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Component */}
          <div className="card-modern p-8 mb-8">
            <SemanticSearch />
          </div>

          {/* Tips */}
          <div className="card-modern p-6">
            <h3 className="font-bold text-ocean-deep mb-4">Search Tips</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-ocean-medium mb-2">✓ Good queries:</h4>
                <ul className="space-y-1 text-earth-dark">
                  <li>• "Stories about cyclone experiences"</li>
                  <li>• "Traditional fishing methods"</li>
                  <li>• "Community leadership and governance"</li>
                  <li>• "Health and wellbeing challenges"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-ocean-medium mb-2">Tips for better results:</h4>
                <ul className="space-y-1 text-earth-dark">
                  <li>• Be descriptive and specific</li>
                  <li>• Use natural language (complete sentences work well)</li>
                  <li>• Try different phrasings if results aren't perfect</li>
                  <li>• Combine multiple concepts in one query</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}
