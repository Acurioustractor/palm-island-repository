import { StatHero } from './web'
import type { StatHeroProps } from './types'

export const sampleProps: StatHeroProps = {
  value: '17,488',
  label: 'Episodes of Care',
  caption: 'Bwgcolman Healing Service · FY24-25',
  tint: 'health',
}

export default function Sample() {
  return (
    <div className="flex flex-wrap gap-lg bg-brand-shell p-xl rounded-lg">
      <StatHero {...sampleProps} />
      <StatHero
        value="6,698"
        label="Placement Nights"
        caption="Family Care · kept with kin"
        tint="family"
      />
      <StatHero
        value="3×"
        label="NDIS Service Growth"
        caption="FY23-24 → FY24-25"
        tint="youth"
      />
      <StatHero
        value="1st"
        label="in Queensland"
        caption="Delegated Authority — Bwgcolman Way"
        tint="justice"
      />
    </div>
  )
}
