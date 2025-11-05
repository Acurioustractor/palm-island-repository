import { mockAnnualReportData } from '@/lib/mock-data'
import { Download, FileText, BarChart, Users } from 'lucide-react'
import Link from 'next/link'

export default function AnnualReportPage({
  params
}: {
  params: { year: string }
}) {
  const year = parseInt(params.year)
  const data = mockAnnualReportData // In production, fetch from database

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Annual Report {year}</h1>
              <p className="text-green-100">Palm Island Community Corporation</p>
              <p className="text-sm text-green-200 mt-1">
                Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div className="bg-white border-b sticky top-0 z-10 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex gap-2">
              <Link
                href={`/reports/annual/${year}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                Government
              </Link>
              <Link
                href={`/reports/annual/${year}?template=community`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                Community
              </Link>
              <Link
                href={`/reports/annual/${year}?template=funder`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                Funder
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Executive Summary */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-green-600 pb-2">
            Executive Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <BarChart className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-green-600">{data.stories.total}</div>
              <div className="text-sm text-gray-600 mt-1">Stories Collected</div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-blue-600">{data.impact.totalPeopleReached}</div>
              <div className="text-sm text-gray-600 mt-1">People Reached</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <div className="text-4xl font-bold text-purple-600">{data.impact.servicesActive}</div>
              <div className="text-sm text-gray-600 mt-1">Active Services</div>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="text-4xl font-bold text-orange-600">{data.impact.communityEngagement}%</div>
              <div className="text-sm text-gray-600 mt-1">Community Engagement</div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              During {year}, Palm Island Community Corporation collected {data.stories.total} stories
              from our community, representing the voices, experiences, and knowledge of our people.
              Through our {data.impact.servicesActive} integrated services and {data.services.reduce((sum, s) => sum + s.staffCount, 0)} staff members,
              we reached {data.impact.totalPeopleReached.toLocaleString()} community members,
              providing culturally-appropriate support and building community strength.
            </p>
          </div>
        </section>

        {/* Service Delivery */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-green-600 pb-2">
            Service Delivery
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Service</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Staff</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Stories Collected</th>
                </tr>
              </thead>
              <tbody>
                {data.services.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{service.name}</td>
                    <td className="py-4 px-4 text-center text-gray-700">{service.staffCount}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        {service.storyCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-4 px-4 text-gray-900">Total</td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    {data.services.reduce((sum, s) => sum + s.staffCount, 0)}
                  </td>
                  <td className="py-4 px-4 text-center text-green-600">
                    {data.services.reduce((sum, s) => sum + s.storyCount, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Featured Stories */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-green-600 pb-2">
            Featured Stories
          </h2>

          <div className="space-y-6">
            {data.stories.featured.slice(0, 3).map((story, index) => (
              <div key={index} className="border-l-4 border-green-600 pl-6 py-4 bg-gray-50 rounded-r-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {story.summary}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600 italic">
                    — {story.storyteller?.display_name || story.storyteller?.full_name}
                  </p>
                  <Link
                    href={`/stories/${story.id}`}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Read full story →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/stories"
              className="inline-block text-green-600 hover:text-green-700 font-medium"
            >
              View all {data.stories.total} stories →
            </Link>
          </div>
        </section>

        {/* Impact by Category */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-green-600 pb-2">
            Stories by Theme
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.stories.byCategory).map(([category, count]) => (
              <div key={category} className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{count}</div>
                <div className="text-sm text-gray-600 capitalize mt-1">
                  {category.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Future Vision */}
        <section className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Looking Ahead</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            As we move into the next year, PICC remains committed to community-controlled development,
            cultural preservation, and providing world-class services to our people. Every story collected
            strengthens our community's voice and demonstrates the power of Indigenous self-determination.
          </p>
          <p className="text-gray-600 italic">
            Thank you to all community members who shared their stories in {year}. Your voices shape our future.
          </p>
        </section>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t-2 border-gray-200">
          <p className="text-gray-600">
            Generated by Palm Island Story Server • {new Date(data.metadata.generatedAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            100% Community Controlled • Manbarra & Bwgcolman Country
          </p>
        </div>
      </div>
    </div>
  )
}
