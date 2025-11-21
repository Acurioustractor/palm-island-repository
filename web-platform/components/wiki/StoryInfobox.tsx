'use client';

import React from 'react';
import Link from 'next/link';
import {
  User, Calendar, MapPin, Tag, Heart, Eye,
  Users as UsersIcon, Building, TrendingUp, Shield
} from 'lucide-react';

interface InfoboxData {
  storyteller?: {
    id: string;
    name: string;
    preferred_name?: string;
    profile_image_url?: string;
  };
  date_shared: string;
  story_date?: string;
  location?: string;
  categories: string[];
  topics?: string[];
  people_involved?: Array<{ id: string; name: string; role?: string }>;
  organizations?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string; color?: string }>;
  impact_areas?: string[];
  people_affected?: number;
  views?: number;
  shares?: number;
  cultural_sensitivity?: 'low' | 'medium' | 'high' | 'restricted';
  access_level: 'public' | 'community' | 'restricted';
  elder_approved?: boolean;
  media_count?: {
    photos?: number;
    videos?: number;
    audio?: number;
  };
}

interface StoryInfoboxProps {
  data: InfoboxData;
  className?: string;
}

export function StoryInfobox({ data, className = '' }: StoryInfoboxProps) {
  const getSensitivityBadge = (level?: string) => {
    const badges = {
      low: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'General Content' },
      medium: { color: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Cultural Awareness' },
      high: { color: 'bg-orange-50 text-orange-700 border border-orange-200', label: 'Cultural Sensitive' },
      restricted: { color: 'bg-rose-50 text-rose-700 border border-rose-200', label: 'Restricted' },
    };
    return badges[level as keyof typeof badges] || badges.low;
  };

  const getAccessBadge = (level: string) => {
    const badges = {
      public: { color: 'bg-sky-50 text-sky-700 border border-sky-200', label: 'Public' },
      community: { color: 'bg-violet-50 text-violet-700 border border-violet-200', label: 'Community Only' },
      restricted: { color: 'bg-rose-50 text-rose-700 border border-rose-200', label: 'Restricted' },
    };
    return badges[level as keyof typeof badges] || badges.public;
  };

  const sensitivity = getSensitivityBadge(data.cultural_sensitivity);
  const access = getAccessBadge(data.access_level);

  return (
    <div className={`bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200 px-4 py-3">
        <h3 className="text-stone-800 font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Story Information
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Storyteller */}
        {data.storyteller && (
          <div className="flex items-start gap-3 pb-3 border-b border-stone-200">
            {data.storyteller.profile_image_url ? (
              <img
                src={data.storyteller.profile_image_url}
                alt={data.storyteller.preferred_name || data.storyteller.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-stone-300"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-stone-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm">
                {(data.storyteller.preferred_name || data.storyteller.name)
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                Shared by
              </div>
              <Link
                href={`/wiki/people/${data.storyteller.id}`}
                className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline block truncate"
              >
                {data.storyteller.preferred_name || data.storyteller.name}
              </Link>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">Shared</div>
              <div className="text-sm text-gray-900">
                {new Date(data.date_shared).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {data.story_date && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600">Story Date</div>
                <div className="text-sm text-gray-900">
                  {new Date(data.story_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        {data.location && (
          <div className="flex items-start gap-2 pt-2 border-t border-stone-200">
            <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">Location</div>
              <Link
                href={`/wiki/places?location=${encodeURIComponent(data.location)}`}
                className="text-sm text-amber-700 hover:text-amber-900 hover:underline"
              >
                {data.location}
              </Link>
            </div>
          </div>
        )}

        {/* Categories */}
        {data.categories.length > 0 && (
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Categories
            </div>
            <div className="flex flex-wrap gap-1">
              {data.categories.map((category) => (
                <Link
                  key={category}
                  href={`/wiki/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded border border-stone-300 hover:bg-stone-200 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {data.services && data.services.length > 0 && (
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <Building className="h-3 w-3" />
              Services
            </div>
            <div className="flex flex-wrap gap-1">
              {data.services.map((service) => (
                <Link
                  key={service.id}
                  href={`/wiki/services/${service.id}`}
                  className="text-xs text-white px-2 py-1 rounded hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: service.color || '#3B82F6' }}
                >
                  {service.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* People Involved */}
        {data.people_involved && data.people_involved.length > 0 && (
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <UsersIcon className="h-3 w-3" />
              People Involved
            </div>
            <div className="space-y-1">
              {data.people_involved.map((person) => (
                <div key={person.id} className="text-sm">
                  <Link
                    href={`/wiki/people/${person.id}`}
                    className="text-amber-700 hover:text-amber-900 hover:underline"
                  >
                    {person.name}
                  </Link>
                  {person.role && (
                    <span className="text-gray-600 text-xs ml-1">({person.role})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact */}
        {(data.people_affected || data.impact_areas) && (
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Impact
            </div>
            {data.people_affected && (
              <div className="text-sm text-gray-900 mb-1">
                <span className="font-semibold">{data.people_affected}</span> people affected
              </div>
            )}
            {data.impact_areas && data.impact_areas.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.impact_areas.map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Engagement Stats */}
        {(data.views || data.shares) && (
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Engagement
            </div>
            <div className="flex gap-4 text-sm text-gray-900">
              {data.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{data.views.toLocaleString()}</span>
                  <span className="text-xs text-gray-600">views</span>
                </div>
              )}
              {data.shares !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{data.shares}</span>
                  <span className="text-xs text-gray-600">shares</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Count */}
        {data.media_count && (
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs text-gray-600 mb-2">Media</div>
            <div className="flex gap-3 text-sm text-gray-900">
              {data.media_count.photos && data.media_count.photos > 0 && (
                <div>
                  📸 <span className="font-medium">{data.media_count.photos}</span>
                </div>
              )}
              {data.media_count.videos && data.media_count.videos > 0 && (
                <div>
                  🎥 <span className="font-medium">{data.media_count.videos}</span>
                </div>
              )}
              {data.media_count.audio && data.media_count.audio > 0 && (
                <div>
                  🎵 <span className="font-medium">{data.media_count.audio}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cultural & Access Info */}
        <div className="pt-2 border-t border-stone-200 space-y-2">
          <div>
            <div className="text-xs text-gray-600 mb-1">Cultural Sensitivity</div>
            <span className={`text-xs px-2 py-1 rounded ${sensitivity.color}`}>
              {sensitivity.label}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Access Level</div>
            <span className={`text-xs px-2 py-1 rounded ${access.color}`}>
              {access.label}
            </span>
          </div>
          {data.elder_approved && (
            <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
              <Shield className="h-3 w-3" />
              Elder Approved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryInfobox;
