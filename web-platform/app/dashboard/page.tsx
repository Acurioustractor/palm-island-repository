'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Server, Users, Heart, Mic, Image, MapPin, TrendingUp, Wifi, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  summary?: string;
  story_category: string;
  created_at: string;
  storyteller?: {
    full_name: string;
    preferred_name: string;
  };
}

export default function StoryServerDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [storiesCount, setStoriesCount] = useState(0);
  const [recentStoriesData, setRecentStoriesData] = useState<Story[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    async function fetchStories() {
      try {
        const supabase = createClient();

        // Get total count
        const { count } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true });

        // Get recent stories with storyteller info
        const { data: stories } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            summary,
            story_category,
            created_at,
            storyteller:storyteller_id (
              full_name,
              preferred_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setStoriesCount(count || 0);
        setRecentStoriesData(stories || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setLoading(false);
      }
    }

    fetchStories();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStories, 30000);
    return () => clearInterval(interval);
  }, []);

  const kioskStats = {
    totalStories: storiesCount,
    photosShared: 0, // Will track when photo upload implemented
    youthInvolved: 23,
    communityMembers: 156,
    serverUptime: "99.7%",
    dataOwnership: "100% Community Controlled"
  };

  // Map emotion based on category
  const getEmotion = (category: string) => {
    const emotionMap: Record<string, string> = {
      mens_health: "Hope & Aspiration",
      elder_care: "Connection & Belonging",
      community: "Transformative Resilience",
      health: "Pride & Achievement",
      culture: "Connection & Belonging",
      housing: "Transformative Resilience",
      justice: "Pride & Achievement",
      environment: "Transformative Resilience"
    };
    return emotionMap[category] || "Community Spirit";
  };

  // Transform real data for display
  const recentStories = recentStoriesData.map((story: any) => ({
    id: story.id,
    type: "text",
    author: story.storyteller?.preferred_name || story.storyteller?.full_name || "Community Voice",
    title: story.title,
    location: "Palm Island",
    emotion: getEmotion(story.story_category),
    timestamp: new Date(story.created_at).toLocaleDateString()
  }));

  const youthTechSkills = [
    { skill: "Server Building", participants: 8, level: "Advanced" },
    { skill: "Web Development", participants: 12, level: "Intermediate" },
    { skill: "Digital Storytelling", participants: 23, level: "All Levels" },
    { skill: "Data Management", participants: 6, level: "Advanced" }
  ];

  const communityImpact = [
    { metric: "Stories Collected", value: kioskStats.totalStories, change: "+31 imported" },
    { metric: "Youth Employed", value: 23, change: "+35%" },
    { metric: "Skills Certificates", value: 31, change: "+67%" },
    { metric: "PICC Staff", value: 197, change: "+30% from 2023" }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Server },
    { id: 'kiosk', label: 'Story Collection', icon: Camera },
    { id: 'stories', label: 'Community Stories', icon: Heart },
    { id: 'youth', label: 'Youth Tech Hub', icon: Users },
    { id: 'impact', label: 'Community Impact', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Palm Island Story Server</h1>
            <p className="text-gray-600">Community-Driven Impact Measurement & Storytelling</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/stories/submit"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Share Your Story</span>
            </Link>
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-medium">Live & Community-Controlled</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Object.entries(kioskStats).map(([key, value], index) => (
            <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-800">{value}</div>
              <div className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content Views */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeView === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Community-Owned Digital Infrastructure</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">The Vision</h3>
                <p className="mb-4">
                  A community-built platform where Palm Islanders share their stories, creating a living
                  archive of resilience, growth, and connection. From storm stories to service innovations,
                  every voice matters.
                </p>
                <div className="flex items-center space-x-4 text-blue-100">
                  <Camera className="w-5 h-5" />
                  <Server className="w-5 h-5" />
                  <Heart className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Key Principles</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Data Sovereignty:</strong> Community owns all content</li>
                  <li>• <strong>Youth Leadership:</strong> Built by young Palm Islanders</li>
                  <li>• <strong>Cultural Pride:</strong> Celebrates Manbarra & Bwgcolman stories</li>
                  <li>• <strong>Global Innovation:</strong> Shows the world our capabilities</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-800">197</div>
                <div className="text-sm text-gray-600">PICC Staff Members</div>
                <div className="text-xs text-green-600">+30% from last year</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-800">80%+</div>
                <div className="text-sm text-gray-600">Aboriginal Staff</div>
                <div className="text-xs text-purple-600">Community-controlled</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-800">16+</div>
                <div className="text-sm text-gray-600">Services Provided</div>
                <div className="text-xs text-orange-600">Growing annually</div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'kiosk' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Story Collection Hub</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="bg-blue-900 text-white p-6 rounded-lg mb-4">
                  <h3 className="text-lg font-bold mb-2">Share Your Story</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`w-full p-3 rounded-lg font-medium transition-all ${
                        isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {isRecording ? <Mic className="w-4 h-4 animate-pulse" /> : <Camera className="w-4 h-4" />}
                        <span>{isRecording ? 'Recording Story...' : 'Start Recording'}</span>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition-all">
                        <Image className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Upload Photo</div>
                      </button>
                      <button className="p-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition-all">
                        <Mic className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Record Audio</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Future Kiosk Locations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>Community Centre - Main location</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>Bwgcolman Healing Service</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>Youth Service Centre</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Recent Stories</h4>
                <div className="space-y-3">
                  {recentStories.map(story => (
                    <div key={story.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-blue-800">{story.title}</div>
                          <div className="text-sm text-gray-600">by {story.author} • {story.location}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full">{story.emotion}</span>
                            <span className="ml-2">{story.timestamp}</span>
                          </div>
                        </div>
                        <div className="text-blue-500">
                          {story.type === 'photo' && <Image className="w-4 h-4" />}
                          {story.type === 'audio' && <Mic className="w-4 h-4" />}
                          {story.type === 'text' && <Server className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'stories' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Community Stories Archive</h2>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-purple-800 mb-2">Story Themes</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">Hope & Aspiration</div>
                  <div className="text-sm text-gray-600">Youth dreams, career paths, cultural leadership</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Pride & Achievement</div>
                  <div className="text-sm text-gray-600">PICC growth, service excellence, innovation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">Connection & Belonging</div>
                  <div className="text-sm text-gray-600">"No place like home", family bonds, community</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Resilience & Growth</div>
                  <div className="text-sm text-gray-600">Storm recovery, cultural innovation, leadership</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Featured: Storm Stories (26 total)</h4>
                <p className="text-sm text-gray-700 mb-3">
                  February 2024 floods documented through community voices. Stories from Men's Group,
                  Elders, Playgroup staff, and individuals showing resilience in face of unprecedented weather.
                </p>
                <div className="text-xs text-blue-600">Category: Storm Recovery • Evidence for advocacy</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold mb-3">Featured: Community Control Achievement</h4>
                <p className="text-sm text-gray-700 mb-3">
                  "After years of lobbying, PICC achieved full community control in 2021. From 1 employee
                  to 197, from government control to community ownership - this is self-determination in action."
                </p>
                <div className="text-xs text-green-600">Contributed by: Rachel Atkinson, CEO</div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'youth' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Youth Tech Hub</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Building the Future</h3>
                <p className="mb-4">
                  23 young Palm Islanders are learning advanced technical skills while building and
                  maintaining the community's story server infrastructure.
                </p>
                <div className="text-orange-100">
                  From server hardware to web development, our youth are creating technology solutions for the community.
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-3">Skills Development Programs</h3>
                <div className="space-y-3">
                  {youthTechSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{skill.skill}</div>
                        <div className="text-sm text-gray-600">{skill.participants} participants</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        skill.level === 'Advanced' ? 'bg-green-100 text-green-700' :
                        skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {skill.level}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Success Story: Certificate III Graduates</h3>
              <p className="text-gray-700 mb-3">
                "Among our recent graduating cohort of trainees in Community Services, all of them express
                their desire to work for 'the Company'. This sentiment is a testament to how valued and
                effective PICC is perceived within the community."
              </p>
              <div className="text-sm text-yellow-700">— Rachel Atkinson, CEO | Annual Report 2023-24</div>
            </div>
          </div>
        )}

        {activeView === 'impact' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Community Impact Dashboard</h2>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {communityImpact.map((metric, index) => (
                <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.metric}</div>
                  <div className="text-xs text-green-600 font-medium">{metric.change}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-teal-800 mb-3">PICC Growth Journey</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>2007: Started with 1 employee</span>
                    <span className="font-medium">CEO Rachel Atkinson</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2021: Full community control</span>
                    <span className="font-medium">Historic milestone</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2023: 151 staff members</span>
                    <span className="font-medium">+30% growth</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2024: 197 staff members</span>
                    <span className="font-medium">Record high</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local employment:</span>
                    <span className="font-medium">70%+ live on Palm Island</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-purple-800 mb-3">Platform Innovation</h3>
                <p className="text-sm text-gray-700 mb-3">
                  The Story Server project positions Palm Island as a leader in community-controlled
                  digital infrastructure, demonstrating that remote communities can build cutting-edge
                  technology solutions.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cost savings:</span>
                    <span className="font-medium">$40k-115k annually</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Youth employed:</span>
                    <span className="font-medium">23 in tech roles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data sovereignty:</span>
                    <span className="font-medium">100% community owned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-600 text-sm">
        <p>Built by Palm Island youth • Data sovereignty maintained • Stories owned by community</p>
        <p className="mt-1">Palm Island Community Company • Manbarra & Bwgcolman Country</p>
      </div>
    </div>
  );
}
