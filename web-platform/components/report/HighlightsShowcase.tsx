import { Award, TrendingUp, Users, Heart, Star, Lightbulb, Target, Zap } from 'lucide-react';

export interface Highlight {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  impact_achieved: string | null;
  highlight_type: string | null;
  is_featured: boolean;
  display_order: number;
  display_style: string | null;
  metrics: Record<string, any> | null;
}

export interface LeadershipMessage {
  id: string;
  full_name: string;
  position: string;
  leadership_type: string;
  message_title: string | null;
  message_content: string | null;
  message_excerpt: string | null;
  featured_quote: string | null;
  photo_url: string | null;
}

interface HighlightsShowcaseProps {
  highlights: Highlight[];
  leadership: LeadershipMessage[];
}

const ICON_MAP: Record<string, any> = {
  achievement: Award,
  growth: TrendingUp,
  community: Users,
  health: Heart,
  innovation: Lightbulb,
  milestone: Star,
  impact: Target,
  default: Zap,
};

const COLOR_MAP: Record<string, string> = {
  achievement: 'from-amber-400 to-orange-500',
  growth: 'from-green-400 to-emerald-500',
  community: 'from-blue-400 to-indigo-500',
  health: 'from-rose-400 to-pink-500',
  innovation: 'from-purple-400 to-violet-500',
  milestone: 'from-amber-300 to-yellow-500',
  impact: 'from-teal-400 to-cyan-500',
  default: 'from-gray-400 to-gray-500',
};

export default function HighlightsShowcase({ highlights, leadership }: HighlightsShowcaseProps) {
  if (highlights.length === 0 && leadership.length === 0) return null;

  const ceoMessage = leadership.find(l => l.leadership_type === 'executive' && l.position?.toLowerCase().includes('ceo'));
  const chairMessage = leadership.find(l => l.leadership_type === 'board' && (l.position?.toLowerCase().includes('chair') || l.position?.toLowerCase().includes('president')));
  const leaderMessages = [ceoMessage, chairMessage].filter(Boolean) as LeadershipMessage[];

  return (
    <div className="space-y-12">
      {/* Leadership Messages */}
      {leaderMessages.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
          {leaderMessages.map(leader => (
            <div key={leader.id} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                {leader.photo_url ? (
                  <img
                    src={leader.photo_url}
                    alt={leader.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {leader.full_name?.charAt(0) || 'P'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{leader.full_name}</h3>
                  <p className="text-sm text-purple-600 font-medium">{leader.position}</p>
                </div>
              </div>

              {leader.message_title && (
                <h4 className="text-md font-semibold text-gray-800 mb-2">{leader.message_title}</h4>
              )}

              {leader.featured_quote && (
                <blockquote className="text-gray-700 italic border-l-4 border-purple-300 pl-4 mb-4">
                  &ldquo;{leader.featured_quote}&rdquo;
                </blockquote>
              )}

              {leader.message_excerpt && (
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                  {leader.message_excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Highlights Grid */}
      {highlights.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map(highlight => {
            const type = highlight.highlight_type || 'default';
            const Icon = ICON_MAP[type] || ICON_MAP.default;
            const gradient = COLOR_MAP[type] || COLOR_MAP.default;

            return (
              <div
                key={highlight.id}
                className={`bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all ${
                  highlight.is_featured ? 'ring-2 ring-purple-200' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{highlight.title}</h3>

                {highlight.subtitle && (
                  <p className="text-sm text-purple-600 font-medium mb-2">{highlight.subtitle}</p>
                )}

                {highlight.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
                    {highlight.description}
                  </p>
                )}

                {highlight.impact_achieved && (
                  <div className="bg-green-50 rounded-lg px-3 py-2 text-sm text-green-800 font-medium">
                    {highlight.impact_achieved}
                  </div>
                )}

                {highlight.metrics && Object.keys(highlight.metrics).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(highlight.metrics).slice(0, 3).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                      >
                        {key}: <strong>{String(value)}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {highlight.is_featured && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-purple-600 font-medium">
                    <Star className="w-3 h-3" fill="currentColor" />
                    Featured
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
