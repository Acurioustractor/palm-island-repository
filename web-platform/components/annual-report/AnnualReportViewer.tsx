'use client'

import { CompleteAnnualReport } from '@/lib/empathy-ledger/types-annual-report-content'
import { LeadershipMessages } from './LeadershipMessage'
import { BoardMembers } from './BoardMembers'
import { CulturalContentSections } from './CulturalContent'
import { Highlights } from './Highlights'
import { Statistics } from './Statistics'
import { Partners } from './Partners'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AnnualReportViewerProps {
  report: CompleteAnnualReport
  className?: string
}

export function AnnualReportViewer({ report, className }: AnnualReportViewerProps) {
  const {
    report: reportData,
    organization,
    leadership_messages = [],
    board_members = [],
    cultural_content = [],
    highlights = [],
    statistics = [],
    partners = []
  } = report

  return (
    <div className={cn('annual-report-container', className)}>
      {/* Cover Section */}
      <ReportCover report={reportData} organization={organization} />

      {/* Table of Contents */}
      <TableOfContents report={reportData} />

      {/* Acknowledgement of Country */}
      {cultural_content.filter(c => c.content_type === 'acknowledgement_of_country').length > 0 && (
        <div className="page-section">
          <CulturalContentSections
            contents={cultural_content.filter(c => c.content_type === 'acknowledgement_of_country')}
          />
        </div>
      )}

      {/* Leadership Messages */}
      {leadership_messages.length > 0 && (
        <div className="page-section bg-gradient-to-br from-blue-50 to-white">
          <div className="container mx-auto px-6 py-16">
            <LeadershipMessages messages={leadership_messages} />
          </div>
        </div>
      )}

      {/* Corporate Governance */}
      {board_members.length > 0 && (
        <div className="page-section">
          <div className="container mx-auto px-6 py-16">
            <BoardMembers members={board_members} layout="grid" />
          </div>
        </div>
      )}

      {/* Key Statistics */}
      {statistics.length > 0 && (
        <div className="page-section bg-gray-50">
          <div className="container mx-auto px-6 py-16">
            <Statistics statistics={statistics} layout="grid" />
          </div>
        </div>
      )}

      {/* Organizational Highlights */}
      {highlights.length > 0 && (
        <div className="page-section">
          <div className="container mx-auto px-6 py-16">
            <Highlights highlights={highlights} />
          </div>
        </div>
      )}

      {/* Additional Cultural Content */}
      {cultural_content.filter(c => c.content_type !== 'acknowledgement_of_country').length > 0 && (
        <div className="page-section bg-amber-50">
          <div className="container mx-auto px-6 py-16">
            <CulturalContentSections
              contents={cultural_content.filter(c => c.content_type !== 'acknowledgement_of_country')}
            />
          </div>
        </div>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <div className="page-section">
          <div className="container mx-auto px-6 py-16">
            <Partners partners={partners} layout="logos" />
          </div>
        </div>
      )}

      {/* Looking Forward */}
      {reportData.looking_forward && (
        <div className="page-section bg-gradient-to-br from-blue-900 to-blue-700 text-white">
          <div className="container mx-auto px-6 py-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Looking Forward</h2>
            <div className="prose prose-lg prose-invert max-w-4xl">
              {reportData.looking_forward.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-blue-50 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final Acknowledgments */}
      {reportData.acknowledgments && (
        <div className="page-section">
          <div className="container mx-auto px-6 py-16 text-center max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Acknowledgments</h2>
            <p className="text-gray-700 leading-relaxed">
              {reportData.acknowledgments}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <ReportFooter organization={organization} report={reportData} />
    </div>
  )
}

function ReportCover({
  report,
  organization
}: {
  report: CompleteAnnualReport['report']
  organization: CompleteAnnualReport['organization']
}) {
  const coverImage = report.cover_photo_url || report.cover_image_url
  const colors = report.theme_colors

  return (
    <div
      className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
      style={{
        background: colors
          ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
          : 'linear-gradient(135deg, #2C5F8D 0%, #1E3A5F 100%)'
      }}
    >
      {/* Background Image */}
      {coverImage && (
        <div className="absolute inset-0 opacity-30">
          <Image
            src={coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        {/* Logo */}
        {organization.logo_url && (
          <div className="mb-8 flex justify-center">
            <Image
              src={organization.logo_url}
              alt={organization.name}
              width={200}
              height={200}
              className="drop-shadow-2xl"
            />
          </div>
        )}

        {/* Organization Name */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
          {organization.name || organization.short_name}
        </h1>

        {/* Report Title */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 mt-12 border border-white/20">
          <p className="text-2xl md:text-3xl font-semibold mb-4">
            {report.report_year}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            ANNUAL REPORT
          </h2>
          {report.subtitle && (
            <p className="text-xl md:text-2xl opacity-90">
              {report.subtitle}
            </p>
          )}
        </div>

        {/* Cover Photo Credit */}
        {report.cover_photo_credit && (
          <p className="mt-8 text-sm opacity-75">
            {report.cover_photo_caption && `${report.cover_photo_caption} • `}
            Photo: {report.cover_photo_credit}
          </p>
        )}
      </div>

      {/* Decorative Pattern */}
      {report.cultural_design_elements?.patterns && (
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z" fill="white" />
          </svg>
        </div>
      )}
    </div>
  )
}

function TableOfContents({ report }: { report: CompleteAnnualReport['report'] }) {
  // Parse sections config to build TOC
  const sections = report.sections_config || []

  return (
    <div className="page-section bg-gray-50">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Contents</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {sections
            .filter((s: any) => s.enabled)
            .sort((a: any, b: any) => a.order - b.order)
            .map((section: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="capitalize text-gray-700 font-medium">
                  {section.type.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function ReportFooter({
  organization,
  report
}: {
  organization: CompleteAnnualReport['organization']
  report: CompleteAnnualReport['report']
}) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Organization Info */}
          <div>
            {organization.logo_url && (
              <Image
                src={organization.logo_url}
                alt={organization.name}
                width={150}
                height={150}
                className="mb-4"
              />
            )}
            <h3 className="text-xl font-bold mb-2">{organization.name}</h3>
            {organization.tagline && (
              <p className="text-gray-400 text-sm">{organization.tagline}</p>
            )}
          </div>

          {/* Traditional Country */}
          {organization.traditional_country && (
            <div>
              <h4 className="font-bold mb-2">Country</h4>
              <p className="text-gray-400">{organization.traditional_country}</p>
              {organization.language_groups && organization.language_groups.length > 0 && (
                <p className="text-gray-400 text-sm mt-2">
                  Languages: {organization.language_groups.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Report Info */}
          <div>
            <h4 className="font-bold mb-2">Report</h4>
            <p className="text-gray-400 text-sm">
              Reporting Period: {new Date(report.reporting_period_start).toLocaleDateString()} -{' '}
              {new Date(report.reporting_period_end).toLocaleDateString()}
            </p>
            {report.published_date && (
              <p className="text-gray-400 text-sm mt-2">
                Published: {new Date(report.published_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>
            © {report.report_year} {organization.name}. All rights reserved.
          </p>
          {organization.mission_statement && (
            <p className="mt-2 italic">{organization.mission_statement}</p>
          )}
        </div>
      </div>
    </footer>
  )
}
