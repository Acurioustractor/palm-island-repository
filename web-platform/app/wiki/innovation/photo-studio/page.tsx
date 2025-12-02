'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Camera, Heart, Users, Shield, Lightbulb, Award, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export default function PhotoStudioPage() {
  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Innovation', href: '/wiki/innovation' },
    { label: 'Photo Studio', href: '/wiki/innovation/photo-studio' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-10 w-10 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Palm Island Photo Studio
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">
          Beautiful, dignified photography celebrating community members
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 font-medium">
            Status: Active
          </span>
          <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg border border-purple-300 font-medium">
            Year Started: 2024
          </span>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-medium">
            Impact: Dignity & Representation
          </span>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="h-6 w-6 text-purple-600" />
          Vision
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          The Palm Island Photo Studio creates beautiful, dignified photography that celebrates
          community members and challenges deficit narratives. Every photo is taken with cultural
          protocols, respect, and the goal of showcasing the strength, beauty, and humanity of
          Palm Island people.
        </p>
        <p className="text-gray-600">
          This isn't extractive photography or disaster tourism - it's community-controlled visual
          storytelling that centers dignity, consent, and positive representation. Photos are owned
          by community members and used to support their stories, applications, and celebrations.
        </p>
      </div>

      {/* The Problem We're Solving */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-purple-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Why This Matters</h2>
        </div>
        <div className="p-6">
          <div className="bg-rose-50 border-l-4 border-rose-400 p-6 mb-6">
            <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">📸</span>
              The Deficit Narrative Problem
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              Historically, photography of Indigenous communities has focused on deficits, problems,
              and crises. Palm Island is often represented through images of poverty, disadvantage,
              or historical trauma. This shapes how the world sees the community - and how community
              members see themselves.
            </p>
            <p className="text-gray-700 text-sm">
              These images are often taken without proper consent, used without permission, and
              controlled by external media organizations. Community members have little say in how
              they're represented.
            </p>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-6">
            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              The Photo Studio Solution
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              The Photo Studio flips this narrative. We create beautiful, professional photography
              that celebrates strength, resilience, culture, and everyday life. Photos showcase
              community members in dignified, positive ways.
            </p>
            <p className="text-gray-700 text-sm">
              All photos are taken with full consent, cultural protocols are followed, and community
              members control how their images are used. This is community-controlled representation.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Camera className="h-6 w-6 text-purple-600" />
          How the Photo Studio Works
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border border-purple-300">
                <span className="text-purple-700 font-bold">1</span>
              </div>
              <h3 className="font-bold text-purple-900">Professional Setup</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Professional lighting, backdrop, and camera equipment create studio-quality photos.
              Same equipment used in commercial photography studios, ensuring community members
              receive the same quality as anyone else would pay for.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-300">
                <span className="text-blue-700 font-bold">2</span>
              </div>
              <h3 className="font-bold text-blue-900">Cultural Protocols</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Before any photo is taken, cultural protocols are explained and consent is obtained.
              Community members decide what they wear, how they're posed, and what the photo
              represents. Photos of elders or cultural activities follow additional protocols.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-300">
                <span className="text-emerald-700 font-bold">3</span>
              </div>
              <h3 className="font-bold text-emerald-900">Immediate Access</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Photos are provided immediately to community members - no waiting weeks for prints.
              High-resolution digital copies are given on USB or via email, allowing people to use
              photos for job applications, resumes, social media, or family celebrations.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-300">
                <span className="text-amber-700 font-bold">4</span>
              </div>
              <h3 className="font-bold text-amber-900">Community Control</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Photos are stored in community-controlled infrastructure with strict privacy controls.
              Community members decide if photos can be used in stories, reports, or public materials.
              No photos are used without explicit permission.
            </p>
          </div>
        </div>
      </div>

      {/* Innovation Elements */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-600" />
            What Makes This Innovative
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Cultural Safety by Design</h3>
              <p className="text-sm text-gray-600">
                Cultural protocols aren't an afterthought - they're built into every step of the
                process. From consent forms that explain photo use to permission management systems
                that let people control their images, cultural safety is embedded in the technology.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Heart className="h-6 w-6 text-rose-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Dignity-Centered Design</h3>
              <p className="text-sm text-gray-600">
                Every aspect is designed to honor dignity - from professional lighting that makes
                people look their best, to immediate access so people don't feel they're "begging"
                for their own photos, to high-resolution files that work for any purpose.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Users className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Community Ownership Model</h3>
              <p className="text-sm text-gray-600">
                Photos are owned by community members, not PICC or external organizations. This
                reverses the typical power dynamic where organizations own images of community
                members. People control their own representation.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Award className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Professional Quality</h3>
              <p className="text-sm text-gray-600">
                No compromises on quality. Using the same equipment, techniques, and standards as
                commercial studios. Community members deserve the same quality photography as anyone
                who can afford to pay for professional photos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-World Impact</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl mb-3">💼</div>
            <h3 className="font-bold text-blue-900 mb-2">Job Applications</h3>
            <p className="text-sm text-gray-700">
              Professional headshots for resumes and LinkedIn profiles, helping community members
              present themselves professionally in job applications.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <div className="text-3xl mb-3">📖</div>
            <h3 className="font-bold text-purple-900 mb-2">Story Documentation</h3>
            <p className="text-sm text-gray-700">
              Beautiful photos to accompany community stories, showing storytellers in dignified,
              positive ways that honor their contributions.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
            <div className="text-3xl mb-3">🎉</div>
            <h3 className="font-bold text-emerald-900 mb-2">Celebrations</h3>
            <p className="text-sm text-gray-700">
              Family photos for birthdays, graduations, and achievements. Creating positive visual
              memories that families can treasure.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
            <div className="text-3xl mb-3">👴</div>
            <h3 className="font-bold text-amber-900 mb-2">Elder Portraits</h3>
            <p className="text-sm text-gray-700">
              Honoring elders with dignified portraits that can be used in cultural materials,
              memorial services, and family archives.
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-200">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold text-rose-900 mb-2">Social Media</h3>
            <p className="text-sm text-gray-700">
              Profile pictures for Facebook, Instagram, and other platforms, helping community
              members control their online representation.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="font-bold text-indigo-900 mb-2">Staff Profiles</h3>
            <p className="text-sm text-gray-700">
              Professional photos for PICC staff members to use on the website, in reports, and
              in public communications.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Infrastructure */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Infrastructure</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <p className="text-gray-700">
              <strong>Photo Upload System:</strong> Web interface for uploading photos to community
              database with automatic metadata extraction and permission tracking
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <p className="text-gray-700">
              <strong>Permission Management:</strong> Digital consent forms and access controls
              ensuring photos are only used with explicit permission
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <p className="text-gray-700">
              <strong>Supabase Storage:</strong> Cloud-based storage with local backup ensuring
              photos are never lost while maintaining community control
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <p className="text-gray-700">
              <strong>AI-Ready Architecture:</strong> Infrastructure prepared for future face
              recognition and automated tagging (only with community consent and control)
            </p>
          </div>
        </div>
      </div>

      {/* Links to Related Pages */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/media/upload"
          className="block p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-bold text-purple-900 mb-2 group-hover:text-purple-700">
            Upload Photos
          </h3>
          <p className="text-sm text-gray-700">
            Upload photos to the system
          </p>
        </Link>
        <Link
          href="/wiki/achievements"
          className="block p-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Award className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-900 mb-2 group-hover:text-blue-700">
            Achievements
          </h3>
          <p className="text-sm text-gray-700">
            See how photos support success stories
          </p>
        </Link>
        <Link
          href="/wiki/innovation"
          className="block p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Lightbulb className="h-8 w-8 text-amber-600 mb-2" />
          <h3 className="font-bold text-amber-900 mb-2 group-hover:text-amber-700">
            All Innovation Projects
          </h3>
          <p className="text-sm text-gray-700">
            See other PICC innovations
          </p>
        </Link>
      </div>
    </div>
  );
}
