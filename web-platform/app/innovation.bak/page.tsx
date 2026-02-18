// app/innovation/page.tsx
import { createClient } from '@supabase/supabase-js';

export const metadata = {
  title: 'Innovation at PICC | Palm Island Community Company',
  description: 'Six innovation projects driving community-led change'
};

export default async function InnovationPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: projects } = await supabase
    .from('innovation_projects')
    .select('*')
    .order('status');
  
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Innovation at PICC</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Six projects driving community-led change and self-determination
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects?.map((project: any) => (
          <article 
            key={project.slug}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`h-2 ${
              project.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status === 'active' ? 'Active' : 'Planning'}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {project.category}
                </span>
              </div>
              
              <h2 className="text-xl font-bold mb-3">{project.name}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-semibold">{project.people_impacted}</span>
                  <span className="text-gray-500"> impacted</span>
                </div>
                {project.jobs_created > 0 && (
                  <div>
                    <span className="font-semibold">{project.jobs_created}</span>
                    <span className="text-gray-500"> jobs</span>
                  </div>
                )}
              </div>
              
              {project.challenge && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Challenge: </span>
                    {project.challenge}
                  </p>
                </div>
              )}
              
              {project.outcome && (
                <div className="mt-2">
                  <p className="text-sm text-green-700">
                    <span className="font-semibold">Outcome: </span>
                    {project.outcome}
                  </p>
                </div>
              )}
              
              {project.future_vision && (
                <div className="mt-2">
                  <p className="text-sm text-blue-600">
                    <span className="font-semibold">Vision 2029: </span>
                    {project.future_vision}
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
