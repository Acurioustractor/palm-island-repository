import Link from 'next/link';
import {
  ArrowLeft, Database, FileText, Lightbulb, AlertCircle,
  Image, Building2, Users, FileCode, Calendar
} from 'lucide-react';

export default function NewProjectPage() {
  const exampleSQL = `INSERT INTO projects (
  name,
  slug,
  tagline,
  description,
  status,
  project_type,
  start_date,
  is_public,
  featured,
  created_at
) VALUES (
  'Your Project Name',
  'your-project-slug',
  'One-line tagline describing the project',
  'Full project description explaining goals, approach, and expected outcomes. Be detailed and comprehensive.',
  'planning',          -- Options: planning, in_progress, on_hold, completed
  'innovation',        -- Options: innovation, infrastructure, cultural, service, research
  '2024-01-01',       -- Start date
  TRUE,               -- Public visibility
  TRUE,               -- Featured on homepage
  NOW()
);`;

  const exampleProjects = [
    {
      name: 'Palm Island Photo Studio',
      slug: 'photo-studio',
      icon: Image,
      tagline: 'On-Country professional photography',
      color: 'from-pink-600 to-rose-600',
    },
    {
      name: 'The Station',
      slug: 'the-station',
      icon: Building2,
      tagline: 'Community hub and cultural space',
      color: 'from-blue-600 to-teal-600',
    },
    {
      name: 'Elders Cultural Trips',
      slug: 'elders-trips',
      icon: Users,
      tagline: 'Connecting elders to Country',
      color: 'from-purple-600 to-pink-600',
    },
  ];

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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Project</h1>
        <p className="text-gray-600">Create a new innovation project to track progress and share updates</p>
      </div>

      {/* Current Process Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Current Setup: Database SQL</h3>
            <p className="text-blue-800 mb-3">
              Projects are currently added via SQL in Supabase. This ensures proper data structure and
              allows for bulk imports. A visual form builder is coming in Phase 2.
            </p>
            <p className="text-sm text-blue-700">
              This approach gives you full control and is perfect for migrating existing project data.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Instructions */}
        <div className="space-y-6">
          {/* Step-by-Step Guide */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-600" />
              How to Add a Project
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Open Supabase SQL Editor</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Navigate to your Supabase project → SQL Editor → New query
                  </p>
                  <Link
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Open Supabase Dashboard →
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Copy the SQL Template</h3>
                  <p className="text-sm text-gray-700">
                    Use the example SQL on this page or find ready-to-use examples in the Content Management Guide
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Customize Your Details</h3>
                  <p className="text-sm text-gray-700 mb-2">Update the values to match your project:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• <strong>name:</strong> Project title</li>
                    <li>• <strong>slug:</strong> URL-friendly identifier (lowercase, hyphens)</li>
                    <li>• <strong>tagline:</strong> One-line description</li>
                    <li>• <strong>description:</strong> Full project details</li>
                    <li>• <strong>status:</strong> planning, in_progress, on_hold, or completed</li>
                    <li>• <strong>project_type:</strong> innovation, infrastructure, cultural, service, or research</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Run the Query</h3>
                  <p className="text-sm text-gray-700">
                    Execute the SQL query. Your project will appear immediately in the projects list!
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Add Updates & Media</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Use the project page to add updates, upload photos/videos, and track milestones.
                  </p>
                  <p className="text-sm text-gray-600">
                    Check the Content Management Guide for SQL examples for updates and media.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Resources & Examples
            </h3>
            <div className="space-y-3">
              <Link
                href="/picc/database"
                className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-purple-200 transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">Database Tools</div>
                <div className="text-sm text-gray-600">View table statistics and run queries</div>
              </Link>
              <div className="block p-3 bg-white rounded-lg border border-purple-200">
                <div className="font-semibold text-gray-900 mb-1">Content Management Guide</div>
                <div className="text-sm text-gray-600 mb-2">
                  Full SQL examples in <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">CONTENT-MANAGEMENT-GUIDE.md</code>
                </div>
                <div className="text-xs text-gray-500">Location: Repository root directory</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - SQL Example */}
        <div className="space-y-6">
          {/* SQL Template */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                SQL Template
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(exampleSQL)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors"
              >
                Copy SQL
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                <code>{exampleSQL}</code>
              </pre>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Copy this template, customize the values, and run it in Supabase SQL Editor.
              </p>
            </div>
          </div>

          {/* Example Projects */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Example Projects
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ready-to-use SQL for these projects is in the Content Management Guide:
            </p>
            <div className="space-y-3">
              {exampleProjects.map((project) => {
                const Icon = project.icon;
                return (
                  <div
                    key={project.slug}
                    className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 bg-gradient-to-r ${project.color} rounded-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.tagline}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-sm text-gray-600">+ Annual Report System</div>
                <div className="text-sm text-gray-600">+ On-Country Server</div>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Calendar className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Coming in Phase 2</h3>
                <p className="text-sm text-gray-700">
                  Visual form builder for creating and editing projects directly from this page.
                  SQL approach ensures we have a solid foundation while the UI is being built.
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Planned features:</strong> Drag-and-drop media, rich text editor, team assignment,
              budget tracking, milestone planning, and automatic slug generation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
