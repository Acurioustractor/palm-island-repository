'use client';

import Link from 'next/link';
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';
import { getServiceIconByName } from '@/lib/services/service-icons';

interface Source {
  title: string;
  url?: string;
  type?: string;
}

const TYPE_ICONS: Record<string, BespokeIconName> = {
  story: 'story',
  person: 'person',
  knowledge: 'knowledge',
  media: 'photo',
  service: 'community',
  financial: 'economic',
  quote: 'quote',
  interview: 'audio',
};

const TYPE_COLORS: Record<string, string> = {
  story: 'bg-warm-100 border-warm-200 text-picc-earth',
  person: 'bg-sage-50 border-sage-200 text-sage-700',
  knowledge: 'bg-warm-50 border-picc-ochre-200 text-picc-ochre-700',
  media: 'bg-picc-ochre-50 border-picc-ochre-200 text-picc-ochre-800',
  service: 'bg-warm-50 border-warm-200 text-picc-earth',
  financial: 'bg-warm-50 border-warm-200 text-picc-earth',
  quote: 'bg-warm-100 border-picc-ochre-200 text-picc-ochre-700',
  interview: 'bg-sage-50 border-sage-200 text-sage-700',
};

const TYPE_LABELS: Record<string, string> = {
  story: 'Story',
  person: 'Person',
  knowledge: 'Knowledge',
  media: 'Media',
  service: 'Service',
  financial: 'Financial',
  quote: 'Quote',
  interview: 'Interview',
};

interface ChatSourceCardsProps {
  sources: Source[];
  compact?: boolean;
  className?: string;
}

export default function ChatSourceCards({ sources, compact = false, className = '' }: ChatSourceCardsProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-xs font-semibold text-picc-earth-300 uppercase tracking-wider mb-2">
        Sources
      </p>
      <div className={`flex ${compact ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
        {sources.map((source, idx) => {
          const type = source.type || 'knowledge';
          const icon: BespokeIconName = type === 'service'
            ? getServiceIconByName(source.title)
            : (TYPE_ICONS[type] || 'search');
          const colors = TYPE_COLORS[type] || TYPE_COLORS.knowledge;
          const label = TYPE_LABELS[type] || type;

          const card = (
            <div
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${colors} transition-all hover:shadow-sm ${compact ? 'text-xs' : 'text-sm'} whitespace-nowrap`}
            >
              <BespokeIcon name={icon} size={compact ? 18 : 22} />
              <span className="font-medium truncate max-w-[200px]">{source.title}</span>
              <span className={`${compact ? 'hidden' : 'inline'} opacity-50 text-xs`}>{label}</span>
            </div>
          );

          if (source.url) {
            return (
              <Link key={idx} href={source.url} className="hover:opacity-80 transition-opacity">
                {card}
              </Link>
            );
          }

          return <div key={idx}>{card}</div>;
        })}
      </div>
    </div>
  );
}
