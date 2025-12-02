import { createServerSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Database, FileText, Users, Image as ImageIcon, Folder,
  TrendingUp, AlertCircle, CheckCircle, BookOpen, Lightbulb,
  Calendar, Code, ExternalLink
} from 'lucide-react';

export default async function DatabasePage() {
  const supabase = createServerSupabase();

  // Get table statistics
  const stats = {
    stories: { count: 0, error: null as any },
    storytellers: { count: 0, error: null as any },
    media: { count: 0, error: null as any },
    projects: { count: 0, error: null as any },
    projectUpdates: { count: 0, error: null as any },
  };

  // Get story count
  const { count: storiesCount, error: storiesError } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });
  stats.stories = { count: storiesCount || 0, error: storiesError };

  // Get storyteller count
  const { count: storytellersCount, error: storytellersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  stats.storytellers = { count: storytellersCount || 0, error: storytellersError };

  // Get media count
  const { count: mediaCount, error: mediaError } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true });
  stats.media = { count: mediaCount || 0, error: mediaError };

  // Get project count
  const { count: projectsCount, error: projectsError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });
  stats.projects = { count: projectsCount || 0, error: projectsError };

  // Get project updates count
  const { count: updatesCount, error: updatesError } = await supabase
    .from('project_updates')
    .select('*', { count: 'exact', head: true });
  stats.projectUpdates = { count: updatesCount || 0, error: updatesError };

  const tableCards = [
    {
      name: 'Stories',
      table: 'stories',
      icon: BookOpen,
      color: 'from-blue-600 to-teal-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      count: stats.stories.count,
      error: stats.stories.error,
      description: 'Community stories and narratives',
    },
    {
      name: 'Storytellers',
      table: 'profiles',
      icon: Users,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      count: stats.storytellers.count,
      error: stats.storytellers.error,
      description: 'Registered community members',
    },
    {
      name: 'Media Files',
      table: 'media',
      icon: ImageIcon,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      count: stats.media.count,
      error: stats.media.error,
      description: 'Photos, videos, and audio files',
    },
    {
      name: 'Projects',
      table: 'projects',
      icon: Folder,
      color: 'from-orange-600 to-pink-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      count: stats.projects.count,
      error: stats.projects.error,
      description: 'Innovation and community projects',
    },
    {
      name: 'Project Updates',
      table: 'project_updates',
      icon: FileText,
      color: 'from-amber-600 to-yellow-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      count: stats.projectUpdates.count,
      error: stats.projectUpdates.error,
      description: 'Blog-style project updates',
    },
  ];

  const sqlExamples = [
    {
      title: 'View Recent Stories',
      description: 'Get the 10 most recent published stories',
      sql: `SELECT id, title, created_at, status
FROM stories
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 10;`,
    },
    {
      title: 'Count Stories by Status',
      description: 'See how many stories are in each status',
      sql: `SELECT status, COUNT(*) as count
FROM stories
GROUP BY status
ORDER BY count DESC;`,
    },
    {
      title: 'Active Projects',
      description: 'List all active innovation projects',
      sql: `SELECT name, slug, status, start_date
FROM projects
WHERE status = 'in_progress'
ORDER BY start_date DESC;`,
    },
    {
      title: 'Recent Project Updates',
      description: 'Get latest updates across all projects',
      sql: `SELECT
  pu.title,
  pu.update_type,
  pu.published_at,
  p.name as project_name
FROM project_updates pu
JOIN projects p ON p.id = pu.project_id
WHERE pu.is_published = TRUE
ORDER BY pu.published_at DESC
LIMIT 10;`,
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Database Tools
        </h1>
        <p className="text-gray-600">Manage data, run queries, and view table statistics</p>
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <ExternalLink className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supabase SQL Editor</h3>
            <p className="text-gray-700 mb-4">
              For direct database access, use the Supabase SQL Editor. Run queries, view tables, and execute migrations.
            </p>
            <Link
              href="https://supabase.com/dashboard"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Table Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Table Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tableCards.map((table) => {
            const Icon = table.icon;
            return (
              <div
                key={table.table}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${table.bgColor} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${table.iconColor}`} />
                  </div>
                  {table.error ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{table.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{table.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{table.count.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">records</span>
                </div>
                {table.error && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    Table not found - run migration
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SQL Examples */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Common SQL Queries</h2>
          <Link
            href="https://supabase.com/dashboard"
            target="_blank"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <span>Run in SQL Editor</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {sqlExamples.map((example, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{example.title}</h3>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono">
                  <code>{example.sql}</code>
                </pre>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(example.sql)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy SQL
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Database Documentation */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Schema Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Database Schema Files
          </h3>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-900 mb-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">empathy-ledger-schema.sql</code>
              </div>
              <p className="text-sm text-gray-600">Main database schema for stories and storytellers</p>
              <p className="text-xs text-gray-500 mt-1">Location: <code>web-platform/lib/empathy-ledger/</code></p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-900 mb-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">projects-schema.sql</code>
              </div>
              <p className="text-sm text-gray-600">Projects management schema with updates and media</p>
              <p className="text-xs text-gray-500 mt-1">Location: <code>web-platform/lib/empathy-ledger/</code></p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-900 mb-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">wiki-schema.sql</code>
              </div>
              <p className="text-sm text-gray-600">Wiki and knowledge base schema</p>
              <p className="text-xs text-gray-500 mt-1">Location: <code>web-platform/lib/empathy-ledger/</code></p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/picc/projects"
              className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-purple-200 transition-all"
            >
              <div className="font-semibold text-gray-900 mb-1">Manage Projects</div>
              <div className="text-sm text-gray-600">View and manage innovation projects</div>
            </Link>
            <Link
              href="/picc/admin/storytellers"
              className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-purple-200 transition-all"
            >
              <div className="font-semibold text-gray-900 mb-1">View All Stories</div>
              <div className="text-sm text-gray-600">Browse and manage community stories</div>
            </Link>
            <Link
              href="/picc/storytellers"
              className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-purple-200 transition-all"
            >
              <div className="font-semibold text-gray-900 mb-1">Storyteller Profiles</div>
              <div className="text-sm text-gray-600">Manage community member profiles</div>
            </Link>
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="font-semibold text-gray-900 mb-1">Content Management Guide</div>
              <div className="text-sm text-gray-600 mb-2">SQL examples and workflows</div>
              <div className="text-xs text-gray-500">
                File: <code className="px-1.5 py-0.5 bg-gray-100 rounded">CONTENT-MANAGEMENT-GUIDE.md</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Database Safety</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Always test queries on a copy or in a transaction before running on production data</li>
              <li>• Use WHERE clauses carefully to avoid updating/deleting unintended records</li>
              <li>• Back up data before running major migrations or bulk updates</li>
              <li>• Check Row Level Security (RLS) policies when queries return unexpected results</li>
              <li>• For bulk operations, consider using the Content Management Guide's SQL templates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
