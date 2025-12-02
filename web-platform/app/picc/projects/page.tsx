import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import {
  Folder, Plus, Image, Building2, Users, Database, FileText,
  Clock, TrendingUp, AlertCircle, CheckCircle, Pause, Lightbulb
} from 'lucide-react';

export default async function ProjectsPage() {
  const supabase = createServerSupabase();

  // Get all projects with their update counts
  const { data: projects, error } = await supabase
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
      hero_image_url,
      is_public,
      featured,
      created_at
    `)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
  const planningProjects = projects?.filter(p => p.status === 'planning').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <TrendingUp className="w-4 h-4" />;
      case 'on_hold':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'on_hold':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getProjectIcon = (slug: string) => {
    switch (slug) {
      case 'photo-studio':
        return <Image className="w-6 h-6" />;
      case 'the-station':
        return <Building2 className="w-6 h-6" />;
      case 'elders-trips':
        return <Users className="w-6 h-6" />;
      case 'on-country-server':
        return <Database className="w-6 h-6" />;
      case 'annual-report':
        return <FileText className="w-6 h-6" />;
      default:
        return <Lightbulb className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Innovation Projects</h1>
          <p className="text-gray-600">Manage and track community innovation initiatives</p>
        </div>
        <Link
          href="/picc/projects/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Project</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Folder className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{totalProjects}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{activeProjects}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{planningProjects}</div>
              <div className="text-sm text-gray-600">Planning</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{completedProjects}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>Error loading projects: {error.message}</span>
          </div>
        </div>
      )}

      {!error && (!projects || projects.length === 0) && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first innovation project. Check the Content Management Guide for SQL examples.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/picc/projects/new"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all"
            >
              Add First Project
            </Link>
            <Link
              href="/picc/database"
              className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
            >
              View Database Tools
            </Link>
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/picc/projects/${project.slug}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-orange-300 transition-all group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-200 transition-colors">
                      {getProjectIcon(project.slug)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
                      {project.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className="capitalize">{project.status.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Tagline */}
                {project.tagline && (
                  <p className="text-gray-700 font-medium mb-3">{project.tagline}</p>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  {project.start_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Started {new Date(project.start_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Lightbulb className="w-4 h-4" />
                    <span className="capitalize">{project.project_type}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Getting Started with Projects
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900 mb-2">Add Projects via Database:</p>
            <p className="text-gray-700 mb-2">
              Check the <code className="px-2 py-1 bg-white rounded text-xs">CONTENT-MANAGEMENT-GUIDE.md</code> for SQL examples to insert projects.
            </p>
            <p className="text-gray-600">
              Includes ready-to-use SQL for Photo Studio, The Station, Elders Trips, On-Country Server, and Annual Report projects.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-2">Project Management Features:</p>
            <ul className="text-gray-700 space-y-1">
              <li>• Blog-style updates with photos/videos</li>
              <li>• Milestone tracking and progress indicators</li>
              <li>• Team assignments and permissions</li>
              <li>• Public/private visibility controls</li>
              <li>• Impact metrics and budget tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
