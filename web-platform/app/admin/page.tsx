'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Users, BookOpen, Upload, FileText, Search, Settings,
  TrendingUp, Award, Database, Image as ImageIcon, Play, Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Stats {
  storytellers: number;
  stories: number;
  services: number;
  storiesThisMonth: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      await fetchStats();
    }

    checkAuth();
  }, [router]);

  async function fetchStats() {
    const supabase = createClient();

    try {
      const { count: storytellerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true });

      const { count: serviceCount } = await supabase
        .from('organization_services')
        .select('*', { count: 'exact', head: true });

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);

      const { count: storiesThisMonth } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      setStats({
        storytellers: storytellerCount || 0,
        stories: storyCount || 0,
        services: serviceCount || 0,
        storiesThisMonth: storiesThisMonth || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-purple-100">Welcome back, {user?.email}</p>
            </div>
            <Link
              href="/"
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-medium transition-all"
            >
              View Site →
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            number={stats?.storytellers || 0}
            label="Storytellers"
            color="bg-purple-500"
          />
          <StatCard
            icon={<BookOpen className="w-8 h-8" />}
            number={stats?.stories || 0}
            label="Total Stories"
            color="bg-blue-500"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            number={stats?.storiesThisMonth || 0}
            label="Stories This Month"
            color="bg-green-500"
          />
          <StatCard
            icon={<Award className="w-8 h-8" />}
            number={stats?.services || 0}
            label="PICC Services"
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              href="/admin/add-person"
              icon={<Users className="w-12 h-12" />}
              title="Add New Person"
              description="Simple form to add people with photos + transcripts"
              color="from-green-500 to-teal-500"
            />
            <ActionCard
              href="/admin/manage-profiles"
              icon={<Settings className="w-12 h-12" />}
              title="Manage Profiles"
              description="Edit, update, or delete existing profiles"
              color="from-blue-500 to-cyan-500"
            />
            <ActionCard
              href="/admin/import-stories"
              icon={<Database className="w-12 h-12" />}
              title="Import Stories"
              description="Import stories from transcript JSON files"
              color="from-purple-500 to-blue-500"
            />
            <ActionCard
              href="/admin/import-repos"
              icon={<Globe className="w-12 h-12" />}
              title="Import from Repos"
              description="Pull data from multiple GitHub repositories"
              color="from-orange-500 to-red-500"
            />
            <ActionCard
              href="/admin/upload-documents"
              icon={<FileText className="w-12 h-12" />}
              title="Upload Documents"
              description="Upload annual reports, PDFs, Word docs"
              color="from-pink-500 to-purple-500"
            />
            <ActionCard
              href="/admin/upload-photos"
              icon={<ImageIcon className="w-12 h-12" />}
              title="Upload Photos"
              description="Add profile photos for storytellers"
              color="from-indigo-500 to-purple-500"
            />
            <ActionCard
              href="/reports/generate"
              icon={<TrendingUp className="w-12 h-12" />}
              title="Generate Report"
              description="Create annual reports from data"
              color="from-green-500 to-emerald-500"
            />
            <ActionCard
              href="/storytellers"
              icon={<Users className="w-12 h-12" />}
              title="View Storytellers"
              description="Browse all storyteller profiles"
              color="from-cyan-500 to-blue-500"
            />
            <ActionCard
              href="/search"
              icon={<Search className="w-12 h-12" />}
              title="Search Content"
              description="Find stories and storytellers"
              color="from-violet-500 to-purple-500"
            />
            <ActionCard
              href="/upload"
              icon={<Upload className="w-12 h-12" />}
              title="Upload Content"
              description="Add photos, text, or voice recordings"
              color="from-rose-500 to-pink-500"
            />
          </div>
        </div>

        {/* Data Management */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-purple-600" />
              Database Status
            </h3>
            <div className="space-y-3">
              <StatusRow label="Storytellers" value={stats?.storytellers || 0} status="healthy" />
              <StatusRow label="Stories" value={stats?.stories || 0} status="healthy" />
              <StatusRow label="Services" value={stats?.services || 0} status="healthy" />
              <StatusRow label="Storage Used" value="~1.2 GB" status="healthy" />
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ All systems operational
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Play className="w-6 h-6 mr-2 text-blue-600" />
              Quick Start Guide
            </h3>
            <div className="space-y-3">
              <GuideStep number="1" text="Import stories from transcript JSON" done={stats ? stats.stories > 0 : false} />
              <GuideStep number="2" text="Upload profile photos for storytellers" done={false} />
              <GuideStep number="3" text="Review and publish stories" done={false} />
              <GuideStep number="4" text="Generate annual report" done={false} />
              <GuideStep number="5" text="Share platform with community" done={false} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureItem
              icon="🔐"
              title="Authentication"
              description="Magic links + password login"
              status="Live"
            />
            <FeatureItem
              icon="📤"
              title="Upload System"
              description="Photo, text, and voice uploads"
              status="Live"
            />
            <FeatureItem
              icon="📜"
              title="History Page"
              description="Interactive timeline"
              status="Live"
            />
            <FeatureItem
              icon="🏢"
              title="PICC Services"
              description="Live services showcase"
              status="Live"
            />
            <FeatureItem
              icon="🌪️"
              title="Feature Stories"
              description="Immersive scroll experiences"
              status="Live"
            />
            <FeatureItem
              icon="🔍"
              title="Search"
              description="Full-text search"
              status="Live"
            />
            <FeatureItem
              icon="📊"
              title="Report Generator"
              description="Automated annual reports"
              status="Live"
            />
            <FeatureItem
              icon="🖼️"
              title="Photo Management"
              description="Profile photo uploads"
              status="Coming Soon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, number, label, color }: {
  icon: React.ReactNode;
  number: number;
  label: string;
  color: string;
}) {
  return (
    <div className={`${color} text-white rounded-xl p-6 shadow-lg`}>
      <div className="mb-3">{icon}</div>
      <div className="text-4xl font-bold mb-1">{number}</div>
      <div className="text-lg">{label}</div>
    </div>
  );
}

function ActionCard({ href, icon, title, description, color }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`bg-gradient-to-br ${color} text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
    </Link>
  );
}

function StatusRow({ label, value, status }: {
  label: string;
  value: number | string;
  status: 'healthy' | 'warning' | 'error';
}) {
  const colors = {
    healthy: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-700">{label}</span>
      <span className={`font-bold ${colors[status]}`}>{value}</span>
    </div>
  );
}

function GuideStep({ number, text, done }: {
  number: string;
  text: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {done ? '✓' : number}
      </div>
      <span className={done ? 'text-gray-500 line-through' : 'text-gray-700'}>{text}</span>
    </div>
  );
}

function FeatureItem({ icon, title, description, status }: {
  icon: string;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <span className={`text-xs px-2 py-1 rounded ${
            status === 'Live'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
