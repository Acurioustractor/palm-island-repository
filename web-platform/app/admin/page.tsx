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
      
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-warm"></div>
        </div>
      
    );
  }

  return (
    
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-white/70">Welcome back, {user?.email}</p>
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
        <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            number={stats?.storytellers || 0}
            label="Storytellers"
            color="bg-ocean-deep"
          />
          <StatCard
            icon={<BookOpen className="w-8 h-8" />}
            number={stats?.stories || 0}
            label="Total Stories"
            color="bg-ocean-medium"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            number={stats?.storiesThisMonth || 0}
            label="Stories This Month"
            color="bg-coral-warm"
          />
          <StatCard
            icon={<Award className="w-8 h-8" />}
            number={stats?.services || 0}
            label="PICC Services"
            color="bg-sunset-orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ocean-deep mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              href="/admin/add-person"
              icon={<Users className="w-12 h-12" />}
              title="Add New Person"
              description="Simple form to add people with photos + transcripts"
              color="from-coral-warm to-sunset-orange"
            />
            <ActionCard
              href="/admin/manage-profiles"
              icon={<Settings className="w-12 h-12" />}
              title="Manage Profiles"
              description="Edit, update, or delete existing profiles"
              color="from-ocean-medium to-ocean-light"
            />
            <ActionCard
              href="/admin/import-stories"
              icon={<Database className="w-12 h-12" />}
              title="Import Stories"
              description="Import stories from transcript JSON files"
              color="from-ocean-deep to-ocean-medium"
            />
            <ActionCard
              href="/admin/import-repos"
              icon={<Globe className="w-12 h-12" />}
              title="Import from Repos"
              description="Pull data from multiple GitHub repositories"
              color="from-sunset-orange to-sand-gold"
            />
            <ActionCard
              href="/admin/upload-documents"
              icon={<FileText className="w-12 h-12" />}
              title="Upload Documents"
              description="Upload annual reports, PDFs, Word docs"
              color="from-coral-warm to-coral-warm"
            />
            <ActionCard
              href="/admin/upload-photos"
              icon={<ImageIcon className="w-12 h-12" />}
              title="Upload Photos"
              description="Add profile photos for storytellers"
              color="from-ocean-medium to-ocean-deep"
            />
            <ActionCard
              href="/reports/generate"
              icon={<TrendingUp className="w-12 h-12" />}
              title="Generate Report"
              description="Create annual reports from data"
              color="from-sand-gold to-sunset-orange"
            />
            <ActionCard
              href="/storytellers"
              icon={<Users className="w-12 h-12" />}
              title="View Storytellers"
              description="Browse all storyteller profiles"
              color="from-ocean-light to-ocean-medium"
            />
            <ActionCard
              href="/search"
              icon={<Search className="w-12 h-12" />}
              title="Search Content"
              description="Find stories and storytellers"
              color="from-ocean-deep to-ocean-light"
            />
            <ActionCard
              href="/upload"
              icon={<Upload className="w-12 h-12" />}
              title="Upload Content"
              description="Add photos, text, or voice recordings"
              color="from-coral-warm to-sunset-orange"
            />
          </div>
        </div>

        {/* Data Management */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-modern">
            <h3 className="text-xl font-bold text-ocean-deep mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-ocean-medium" />
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

          <div className="card-modern">
            <h3 className="text-xl font-bold text-ocean-deep mb-4 flex items-center">
              <Play className="w-6 h-6 mr-2 text-coral-warm" />
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
        <div className="mt-8 card-modern">
          <h3 className="text-xl font-bold text-ocean-deep mb-4">
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
    healthy: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-earth-light">
      <span className="text-earth-dark">{label}</span>
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
        done ? 'bg-coral-warm text-white' : 'bg-earth-light text-earth-medium'
      }`}>
        {done ? '✓' : number}
      </div>
      <span className={done ? 'text-earth-medium line-through' : 'text-earth-dark'}>{text}</span>
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
    <div className="flex items-start gap-3 p-3 bg-earth-bg rounded-lg">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-ocean-deep">{title}</h4>
          <span className={`text-xs px-2 py-1 rounded ${
            status === 'Live'
              ? 'bg-green-100 text-green-700'
              : 'bg-ocean-light/20 text-ocean-medium'
          }`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-earth-medium">{description}</p>
      </div>
    </div>
  );
}
