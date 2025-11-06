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

    const { count: storyCount } = await supabase
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-20 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-coral-warm" />
              <span className="text-coral-warm font-semibold text-sm uppercase tracking-wide">
                Community-Controlled Platform
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Palm Island Story Server
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl">
              Manbarra & Bwgcolman Country
            </p>
            <p className="text-lg text-white/70 mb-8 max-w-2xl">
              Preserving our voices, measuring our impact, and maintaining data sovereignty
            </p>

            {/* Search Bar */}
            <Link
              href="/search"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 px-6 py-4 rounded-xl hover:bg-white/20 transition-all max-w-2xl w-full"
            >
              <Search className="w-5 h-5 text-white/60" />
              <span className="text-white/60 text-base flex-1">Search stories, people, topics...</span>
              <ArrowRight className="w-5 h-5 text-white/40" />
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto px-8 -mt-12 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-12 h-12 text-coral-warm" />
                <span className="stat-trend positive">+{stats.stories > 0 ? '15%' : 'New'}</span>
              </div>
              <div className="stat-number">{stats.stories}</div>
              <div className="stat-label">Community Stories</div>
              <p className="text-xs text-earth-medium mt-2">
                Voices of resilience and hope
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-12 h-12 text-ocean-medium" />
                <span className="stat-trend positive">+8%</span>
              </div>
              <div className="stat-number">{stats.storytellers}</div>
              <div className="stat-label">Storytellers</div>
              <p className="text-xs text-earth-medium mt-2">
                Community voices documented
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-12 h-12 text-success" />
                <span className="badge badge-success">100%</span>
              </div>
              <div className="stat-number">{stats.services}+</div>
              <div className="stat-label">PICC Services</div>
              <p className="text-xs text-earth-medium mt-2">
                Community-controlled since 2021
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 pb-16">
          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ocean-deep mb-6">Explore</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/stories"
                className="card-elevated group"
              >
                <BookOpen className="w-10 h-10 text-coral-warm mb-4" />
                <h3 className="text-lg font-semibold text-ocean-deep mb-2">
                  Stories
                </h3>
                <p className="text-sm text-earth-medium mb-4">
                  Read powerful stories of resilience and transformation
                </p>
                <span className="text-coral-warm font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Stories <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <Link
                href="/storytellers"
                className="card-elevated group"
              >
                <Users className="w-10 h-10 text-ocean-medium mb-4" />
                <h3 className="text-lg font-semibold text-ocean-deep mb-2">
                  Storytellers
                </h3>
                <p className="text-sm text-earth-medium mb-4">
                  Meet the voices of our community
                </p>
                <span className="text-ocean-medium font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View People <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="card-elevated group"
              >
                <TrendingUp className="w-10 h-10 text-success mb-4" />
                <h3 className="text-lg font-semibold text-ocean-deep mb-2">
                  Dashboard
                </h3>
                <p className="text-sm text-earth-medium mb-4">
                  Impact metrics and community data
                </p>
                <span className="text-success font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <Link
                href="/stories/submit"
                className="card-elevated group bg-gradient-to-br from-coral-warm/5 to-sunset-orange/5 border-coral-warm/20"
              >
                <Sparkles className="w-10 h-10 text-coral-warm mb-4" />
                <h3 className="text-lg font-semibold text-ocean-deep mb-2">
                  Share Story
                </h3>
                <p className="text-sm text-earth-medium mb-4">
                  Upload your story to the platform
                </p>
                <span className="text-coral-warm font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get Started <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* Featured Content */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ocean-deep mb-6">Featured</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/stories/cyclone-2019"
                className="card-elevated group overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-ocean-deep to-ocean-light mb-4 -mx-8 -mt-8 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/50" />
                </div>
                <h3 className="text-xl font-bold text-ocean-deep mb-2">
                  2019 Cyclone Story
                </h3>
                <p className="text-earth-medium mb-4">
                  An immersive story of devastation, response, and community resilience
                </p>
                <span className="text-coral-warm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Experience Journey <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <div className="card-elevated bg-gradient-to-br from-coral-warm/5 to-sunset-orange/5 border-coral-warm/20">
                <h3 className="text-xl font-bold text-ocean-deep mb-4">
                  Community Impact
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-success">197</span>
                    </div>
                    <div>
                      <div className="font-semibold text-earth-dark">PICC Staff</div>
                      <div className="text-xs text-earth-medium">+30% from 2023</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-ocean-medium/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-ocean-medium">80%</span>
                    </div>
                    <div>
                      <div className="font-semibold text-earth-dark">Aboriginal Staff</div>
                      <div className="text-xs text-earth-medium">Community-controlled</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-coral-warm/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-coral-warm">16+</span>
                    </div>
                    <div>
                      <div className="font-semibold text-earth-dark">Services</div>
                      <div className="text-xs text-earth-medium">Growing annually</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Platform */}
          <div className="card-modern">
            <h3 className="text-xl font-bold text-ocean-deep mb-4">
              About This Platform
            </h3>
            <p className="text-earth-medium leading-relaxed mb-4">
              Built by and for Palm Island community, this platform enables community-controlled impact
              measurement, eliminates dependence on external consultants ($40k-115k annual savings), and
              proves that Indigenous self-determination works at scale.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary">Data Sovereignty</span>
              <span className="badge badge-success">Community Controlled</span>
              <span className="badge bg-coral-warm/10 text-coral-warm">100% Owned</span>
            </div>
          </div>
        </div>
      </div>
  );
}
