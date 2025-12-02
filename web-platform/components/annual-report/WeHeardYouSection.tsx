'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, CheckCircle, Clock, AlertCircle,
  ChevronDown, Users, DollarSign, ArrowRight,
  Heart, Sparkles
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  theme: string;
  quotes: string[];
  mentionedBy: number;
  priority: 'high' | 'medium' | 'low';
  response: string;
  outcome?: string;
  investment?: number;
  status: 'completed' | 'in_progress' | 'planned';
  category?: string;
}

interface WeHeardYouSectionProps {
  items: FeedbackItem[];
  year: number;
  title?: string;
  description?: string;
}

export function WeHeardYouSection({
  items,
  year,
  title = 'We Heard You',
  description = 'Your voice shapes our community. Here\'s what you told us and how we responded.',
}: WeHeardYouSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const stats = {
    total: items.length,
    completed: items.filter((i) => i.status === 'completed').length,
    inProgress: items.filter((i) => i.status === 'in_progress').length,
    totalInvestment: items.reduce((sum, i) => sum + (i.investment || 0), 0),
  };

  const statusConfig = {
    completed: {
      label: 'Addressed',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
    },
    in_progress: {
      label: 'In Progress',
      color: 'bg-blue-100 text-blue-700',
      icon: Clock,
    },
    planned: {
      label: 'Planned',
      color: 'bg-amber-100 text-amber-700',
      icon: AlertCircle,
    },
  };

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
  };

  return (
    <div className="bg-gradient-to-b from-purple-50 to-indigo-50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
            <p className="text-purple-100 mt-1">{description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm text-purple-100">Issues Raised</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.completed}</div>
            <div className="text-sm text-purple-100">Fully Addressed</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <div className="text-sm text-purple-100">In Progress</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">
              ${(stats.totalInvestment / 1000).toFixed(0)}k
            </div>
            <div className="text-sm text-purple-100">Invested</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 border-b border-purple-100 bg-white/50 flex flex-wrap gap-2">
        {['all', 'completed', 'in_progress', 'planned'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-purple-100'
            }`}
          >
            {status === 'all' ? 'All Feedback' : statusConfig[status as keyof typeof statusConfig]?.label}
          </button>
        ))}
      </div>

      {/* Feedback Items */}
      <div className="p-4 md:p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const status = statusConfig[item.status];
            const StatusIcon = status.icon;
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${priorityColors[item.priority]} overflow-hidden`}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${status.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        {item.category && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {item.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.mentionedBy} community members
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        &ldquo;{item.theme}&rdquo;
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-6 pb-6 pt-2">
                        {/* Quotes */}
                        {item.quotes.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              What You Said
                            </h4>
                            <div className="space-y-2">
                              {item.quotes.map((quote, i) => (
                                <blockquote
                                  key={i}
                                  className="pl-4 border-l-2 border-purple-300 text-gray-600 italic"
                                >
                                  &ldquo;{quote}&rdquo;
                                </blockquote>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Response */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            Our Response
                          </h4>
                          <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">
                            {item.response}
                          </p>
                        </div>

                        {/* Outcome & Investment */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {item.outcome && (
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Outcome
                              </h4>
                              <p className="text-green-700 text-sm">{item.outcome}</p>
                            </div>
                          )}

                          {item.investment && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Investment
                              </h4>
                              <p className="text-2xl font-bold text-blue-700">
                                ${item.investment.toLocaleString()}
                              </p>
                              <p className="text-blue-600 text-sm">committed to this initiative</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No feedback items match your filter</p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="p-6 bg-white border-t border-purple-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Your Voice Matters</h3>
            <p className="text-sm text-gray-600">
              Join our next community conversation and help shape our future
            </p>
          </div>
          <a
            href="/share-voice"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Share Your Voice
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default WeHeardYouSection;
