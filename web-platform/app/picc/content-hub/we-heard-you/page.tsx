'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, Users, TrendingUp } from 'lucide-react';

export default function WeHeardYouPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('community_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link
        href="/picc/content-hub"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Content Hub
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">We Heard You</h1>
        </div>
        <p className="text-gray-600">
          Community feedback turned into action - showing how we respond to what the community tells us
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{insights.length}</div>
          <div className="text-sm text-gray-600">Community Insights</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {insights.filter(i => i.action_taken).length}
          </div>
          <div className="text-sm text-gray-600">Actions Taken</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {insights.filter(i => i.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Insights List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
          <p className="text-gray-600">
            Insights are extracted from community conversations
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  insight.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                  insight.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {insight.insight_category || 'General'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(insight.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-800 mb-3">{insight.insight_text}</p>
              {insight.action_taken && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-medium text-green-800">Action Taken:</p>
                  <p className="text-sm text-green-700">{insight.action_taken}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
