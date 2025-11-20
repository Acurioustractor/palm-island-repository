'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReportPartner } from '@/lib/empathy-ledger/types-annual-report-content'
import { cn } from '@/lib/utils'

interface PartnersProps {
  partners: ReportPartner[]
  className?: string
  layout?: 'logos' | 'detailed'
}

export function Partners({ partners, className, layout = 'logos' }: PartnersProps) {
  if (!partners || partners.length === 0) {
    return null
  }

  const sortedPartners = [...partners].sort((a, b) => a.display_order - b.display_order)

  return (
    <section className={cn('annual-report-section', className)}>
      {/* Section Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Partners
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          PICC could not do all that we do without the help of our partners.
          Some of the organisations with which we worked and collaborated are:
        </p>
      </div>

      {/* Logo Grid Layout */}
      {layout === 'logos' && (
        <PartnerLogosGrid partners={sortedPartners} />
      )}

      {/* Detailed List Layout */}
      {layout === 'detailed' && (
        <PartnerDetailedList partners={sortedPartners} />
      )}
    </section>
  )
}

function PartnerLogosGrid({ partners }: { partners: ReportPartner[] }) {
  // Group partners by partnership level
  const majorFunders = partners.filter(p => p.partnership_level === 'major_funder')
  const keyPartners = partners.filter(p => p.partnership_level === 'key_partner')
  const collaborators = partners.filter(p =>
    ['collaborator', 'supporter', 'in_kind'].includes(p.partnership_level)
  )

  return (
    <div className="space-y-12">
      {/* Major Funders - Larger logos */}
      {majorFunders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Major Funders
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {majorFunders.map((partner) => (
              <PartnerLogo key={partner.id} partner={partner} size="large" />
            ))}
          </div>
        </div>
      )}

      {/* Key Partners */}
      {keyPartners.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Key Partners
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {keyPartners.map((partner) => (
              <PartnerLogo key={partner.id} partner={partner} size="medium" />
            ))}
          </div>
        </div>
      )}

      {/* Collaborators & Supporters */}
      {collaborators.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Collaborators & Supporters
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {collaborators.map((partner) => (
              <PartnerLogoOrName key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PartnerLogo({
  partner,
  size = 'medium'
}: {
  partner: ReportPartner
  size?: 'small' | 'medium' | 'large'
}) {
  const { partner_name, logo_url, website } = partner

  const sizeClasses = {
    small: 'h-12',
    medium: 'h-16',
    large: 'h-24'
  }

  const content = logo_url ? (
    <div className={cn('relative w-full flex items-center justify-center p-4', sizeClasses[size])}>
      <Image
        src={logo_url}
        alt={partner_name}
        fill
        className="object-contain"
      />
    </div>
  ) : (
    <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
      <span className="text-sm font-medium text-gray-700 text-center">
        {partner_name}
      </span>
    </div>
  )

  if (website) {
    return (
      <Link
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {content}
    </div>
  )
}

function PartnerLogoOrName({ partner }: { partner: ReportPartner }) {
  const { partner_name, logo_url, should_display_logo } = partner

  // Show name only if no logo or explicitly set not to display logo
  if (!logo_url || !should_display_logo) {
    return (
      <span className="inline-block text-gray-700 px-3 py-1">
        • {partner_name}
      </span>
    )
  }

  return <PartnerLogo partner={partner} size="small" />
}

function PartnerDetailedList({ partners }: { partners: ReportPartner[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {partners.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  )
}

function PartnerCard({ partner }: { partner: ReportPartner }) {
  const {
    partner_name,
    logo_url,
    website,
    description,
    contribution_description,
    partnership_area,
    relationship_years
  } = partner

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Logo */}
      {logo_url && (
        <div className="relative h-16 mb-4">
          <Image
            src={logo_url}
            alt={partner_name}
            fill
            className="object-contain object-left"
          />
        </div>
      )}

      {/* Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {partner_name}
      </h3>

      {/* Partnership Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {partnership_area && (
          <p>
            <span className="font-medium">Partnership Area:</span> {partnership_area}
          </p>
        )}
        {relationship_years && relationship_years > 0 && (
          <p>
            <span className="font-medium">Partnership Duration:</span> {relationship_years} years
          </p>
        )}
      </div>

      {/* Description */}
      {(description || contribution_description) && (
        <p className="text-gray-700 leading-relaxed mb-4">
          {contribution_description || description}
        </p>
      )}

      {/* Website Link */}
      {website && (
        <Link
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
        >
          Visit Website
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      )}
    </div>
  )
}

// Simple text list for compact displays
export function PartnersList({
  partners,
  className
}: {
  partners: ReportPartner[]
  className?: string
}) {
  if (!partners || partners.length === 0) {
    return null
  }

  const sortedPartners = [...partners].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className={cn('', className)}>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Our Partners</h3>
      <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2">
        {sortedPartners.map((partner) => (
          <li key={partner.id} className="text-gray-700">
            • {partner.partner_name}
          </li>
        ))}
      </ul>
    </div>
  )
}
