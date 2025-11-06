import Link from 'next/link';
import { BookOpen, Users, TrendingUp, Search, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

async function getStats() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { storytellers: 26, stories: 0, services: 16 };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count: storytellerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: storyCount} = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    const { count: serviceCount } = await supabase
      .from('organization_services')
      .select('*', { count: 'exact', head: true });

    return {
      storytellers: storytellerCount || 26,
      stories: storyCount || 0,
      services: serviceCount || 16,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { storytellers: 26, stories: 0, services: 16 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Modern Light Design */}
      <div className="hero-modern">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[rgb(var(--primary))] font-semibold text-sm uppercase tracking-wide">
              Community-Controlled Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[rgb(var(--text-primary))]">
            Palm Island Story Server
          </h1>

          <p className="text-2xl md:text-3xl font-medium text-[rgb(var(--text-primary))] mb-4 max-w-3xl">
            Manbarra & Bwgcolman Country
          </p>

          <p className="text-lg text-[rgb(var(--text-secondary))] mb-10 max-w-2xl">
            Preserving our voices, measuring our impact, and maintaining data sovereignty
          </p>

          {/* Search Bar - Glass Effect */}
          <Link
            href="/search"
            className="inline-flex items-center gap-4 bg-white border-2 border-[rgb(var(--border))] px-6 py-4 rounded-[var(--radius-lg)] hover:border-[rgb(var(--primary))] transition-all max-w-2xl w-full shadow-soft"
          >
            <Search className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
            <span className="text-[rgb(var(--text-secondary))] text-base flex-1">Search stories, people, topics...</span>
            <ArrowRight className="w-5 h-5 text-[rgb(var(--primary))]" />
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="section-container">
        <div className="grid md:grid-cols-3 gap-6 -mt-16">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-rose-400/10 to-pink-500/10 rounded-xl">
                <BookOpen className="w-8 h-8 text-rose-500" />
              </div>
              <span className="stat-trend positive">+{stats.stories > 0 ? '15%' : 'New'}</span>
            </div>
            <div className="stat-number">{stats.stories}</div>
            <div className="stat-label">Community Stories</div>
            <p className="text-xs text-[rgb(var(--text-secondary))] mt-2">
              Voices of resilience and hope
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-xl">
                <Users className="w-8 h-8 text-[rgb(var(--primary))]" />
              </div>
              <span className="stat-trend positive">+8%</span>
            </div>
            <div className="stat-number">{stats.storytellers}</div>
            <div className="stat-label">Storytellers</div>
            <p className="text-xs text-[rgb(var(--text-secondary))] mt-2">
              Community voices documented
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-xl">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="badge badge-success">100%</span>
            </div>
            <div className="stat-number">{stats.services}+</div>
            <div className="stat-label">PICC Services</div>
            <p className="text-xs text-[rgb(var(--text-secondary))] mt-2">
              Community-controlled since 2021
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Explore</h2>
          <p className="section-subtitle">Discover stories, connect with community members, and explore our impact</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/stories" className="card-elevated group">
            <div className="mb-4 p-3 bg-gradient-to-br from-rose-400/10 to-pink-500/10 rounded-xl w-fit">
              <BookOpen className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
              Stories
            </h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
              Read powerful stories of resilience and transformation
            </p>
            <span className="text-[rgb(var(--primary))] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View Stories <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link href="/storytellers" className="card-elevated group">
            <div className="mb-4 p-3 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-xl w-fit">
              <Users className="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
              Storytellers
            </h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
              Meet the voices of our community
            </p>
            <span className="text-[rgb(var(--primary))] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View People <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link href="/dashboard" className="card-elevated group">
            <div className="mb-4 p-3 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-xl w-fit">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
              Dashboard
            </h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
              Impact metrics and community data
            </p>
            <span className="text-emerald-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View Dashboard <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/stories/submit"
            className="card-elevated group bg-gradient-to-br from-[rgb(var(--primary))]/5 to-[rgb(var(--accent))]/5 border-[rgb(var(--primary))]/20"
          >
            <div className="mb-4 p-3 bg-gradient-to-br from-[rgb(var(--primary))]/20 to-[rgb(var(--accent))]/20 rounded-xl w-fit">
              <Sparkles className="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
              Share Story
            </h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
              Upload your story to the platform
            </p>
            <span className="text-[rgb(var(--accent))] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Get Started <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* Featured Content */}
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Featured</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/stories/cyclone-2019" className="card-elevated group overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 -mx-8 -mt-8 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white/80" />
            </div>
            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">
              2019 Cyclone Story
            </h3>
            <p className="text-[rgb(var(--text-secondary))] mb-4">
              An immersive story of devastation, response, and community resilience
            </p>
            <span className="text-[rgb(var(--primary))] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Experience Journey <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <div className="card-elevated bg-gradient-to-br from-emerald-50 to-teal-50">
            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
              Community Impact
            </h3>
            <div className="space-y-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">197</span>
                </div>
                <div>
                  <div className="font-semibold text-[rgb(var(--text-primary))]">PICC Staff</div>
                  <div className="text-xs text-[rgb(var(--text-secondary))]">+30% from 2023</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[rgb(var(--primary))]/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-[rgb(var(--primary))]">80%</span>
                </div>
                <div>
                  <div className="font-semibold text-[rgb(var(--text-primary))]">Aboriginal Staff</div>
                  <div className="text-xs text-[rgb(var(--text-secondary))]">Community-controlled</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-rose-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-rose-500">16+</span>
                </div>
                <div>
                  <div className="font-semibold text-[rgb(var(--text-primary))]">Services</div>
                  <div className="text-xs text-[rgb(var(--text-secondary))]">Growing annually</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Platform */}
      <div className="section-container pb-16">
        <div className="card-modern max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-4">
            About This Platform
          </h3>
          <p className="text-[rgb(var(--text-secondary))] leading-relaxed mb-6 max-w-2xl mx-auto">
            Built by and for Palm Island community, this platform enables community-controlled impact
            measurement, eliminates dependence on external consultants ($40k-115k annual savings), and
            proves that Indigenous self-determination works at scale.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="badge badge-primary">Data Sovereignty</span>
            <span className="badge badge-success">Community Controlled</span>
            <span className="badge bg-rose-500/10 text-rose-600 font-semibold">100% Owned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
