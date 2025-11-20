'use client'

import Image from 'next/image'
import { ReportLeadershipMessage } from '@/lib/empathy-ledger/types-annual-report-content'
import { cn } from '@/lib/utils'

interface LeadershipMessageProps {
  message: ReportLeadershipMessage
  className?: string
}

export function LeadershipMessage({ message, className }: LeadershipMessageProps) {
  const {
    person_name,
    person_title,
    person_photo_url,
    message_title,
    message_content,
    featured_quote,
    layout_style = 'standard'
  } = message

  return (
    <section className={cn('annual-report-section', className)}>
      {/* Section Header */}
      <div className="mb-8">
        {message_title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {message_title}
          </h2>
        )}
      </div>

      {/* Layout: Photo Left */}
      {layout_style === 'photo_left' && (
        <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
          <LeadershipPhoto
            person_name={person_name}
            person_title={person_title}
            person_photo_url={person_photo_url}
          />
          <MessageContent
            content={message_content}
            featured_quote={featured_quote}
          />
        </div>
      )}

      {/* Layout: Photo Right */}
      {layout_style === 'photo_right' && (
        <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
          <MessageContent
            content={message_content}
            featured_quote={featured_quote}
          />
          <LeadershipPhoto
            person_name={person_name}
            person_title={person_title}
            person_photo_url={person_photo_url}
          />
        </div>
      )}

      {/* Layout: Standard (Top) */}
      {layout_style === 'standard' && (
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            {person_photo_url && (
              <div className="flex-shrink-0">
                <Image
                  src={person_photo_url}
                  alt={person_name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{person_name}</h3>
              {person_title && (
                <p className="text-lg text-gray-600 mt-1">{person_title}</p>
              )}
            </div>
          </div>
          <MessageContent
            content={message_content}
            featured_quote={featured_quote}
          />
        </div>
      )}

      {/* Layout: Full Width */}
      {layout_style === 'full_width' && (
        <div className="max-w-4xl mx-auto space-y-8">
          {person_photo_url && (
            <div className="flex justify-center">
              <Image
                src={person_photo_url}
                alt={person_name}
                width={200}
                height={200}
                className="rounded-full object-cover border-4 border-white shadow-xl"
              />
            </div>
          )}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">{person_name}</h3>
            {person_title && (
              <p className="text-lg text-gray-600 mt-2">{person_title}</p>
            )}
          </div>
          <MessageContent
            content={message_content}
            featured_quote={featured_quote}
          />
        </div>
      )}

      {/* Layout: Minimal */}
      {layout_style === 'minimal' && (
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="text-xl font-bold text-gray-900">{person_name}</h3>
            {person_title && (
              <p className="text-sm text-gray-600 mt-1">{person_title}</p>
            )}
          </div>
          <MessageContent
            content={message_content}
            featured_quote={featured_quote}
          />
        </div>
      )}
    </section>
  )
}

function LeadershipPhoto({
  person_name,
  person_title,
  person_photo_url
}: {
  person_name: string
  person_title?: string
  person_photo_url?: string
}) {
  return (
    <div className="sticky top-8">
      {person_photo_url && (
        <Image
          src={person_photo_url}
          alt={person_name}
          width={300}
          height={400}
          className="w-full rounded-lg object-cover shadow-xl mb-4"
        />
      )}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">{person_name}</h3>
        {person_title && (
          <p className="text-sm text-gray-600 mt-2 font-medium">{person_title}</p>
        )}
      </div>
    </div>
  )
}

function MessageContent({
  content,
  featured_quote
}: {
  content: string
  featured_quote?: string
}) {
  // Split content into paragraphs for better formatting
  const paragraphs = content.split('\n\n').filter(p => p.trim())

  return (
    <div className="prose prose-lg max-w-none">
      {paragraphs.map((paragraph, index) => {
        // Insert featured quote after first paragraph if it exists
        return (
          <div key={index}>
            <p className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
            {index === 0 && featured_quote && (
              <blockquote className="my-8 border-l-4 border-blue-600 pl-6 py-4 bg-blue-50 rounded-r-lg">
                <p className="text-xl italic text-gray-800 font-medium">
                  "{featured_quote}"
                </p>
              </blockquote>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Multiple leadership messages in a row
export function LeadershipMessages({
  messages,
  className
}: {
  messages: ReportLeadershipMessage[]
  className?: string
}) {
  if (!messages || messages.length === 0) {
    return null
  }

  // Sort by display order
  const sortedMessages = [...messages].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className={cn('space-y-16', className)}>
      {sortedMessages.map((message) => (
        <LeadershipMessage key={message.id} message={message} />
      ))}
    </div>
  )
}
