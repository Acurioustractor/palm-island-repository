import { ServiceCompactTile } from './web'

export default function Sample() {
  return (
    <div className="grid grid-cols-2 gap-md w-full max-w-2xl">
      <ServiceCompactTile
        name="Bwgcolman Healing Service"
        description="Cultural healing and connection programs led by Bwgcolman Elders."
        tint="family"
        staffCount={10}
        clientsCount={450}
      />
      <ServiceCompactTile
        name="Family Wellbeing Centre"
        description="Comprehensive family support — child safety, DFV response, parenting."
        tint="family"
        staffCount={7}
        clientsCount={380}
      />
      <ServiceCompactTile
        name="NDIS Service"
        description="Disability supports for Palm Island participants — 3× growth FY24-25."
        tint="health"
        staffCount={12}
      />
      <ServiceCompactTile
        name="Cultural Education"
        description="Language, kinship, and Country-based learning."
        tint="education"
      />
    </div>
  )
}
