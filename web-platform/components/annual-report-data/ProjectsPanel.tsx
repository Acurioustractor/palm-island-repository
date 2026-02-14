'use client';

import { useState } from 'react';
import { Star, ExternalLink, Briefcase, FolderOpen } from 'lucide-react';
import EmptyState from './EmptyState';

interface Project {
  id: string;
  name: string;
  slug: string;
  project_type: string | null;
  status: string | null;
  hero_image_url: string | null;
  tagline: string | null;
  budget_total: number | null;
  featured: boolean;
  start_date: string | null;
}

interface ProjectsPanelProps {
  projects: Project[];
  featuredCount: number;
  byType: Record<string, number>;
  onProjectsChange: (projects: Project[]) => void;
}

export default function ProjectsPanel({
  projects,
  featuredCount,
  byType,
  onProjectsChange,
}: ProjectsPanelProps) {
  const [saving, setSaving] = useState<string | null>(null);

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setSaving(id);
    try {
      const res = await fetch('/api/annual-report-data/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !current }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      onProjectsChange(
        projects.map(p => p.id === id ? { ...p, featured: !current } : p)
      );
    } catch (error) {
      console.error('Toggle featured error:', error);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.length} icon={<Briefcase className="w-4 h-4" />} />
        <StatCard label="Featured" value={featuredCount} icon={<Star className="w-4 h-4" />} />
        {Object.entries(byType).slice(0, 2).map(([type, count]) => (
          <StatCard key={type} label={type} value={count} icon={<FolderOpen className="w-4 h-4" />} />
        ))}
      </div>

      {/* Projects list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {project.hero_image_url ? (
                      <img src={project.hero_image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{project.name}</div>
                      {project.tagline && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{project.tagline}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {project.project_type || 'Other'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    project.status === 'completed'
                      ? 'bg-sage-100 text-sage-700'
                      : project.status === 'active'
                        ? 'bg-warm-100 text-picc-red'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {project.budget_total != null
                    ? `$${project.budget_total.toLocaleString()}`
                    : '--'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleFeatured(project.id, project.featured)}
                    disabled={saving === project.id}
                    className={`p-1.5 rounded transition-colors ${
                      project.featured
                        ? 'text-picc-ochre hover:text-picc-ochre bg-picc-ochre-50'
                        : 'text-gray-300 hover:text-gray-500'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={project.featured ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/picc/projects/${project.slug}/edit`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-picc-ochre hover:bg-warm-50 rounded transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Edit
                  </a>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="p-0">
                  <EmptyState
                    icon={<Briefcase className="w-6 h-6" />}
                    title="No innovation projects"
                    description="No projects found for this fiscal year. Add projects in the Projects section."
                    secondaryAction={{ label: 'Manage Projects', href: '/picc/projects' }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
