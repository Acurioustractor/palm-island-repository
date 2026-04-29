import { FinancialBars } from './web'

export default function Sample() {
  return (
    <FinancialBars
      header="EXPENDITURE ACROSS THE REEF · FY24-25"
      rows={[
        { label: 'Children & Families', display: '$11.2M', ratio: 0.92, tint: 'family' },
        { label: 'Health & Wellbeing', display: '$8.4M', ratio: 0.69, tint: 'health' },
        { label: 'Justice & Safety', display: '$5.1M', ratio: 0.42, tint: 'justice' },
        { label: 'Education & Community', display: '$3.7M', ratio: 0.30, tint: 'education' },
        { label: 'Youth', display: '$2.6M', ratio: 0.21, tint: 'youth' },
      ]}
    />
  )
}
