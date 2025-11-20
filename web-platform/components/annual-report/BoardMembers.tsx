'use client'

import Image from 'next/image'
import { ReportBoardMember } from '@/lib/empathy-ledger/types-annual-report-content'
import { cn } from '@/lib/utils'

interface BoardMembersProps {
  members: ReportBoardMember[]
  className?: string
  layout?: 'grid' | 'list'
}

export function BoardMembers({ members, className, layout = 'grid' }: BoardMembersProps) {
  if (!members || members.length === 0) {
    return null
  }

  // Sort by display order
  const sortedMembers = [...members].sort((a, b) => a.display_order - b.display_order)

  return (
    <section className={cn('annual-report-section', className)}>
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Corporate Governance
        </h2>
        <p className="text-lg text-gray-600">
          Members of the Board
        </p>
      </div>

      {/* Grid Layout */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedMembers.map((member) => (
            <BoardMemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {/* List Layout */}
      {layout === 'list' && (
        <div className="space-y-6">
          {sortedMembers.map((member) => (
            <BoardMemberListItem key={member.id} member={member} />
          ))}
        </div>
      )}
    </section>
  )
}

function BoardMemberCard({ member }: { member: ReportBoardMember }) {
  const { full_name, position, photo_url, bio } = member

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Photo */}
      {photo_url ? (
        <div className="aspect-[3/4] relative bg-gray-200">
          <Image
            src={photo_url}
            alt={full_name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <div className="text-6xl font-bold text-blue-300">
            {full_name.charAt(0)}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {full_name}
        </h3>
        <p className="text-sm font-medium text-blue-600 mb-3">
          {position}
        </p>
        {bio && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {bio}
          </p>
        )}
      </div>
    </div>
  )
}

function BoardMemberListItem({ member }: { member: ReportBoardMember }) {
  const { full_name, position, photo_url, bio } = member

  return (
    <div className="flex gap-6 items-start bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      {/* Photo */}
      {photo_url ? (
        <Image
          src={photo_url}
          alt={full_name}
          width={120}
          height={120}
          className="rounded-full object-cover flex-shrink-0 border-4 border-gray-100"
        />
      ) : (
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
          <span className="text-4xl font-bold text-blue-400">
            {full_name.charAt(0)}
          </span>
        </div>
      )}

      {/* Details */}
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {full_name}
        </h3>
        <p className="text-sm font-medium text-blue-600 mb-3">
          {position}
        </p>
        {bio && (
          <p className="text-gray-600 leading-relaxed">
            {bio}
          </p>
        )}
      </div>
    </div>
  )
}

// Simple bullet list for sidebar/summary
export function BoardMembersList({
  members,
  className
}: {
  members: ReportBoardMember[]
  className?: string
}) {
  if (!members || members.length === 0) {
    return null
  }

  const sortedMembers = [...members].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Members of the Board
      </h3>
      <ul className="space-y-2">
        {sortedMembers.map((member) => (
          <li key={member.id} className="text-gray-700">
            <span className="font-semibold">{member.full_name}</span>
            <span className="text-gray-500">, {member.position}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
