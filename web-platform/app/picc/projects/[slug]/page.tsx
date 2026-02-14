import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/client';
import {
  ArrowLeft, Edit, Plus, Image, Clock, TrendingUp, CheckCircle,
  AlertCircle, Pause, Users, Calendar, DollarSign, Target,
  FileText, Upload, Eye, EyeOff, Star, BookOpen, MapPin, Circle
} from 'lucide-react';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createServerSupabase();

  // Get project details
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      slug,
      tagline,
      description,
      status,
      project_type,
      start_date,
      target_completion_date,
      impact_areas,
      budget_total,
      budget_spent,
      hero_image_url,
      logo_url,
      project_lead,
      team_members,
      is_public,
      featured,
      created_at,
      updated_at
    `)
    .eq('slug', params.slug)
    .single();

  if (error || !project) {
    notFound();
  }

  // Load immersive story (if it exists) for this project.
  // By convention Story Builder uses slug `${project.slug}-story`.
  const { data: immersiveStory } = await supabase
    .from('immersive_stories')
    .select('id, slug, title, is_published, updated_at, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const immersiveStorySlug = immersiveStory?.slug || `${project.slug}-story`;
  const immersiveStoryUrl = `/immersive-stories/${immersiveStorySlug}`;

  // Get project updates
  const nowIso = new Date().toISOString();
  const { data: updates } = await supabase
    .from('project_updates')
    .select(`
      id,
      title,
      content,
      excerpt,
      update_type,
      featured_image_url,
      is_published,
      published_at,
      created_at,
      author_id,
      profiles!inner(full_name, preferred_name)
    `)
    .eq('project_id', project.id)
    .eq('is_published', true)
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .order('published_at', { ascending: false })
    .limit(10);

  // Get project media
  const { data: media } = await supabase
    .from('project_media')
    .select('id, media_type, file_name, title, is_featured, created_at')
    .eq('project_id', project.id)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  // Get project milestones
  const { data: milestones } = await supabase
    .from('project_milestones')
    .select('id, title, description, target_date, completion_date, status, created_at')
    .eq('project_id', project.id)
    .order('target_date', { ascending: true });

  // Get 20-year timeline era for this project
  let matchedEra: { name: string; subtitle: string } | null = null;
  if (project.start_date) {
    const { data: eras } = await supabase
      .from('history_eras')
      .select('name, subtitle, start_year, end_year')
      .order('start_year', { ascending: true });

    if (eras && eras.length > 0) {
      const projectYear = new Date(project.start_date).getFullYear();
      matchedEra = eras.find((era: any) => projectYear >= era.start_year && projectYear <= era.end_year) || null;
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-5 h-5" />;
      case 'in_progress':
        return <TrendingUp className="w-5 h-5" />;
      case 'on_hold':
        return <Pause className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-warm-100 text-picc-red border-warm-200';
      case 'in_progress':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'on_hold':
        return 'bg-picc-ochre-100 text-picc-ochre-700 border-picc-ochre-200';
      case 'completed':
        return 'bg-warm-100 text-picc-ochre border-warm-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'challenge':
        return 'bg-picc-ochre-100 text-picc-ochre-700 border-picc-ochre-200';
      case 'success':
        return 'bg-warm-100 text-picc-ochre border-warm-200';
      default:
        return 'bg-warm-100 text-picc-red border-warm-200';
    }
  };

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/picc/projects"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      {/* Project Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
              {project.featured && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                  <Star className="w-4 h-4" />
                  Featured
                </span>
              )}
            </div>
            {project.tagline && (
              <p className="text-xl text-gray-700 mb-4">{project.tagline}</p>
            )}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="capitalize">{project.status.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/picc/projects/${project.slug}/edit`}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Project</span>
            </Link>
            <Link
              href={`/picc/projects/${project.slug}/story-builder`}
              className="px-4 py-2 bg-gradient-to-r from-picc-red to-picc-ochre hover:from-picc-red hover:to-picc-ochre text-white font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{immersiveStory ? 'Edit Story' : 'Create Story'}</span>
            </Link>
            <Link
              href={`/picc/projects/${project.slug}/updates/new`}
              className="px-4 py-2 bg-gradient-to-r from-picc-ochre to-picc-red hover:from-picc-ochre-700 hover:to-picc-red text-white font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Update</span>
            </Link>
          </div>
        </div>

        {/* Project Meta */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warm-100 rounded-lg">
              <Calendar className="w-5 h-5 text-picc-red" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Started</div>
              <div className="font-semibold text-gray-900">
                {project.start_date ? new Date(project.start_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : 'Not set'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-sage-100 rounded-lg">
              <Target className="w-5 h-5 text-picc-ochre" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Project Type</div>
              <div className="font-semibold text-gray-900 capitalize">{project.project_type}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-warm-100 rounded-lg">
              {project.is_public ? <Eye className="w-5 h-5 text-picc-ochre" /> : <EyeOff className="w-5 h-5 text-picc-ochre" />}
            </div>
            <div>
              <div className="text-sm text-gray-600">Visibility</div>
              <div className="font-semibold text-gray-900">{project.is_public ? 'Public' : 'Private'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Updates</div>
              <div className="font-semibold text-gray-900">{updates?.length || 0} published</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Updates & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Immersive Story */}
          <div className="bg-gradient-to-br from-picc-red via-picc-ochre to-picc-red rounded-xl shadow-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  Immersive Story
                </span>
                {immersiveStory && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    {immersiveStory.is_published ? 'Published' : 'Draft'}
                  </span>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {immersiveStory?.title || 'Tell the story of this project'}
              </h2>

              <p className="text-lg text-white/90 mb-6 max-w-2xl">
                {immersiveStory
                  ? 'Edit sections, upload media, and preview the scroll story.'
                  : 'Create an immersive, scroll-driven story with photos, videos, and community voices.'}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/picc/projects/${project.slug}/story-builder`}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg shadow-lg transition-all"
                >
                  <span>{immersiveStory ? 'Edit Story' : 'Create Story'}</span>
                  <Edit className="w-5 h-5" />
                </Link>
                <Link
                  href={immersiveStoryUrl}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white/15 hover:bg-white/20 border border-white/30 text-white font-bold rounded-lg transition-all"
                >
                  <span>Preview</span>
                  <Eye className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Project</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
            </div>
          </div>

          {/* 20-Year Timeline Connection */}
          {matchedEra && (
            <Link
              href="/20-years"
              className="block bg-gradient-to-r from-warm-50 to-picc-ochre-50 border border-warm-200 rounded-xl p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <MapPin className="w-6 h-6 text-picc-red" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-picc-ochre mb-1">
                    Part of PICC&apos;s Road to 20 Years
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{matchedEra.name}</h3>
                  {matchedEra.subtitle && (
                    <p className="text-sm text-gray-600">{matchedEra.subtitle}</p>
                  )}
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-picc-red rotate-180 transition-colors mt-1" />
              </div>
            </Link>
          )}

          {/* Impact Areas */}
          {project.impact_areas && project.impact_areas.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Impact Areas</h3>
              <div className="flex flex-wrap gap-2">
                {project.impact_areas.map((area: string) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 bg-warm-50 text-picc-red rounded-full text-sm font-medium border border-warm-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Updates */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Project Updates</h2>
              <Link
                href={`/picc/projects/${project.slug}/updates/new`}
                className="px-4 py-2 bg-picc-ochre hover:bg-picc-ochre-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Update</span>
              </Link>
            </div>

            {!updates || updates.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No updates yet</p>
                <p className="text-sm text-gray-500 mb-6">
                  Create your first update to start building a timeline of progress.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {updates.map((update: any) => (
                  <div
                    key={update.id}
                    className="border-l-4 border-picc-ochre pl-4 hover:border-picc-ochre-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getUpdateTypeColor(update.update_type)}`}>
                            {update.update_type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(update.published_at || update.created_at).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{update.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">
                      {update.excerpt || update.content.substring(0, 200) + '...'}
                    </p>
                    <div className="text-sm text-gray-500">
                      By {update.profiles?.preferred_name || update.profiles?.full_name || 'PICC Team'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Media & Milestones */}
        <div className="space-y-6">
          {/* Project Media */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Project Media</h3>
              <button className="p-2 bg-warm-50 hover:bg-warm-100 text-picc-red rounded-lg transition-colors">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            {!media || media.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No media yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {media.map((item: any) => (
                  <div
                    key={item.id}
                    className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"
                  >
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Milestones</h3>
            {!milestones || milestones.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No milestones yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200" />

                <div className="space-y-4">
                  {milestones.map((milestone: any) => {
                    const isOverdue = milestone.status !== 'completed' && milestone.target_date && new Date(milestone.target_date) < new Date();
                    return (
                      <div key={milestone.id} className="relative flex gap-4">
                        {/* Status icon */}
                        <div className="relative z-10 flex-shrink-0 mt-0.5">
                          {milestone.status === 'completed' ? (
                            <div className="w-[30px] h-[30px] rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          ) : isOverdue ? (
                            <div className="w-[30px] h-[30px] rounded-full bg-red-100 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                          ) : milestone.status === 'in_progress' ? (
                            <div className="w-[30px] h-[30px] rounded-full bg-picc-ochre-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-picc-ochre" />
                            </div>
                          ) : (
                            <div className="w-[30px] h-[30px] rounded-full bg-gray-100 flex items-center justify-center">
                              <Circle className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-1">
                          <span className="font-semibold text-sm text-gray-900">{milestone.title}</span>
                          {milestone.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{milestone.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            {milestone.target_date && (
                              <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                Target: {new Date(milestone.target_date).toLocaleDateString('en-AU')}
                              </span>
                            )}
                            {milestone.completion_date && (
                              <span className="text-xs text-green-600 font-medium">
                                Completed: {new Date(milestone.completion_date).toLocaleDateString('en-AU')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-picc-ochre-50 to-warm-50 border border-picc-ochre-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/picc/projects/${project.slug}/story-builder`}
                className="w-full px-4 py-2 bg-gradient-to-r from-picc-red to-picc-ochre hover:from-picc-red hover:to-picc-ochre text-white font-semibold rounded-lg transition-all text-sm text-left flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>{immersiveStory ? 'Edit Immersive Story' : 'Create Immersive Story'}</span>
              </Link>
              <Link
                href={immersiveStoryUrl}
                className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all text-sm text-left flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Immersive Story</span>
              </Link>
              <Link
                href={`/picc/projects/${project.slug}/updates/new`}
                className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all text-sm text-left flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Update</span>
              </Link>
              <button className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all text-sm text-left flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
              </button>
              <button className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all text-sm text-left flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
              <Link
                href={`/picc/projects/${project.slug}/edit`}
                className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all text-sm text-left flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Project</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
