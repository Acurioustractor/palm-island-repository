import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/client';
import {
  ArrowLeft, Edit, FileCode, AlertCircle, Save, Trash2,
  Calendar, Eye, EyeOff, Star, Lightbulb, Database
} from 'lucide-react';

interface EditProjectPageProps {
  params: {
    slug: string;
  };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const supabase = createServerSupabase();

  // Get project details
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !project) {
    notFound();
  }

  const updateSQL = `-- Update ${project.name}
-- Project ID: ${project.id}

UPDATE projects
SET
  name = '${project.name}',
  tagline = '${project.tagline || ''}',
  description = '${project.description.replace(/'/g, "''")}',
  status = '${project.status}',  -- Options: planning, in_progress, on_hold, completed
  project_type = '${project.project_type}',  -- Options: innovation, infrastructure, cultural, service, research
  is_public = ${project.is_public},  -- TRUE or FALSE
  featured = ${project.featured},  -- TRUE or FALSE
  updated_at = NOW()
WHERE id = '${project.id}';`;

  const deleteSQL = `-- ⚠️ DANGER: Delete ${project.name}
-- This will CASCADE delete all related updates, media, and milestones!

DELETE FROM projects
WHERE id = '${project.id}';`;

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'blue', description: 'Project in planning phase' },
    { value: 'in_progress', label: 'In Progress', color: 'green', description: 'Active development' },
    { value: 'on_hold', label: 'On Hold', color: 'amber', description: 'Temporarily paused' },
    { value: 'completed', label: 'Completed', color: 'purple', description: 'Project finished' },
  ];

  const typeOptions = [
    { value: 'innovation', label: 'Innovation', description: 'New technology or approach' },
    { value: 'infrastructure', label: 'Infrastructure', description: 'Physical or digital infrastructure' },
    { value: 'cultural', label: 'Cultural', description: 'Cultural preservation or practice' },
    { value: 'service', label: 'Service', description: 'Community service delivery' },
    { value: 'research', label: 'Research', description: 'Research or documentation' },
  ];

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href={`/picc/projects/${params.slug}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {project.name}</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Edit className="w-8 h-8 text-blue-600" />
          Edit Project
        </h1>
        <p className="text-gray-600">Update project details, status, and settings</p>
      </div>

      {/* Current Process Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Current Setup: Database SQL</h3>
            <p className="text-blue-800 mb-2">
              Project updates are made via SQL in Supabase. This ensures data integrity and allows
              for precise control over all fields.
            </p>
            <p className="text-sm text-blue-700">
              A visual editor is coming in Phase 2. For now, modify the SQL below and run it in Supabase.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Current Settings */}
        <div className="space-y-6">
          {/* Current Project Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Current Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Project Name</label>
                <div className="text-gray-900">{project.name}</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Slug (URL)</label>
                <div className="text-gray-600 font-mono text-sm">
                  /picc/projects/{project.slug}
                </div>
              </div>

              {project.tagline && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Tagline</label>
                  <div className="text-gray-900">{project.tagline}</div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                <div className="text-gray-900 text-sm max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {project.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200 capitalize">
                    {project.status.replace('_', ' ')}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Type</label>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 capitalize">
                    {project.project_type}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Visibility</label>
                  <div className="flex items-center gap-2">
                    {project.is_public ? (
                      <div className="flex items-center gap-1 text-green-700">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-700">
                        <EyeOff className="w-4 h-4" />
                        <span className="text-sm font-medium">Private</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Featured</label>
                  <div className="flex items-center gap-2">
                    {project.featured ? (
                      <div className="flex items-center gap-1 text-yellow-700">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">Yes</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">No</span>
                    )}
                  </div>
                </div>
              </div>

              {project.start_date && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Start Date</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.start_date).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Field Reference */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              Editable Fields
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-gray-900">Status Options:</div>
                <div className="mt-2 space-y-1">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-start gap-2">
                      <code className="px-2 py-0.5 bg-white rounded text-xs font-mono">{status.value}</code>
                      <span className="text-gray-600">- {status.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-purple-200">
                <div className="font-semibold text-gray-900">Project Types:</div>
                <div className="mt-2 space-y-1">
                  {typeOptions.map((type) => (
                    <div key={type.value} className="flex items-start gap-2">
                      <code className="px-2 py-0.5 bg-white rounded text-xs font-mono">{type.value}</code>
                      <span className="text-gray-600">- {type.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-purple-200">
                <div className="font-semibold text-gray-900 mb-1">Boolean Fields:</div>
                <div className="text-gray-600">
                  <code className="px-2 py-0.5 bg-white rounded text-xs font-mono">is_public</code> - TRUE (visible to public) or FALSE (staff only)
                </div>
                <div className="text-gray-600 mt-1">
                  <code className="px-2 py-0.5 bg-white rounded text-xs font-mono">featured</code> - TRUE (show on homepage) or FALSE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - SQL Templates */}
        <div className="space-y-6">
          {/* Update SQL */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-green-600" />
                Update SQL
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(updateSQL)}
                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Copy SQL</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
              <pre className="text-xs text-green-400 font-mono">
                <code>{updateSQL}</code>
              </pre>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>How to Update:</strong>
              </p>
              <ol className="text-sm text-green-700 space-y-1 ml-4">
                <li>1. Copy the SQL above</li>
                <li>2. Modify the values you want to change</li>
                <li>3. Open Supabase SQL Editor</li>
                <li>4. Paste and run the query</li>
                <li>5. Refresh this page to see changes</li>
              </ol>
            </div>
          </div>

          {/* Common Updates */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Common Updates</h3>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-900 mb-2">Change Status to In Progress</div>
                <code className="text-xs bg-gray-900 text-green-400 p-2 rounded block overflow-x-auto">
                  UPDATE projects SET status = 'in_progress', updated_at = NOW() WHERE id = '{project.id}';
                </code>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-900 mb-2">Make Project Featured</div>
                <code className="text-xs bg-gray-900 text-green-400 p-2 rounded block overflow-x-auto">
                  UPDATE projects SET featured = TRUE, updated_at = NOW() WHERE id = '{project.id}';
                </code>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-900 mb-2">Change to Private</div>
                <code className="text-xs bg-gray-900 text-green-400 p-2 rounded block overflow-x-auto">
                  UPDATE projects SET is_public = FALSE, updated_at = NOW() WHERE id = '{project.id}';
                </code>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-900 mb-2">Update Description</div>
                <code className="text-xs bg-gray-900 text-green-400 p-2 rounded block overflow-x-auto">
                  UPDATE projects SET description = 'Your new description here', updated_at = NOW() WHERE id = '{project.id}';
                </code>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-800 mb-4">
                  Deleting this project will permanently remove all associated updates, media, and milestones.
                  This action cannot be undone!
                </p>
              </div>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-red-900 hover:text-red-700 transition-colors">
                Show Delete SQL (Use with extreme caution)
              </summary>
              <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-red-400 font-mono">
                  <code>{deleteSQL}</code>
                </pre>
              </div>
            </details>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href={`/picc/projects/${project.slug}`}
                className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-orange-200 transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">View Project Page</div>
                <div className="text-sm text-gray-600">See how the project appears</div>
              </Link>
              <Link
                href={`/picc/projects/${project.slug}/updates/new`}
                className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-orange-200 transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">Add Update</div>
                <div className="text-sm text-gray-600">Create a new project update</div>
              </Link>
              <Link
                href="/picc/database"
                className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-orange-200 transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Database Tools</span>
                </div>
                <div className="text-sm text-gray-600">View stats and run queries</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
