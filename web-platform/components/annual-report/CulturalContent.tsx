'use client'

import Image from 'next/image'
import { ReportCulturalContent } from '@/lib/empathy-ledger/types-annual-report-content'
import { cn } from '@/lib/utils'

interface CulturalContentProps {
  content: ReportCulturalContent
  className?: string
}

export function CulturalContent({ content, className }: CulturalContentProps) {
  const {
    content_type,
    title,
    content: text,
    language,
    language_translation,
    artwork_image_url,
    artwork_title,
    artist_name,
    artwork_description,
    artwork_copyright
  } = content

  // Special styling for Acknowledgement of Country
  if (content_type === 'acknowledgement_of_country') {
    return (
      <AcknowledgementOfCountry
        title={title}
        content={text}
        language={language}
        language_translation={language_translation}
        artwork_image_url={artwork_image_url}
        className={className}
      />
    )
  }

  // Cultural artwork with description
  if (content_type === 'cultural_artwork_description' && artwork_image_url) {
    return (
      <CulturalArtwork
        artwork_image_url={artwork_image_url}
        artwork_title={artwork_title}
        artist_name={artist_name}
        artwork_description={artwork_description}
        artwork_copyright={artwork_copyright}
        className={className}
      />
    )
  }

  // Standard cultural content
  return (
    <section className={cn('annual-report-section', className)}>
      {title && (
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      )}

      <div className="prose prose-lg max-w-none">
        {text.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      {language && language_translation && (
        <div className="mt-8 border-l-4 border-amber-500 pl-6 py-4 bg-amber-50 rounded-r-lg">
          <p className="text-lg italic text-gray-800 font-medium mb-2">
            {language}
          </p>
          <p className="text-gray-600">
            {language_translation}
          </p>
        </div>
      )}
    </section>
  )
}

function AcknowledgementOfCountry({
  title,
  content,
  language,
  language_translation,
  artwork_image_url,
  className
}: {
  title?: string
  content: string
  language?: string
  language_translation?: string
  artwork_image_url?: string
  className?: string
}) {
  return (
    <section className={cn('annual-report-section py-12', className)}>
      <div className="relative">
        {/* Decorative Border */}
        <div className="absolute inset-0 border-t-4 border-b-4 border-amber-600 opacity-20"></div>

        {/* Content */}
        <div className="relative py-8 px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            {/* Traditional Artwork/Pattern */}
            {artwork_image_url && (
              <div className="mb-8 flex justify-center">
                <Image
                  src={artwork_image_url}
                  alt="Cultural artwork"
                  width={200}
                  height={200}
                  className="rounded-full"
                />
              </div>
            )}

            {/* Title */}
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6">
                {title}
              </h2>
            )}

            {/* Acknowledgement Text */}
            <div className="text-center space-y-4">
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Traditional Language */}
            {language && language_translation && (
              <div className="mt-8 text-center">
                <p className="text-xl italic text-amber-800 font-medium mb-2">
                  {language}
                </p>
                <p className="text-gray-600">
                  {language_translation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CulturalArtwork({
  artwork_image_url,
  artwork_title,
  artist_name,
  artwork_description,
  artwork_copyright,
  className
}: {
  artwork_image_url: string
  artwork_title?: string
  artist_name?: string
  artwork_description?: string
  artwork_copyright?: string
  className?: string
}) {
  return (
    <section className={cn('annual-report-section', className)}>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Artwork Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
          <Image
            src={artwork_image_url}
            alt={artwork_title || 'Cultural artwork'}
            fill
            className="object-cover"
          />
        </div>

        {/* Artwork Details */}
        <div className="space-y-4">
          {artwork_title && (
            <h2 className="text-3xl font-bold text-gray-900">
              {artwork_title}
            </h2>
          )}

          {artist_name && (
            <p className="text-lg font-medium text-blue-600">
              Artist: {artist_name}
            </p>
          )}

          {artwork_description && (
            <div className="prose prose-lg">
              {artwork_description.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {artwork_copyright && (
            <p className="text-sm text-gray-500 italic mt-6">
              {artwork_copyright}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// Display multiple cultural content pieces
export function CulturalContentSections({
  contents,
  className
}: {
  contents: ReportCulturalContent[]
  className?: string
}) {
  if (!contents || contents.length === 0) {
    return null
  }

  const sortedContents = [...contents].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className={cn('space-y-16', className)}>
      {sortedContents.map((content) => (
        <CulturalContent key={content.id} content={content} />
      ))}
    </div>
  )
}
