import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/client';
import {
  ArrowLeft, FileText, Image, AlertCircle, Plus, Calendar,
  TrendingUp, Award, AlertTriangle, Lightbulb, FileCode
} from 'lucide-react';

interface NewUpdatePageProps {
  params: {
    slug: string;
  };
}

export default async function NewUpdatePage({ params }: NewUpdatePageProps) {
  const supabase = createServerSupabase();

  // Get project details
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, slug')
    .eq('slug', params.slug)
    .single();

  if (error || !project) {
    notFound();
  }

  // Get current user's profile (for author_id)
  const { data: { user } } = await supabase.auth.getUser();

  const exampleSQL = `-- Get the project ID first (already done for you below)
-- Project: ${project.name}
-- Project ID: ${project.id}

INSERT INTO project_updates (
  project_id,
  author_id,
  title,
  content,
  excerpt,
  update_type,
  is_published,
  published_at,
  created_at
) VALUES (
  '${project.id}',
  '${user?.id || 'YOUR-PROFILE-ID-HERE'}',  -- Your profile ID
  'Update Title Here',
  'Full update content goes here. This is where you tell the story of what happened, what was achieved, what challenges were faced, and what comes next.

You can include multiple paragraphs to provide comprehensive details.

Format this content with line breaks and structure to make it readable.',
  'A brief summary of the update in 1-2 sentences. This appears in previews.',
  'progress',  -- Options: progress, milestone, challenge, success, announcement
  TRUE,        -- Set to FALSE to save as draft
  NOW(),       -- Publication date
  NOW()
);`;

  const updateTypes = [
    {
      type: 'progress',
      icon: TrendingUp,
      color: 'from-blue-600 to-teal-600',
      description: 'Regular progress update showing ongoing work',
      example: 'Weekly update on construction progress, team activities',
    },
    {
      type: 'milestone',
      icon: Award,
      color: 'from-green-600 to-emerald-600',
      description: 'Major achievement or completed milestone',
      example: 'Equipment arrives, facility opens, target reached',
    },
    {
      type: 'success',
      icon: Lightbulb,
      color: 'from-purple-600 to-pink-600',
      description: 'Success story or positive outcome',
      example: 'Community feedback, award won, positive impact',
    },
    {
      type: 'challenge',
      icon: AlertTriangle,
      color: 'from-amber-600 to-orange-600',
      description: 'Challenge faced or problem being addressed',
      example: 'Delay explanation, budget adjustment, obstacle',
    },
    {
      type: 'announcement',
      icon: FileText,
      color: 'from-indigo-600 to-blue-600',
      description: 'General announcement or news',
      example: 'Event announcement, schedule change, call for volunteers',
    },
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Project Update</h1>
        <p className="text-gray-600">Share progress, milestones, and stories from {project.name}</p>
      </div>

      {/* Current Process Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Current Setup: Database SQL</h3>
            <p className="text-blue-800 mb-2">
              Project updates are currently added via SQL. This ensures proper data structure and allows
              for rich content formatting. A visual editor is coming in Phase 2.
            </p>
            <p className="text-sm text-blue-700">
              Your updates will appear in chronological order on the project page, creating a blog-style timeline.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Instructions & Types */}
        <div className="space-y-6">
          {/* Update Types */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Update Type</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the type that best matches your update. This helps categorize and display updates appropriately.
            </p>
            <div className="space-y-3">
              {updateTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.type}
                    className="p-4 border-2 border-gray-200 hover:border-orange-300 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-r ${type.color} rounded-lg flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-1 capitalize">{type.type}</div>
                        <p className="text-sm text-gray-700 mb-2">{type.description}</p>
                        <p className="text-xs text-gray-500 italic">Example: {type.example}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              Best Practices for Updates
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Be specific:</strong> Include dates, numbers, and concrete details</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Tell stories:</strong> Share community voices and personal experiences</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Add media:</strong> Include photos/videos after creating the update</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Regular updates:</strong> Post monthly minimum to maintain engagement</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Celebrate wins:</strong> Don't just report - celebrate achievements!</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Be honest:</strong> Share challenges alongside successes</span>
              </li>
            </ul>
          </div>

          {/* Content Tips */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Content Structure Tips</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900 mb-1">Title (40-60 characters)</div>
                <div className="text-gray-600">Clear, engaging headline that captures the main point</div>
                <div className="text-xs text-gray-500 mt-1 italic">
                  ✅ "Photo Studio Equipment Arrives on Palm Island"<br />
                  ❌ "Update #3"
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Excerpt (100-150 characters)</div>
                <div className="text-gray-600">Brief summary for previews and social sharing</div>
                <div className="text-xs text-gray-500 mt-1 italic">
                  ✅ "Professional photography equipment has arrived, studio bookings opening soon"
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Content (300+ words)</div>
                <div className="text-gray-600">Full story with context, details, and next steps</div>
                <div className="text-xs text-gray-500 mt-1">
                  Include: What happened, why it matters, who was involved, what's next
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - SQL Template */}
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
              <pre className="text-xs text-green-400 font-mono">
                <code>{exampleSQL}</code>
              </pre>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>💡 Quick Start:</strong>
              </p>
              <ol className="text-sm text-blue-700 space-y-1 ml-4">
                <li>1. Copy the SQL template above</li>
                <li>2. Open Supabase SQL Editor</li>
                <li>3. Replace the placeholder text with your content</li>
                <li>4. Choose an update_type</li>
                <li>5. Run the query</li>
              </ol>
            </div>
          </div>

          {/* After Publishing */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-green-600" />
              After Publishing
            </h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-900 mb-1">✅ Your update is live!</div>
                <p className="text-green-700">
                  The update will appear immediately on the project page in the timeline.
                </p>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2">Next Steps:</div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Plus className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Upload photos or videos to illustrate the update</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Add a milestone if this update marks a major achievement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Share on social media or in newsletters</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example Updates */}
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Example Updates</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white rounded-lg border border-orange-200">
                <div className="font-semibold text-gray-900 mb-1">📸 Photo Studio Milestone</div>
                <p className="text-gray-600 mb-2">
                  "Professional equipment delivered - First community portraits scheduled for next week"
                </p>
                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  milestone
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-orange-200">
                <div className="font-semibold text-gray-900 mb-1">🏗️ Construction Progress</div>
                <p className="text-gray-600 mb-2">
                  "The Station foundation complete - 60% of structural work finished ahead of schedule"
                </p>
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  progress
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-orange-200">
                <div className="font-semibold text-gray-900 mb-1">👥 Elders Trip Success</div>
                <p className="text-gray-600 mb-2">
                  "15 elders visited traditional sites - Knowledge sharing sessions recorded for archive"
                </p>
                <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  success
                </span>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Coming in Phase 2</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Rich text editor with:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Drag-and-drop media embedding</li>
                  <li>• Formatting toolbar (bold, italic, lists)</li>
                  <li>• Auto-save drafts</li>
                  <li>• Preview before publishing</li>
                  <li>• Schedule future posts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
