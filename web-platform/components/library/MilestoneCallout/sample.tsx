import { MilestoneCallout } from './web'

export default function Sample() {
  return (
    <div className="flex flex-col gap-md">
      <MilestoneCallout
        value="1st"
        description="in Queensland. PICC granted Delegated Authority for child protection — the first ATSICCO under Child Protection Act 1999, Part 2A."
      />
      <MilestoneCallout
        value="3×"
        description="growth in NDIS Service participants between FY23-24 and FY24-25."
        background="education"
        valueTint="white"
      />
    </div>
  )
}
