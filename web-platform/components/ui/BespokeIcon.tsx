import Image from 'next/image'
import { assetUrl } from '@/lib/media/asset-url'

export type BespokeIconName =
  // Services
  | 'health' | 'family' | 'children' | 'justice' | 'crisis' | 'digital'
  | 'economic' | 'education' | 'youth' | 'aged-care' | 'community'
  | 'governance' | 'housing' | 'sport' | 'mental-health' | 'disability'
  // Media types
  | 'photo' | 'video' | 'audio' | 'story' | 'person' | 'collection'
  // Sentiments
  | 'positive' | 'inspiring' | 'reflective' | 'grateful' | 'hopeful'
  | 'determined' | 'proud'
  // Cultural protocols
  | 'traditional-knowledge' | 'public' | 'community-only' | 'restricted'
  // General
  | 'land' | 'culture' | 'knowledge' | 'timeline' | 'quote' | 'vision'
  | 'campfire' | 'ocean' | 'search'

interface BespokeIconProps {
  name: BespokeIconName
  size?: number
  darkMode?: boolean
  className?: string
}

export function BespokeIcon({ name, size = 24, darkMode = false, className = '' }: BespokeIconProps) {
  return (
    <Image
      src={assetUrl(`/icons/bespoke/${name}.png`)}
      alt=""
      width={size}
      height={size}
      className={className}
      style={darkMode
        ? { filter: 'invert(1)', mixBlendMode: 'screen' }
        : { mixBlendMode: 'multiply' }
      }
      aria-hidden="true"
    />
  )
}
