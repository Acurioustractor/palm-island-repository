import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/client'
import { ArrowLeft, FileText } from 'lucide-react'
import ProjectUpdateEditor from './project-update-editor'

export const dynamic = 'force-dynamic'
interface NewUpdatePageProps {
  params: { slug: string }
}

export default async function NewUpdatePage({ params }: NewUpdatePageProps) {
  const supabase = createServerSupabase()

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, slug')
    .eq('slug', params.slug)
    .single()

  if (error || !project) notFound()

  return (
    <div className="p-8">
      <Link
        href={`/picc/projects/${params.slug}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {project.name}</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-600" />
          New Project Update
        </h1>
        <p className="text-gray-600">Write, preview, schedule, and publish updates for {project.name}</p>
      </div>

      <ProjectUpdateEditor projectSlug={project.slug} projectName={project.name} />
    </div>
  )
}

