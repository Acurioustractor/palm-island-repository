/**
 * Remotion Root — registers all PICC video compositions.
 * Used by `npx remotion studio` and Lambda rendering.
 */

import React from 'react'
import { Composition } from 'remotion'
import { ImpactSummary } from './compositions/ImpactSummary'
import type { ImpactSummaryProps } from './compositions/ImpactSummary'
import { VIDEO } from './theme'

const LOGO = '/logo/picc-logo-full.png'

const HERO_PHOTOS = [
  '/hero-assets/stills/palm-sunset-pier.jpg',
  '/hero-assets/stills/waterfall-landscape.jpg',
  '/hero-assets/stills/kids-beach-palm.jpg',
  '/hero-assets/stills/memorial-gathering.jpg',
  '/hero-assets/stills/centre-youth-landscaping.jpg',
  '/hero-assets/stills/pier-turquoise.jpg',
  '/hero-assets/stills/daycare-playground.jpg',
  '/hero-assets/stills/mountain-valley.jpg',
]

const defaultImpactProps: ImpactSummaryProps = {
  title: 'Impact Summary',
  subtitle: 'Making Palm Island a safer, stronger and more prosperous place to live.',
  year: '2024-25',
  orgName: 'Palm Island Community Company',
  logoUrl: LOGO,
  photos: HERO_PHOTOS,
  stats: [
    { label: 'Community Members Served', value: '2,847' },
    { label: 'Programs Delivered', value: '8' },
    { label: 'Staff Employed', value: '197' },
    { label: 'Stories Captured', value: '340+' },
  ],
  quote: {
    text: 'This place has given my family hope again. The kids are going to school, and I feel supported.',
    author: 'Community Member',
  },
}

// Total duration: 5+5+15+15+12+8 = 60 seconds
const TOTAL_FRAMES = VIDEO.fps * 60

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ImpactSummary"
        component={ImpactSummary as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={defaultImpactProps}
      />
    </>
  )
}
