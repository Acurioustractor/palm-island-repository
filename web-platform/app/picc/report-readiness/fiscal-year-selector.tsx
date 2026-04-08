'use client'

import { useRouter } from 'next/navigation'

interface FiscalYearOption {
  value: string
  label: string
}

interface FiscalYearSelectorProps {
  currentYear: string
  options: FiscalYearOption[]
}

export function FiscalYearSelector({ currentYear, options }: FiscalYearSelectorProps) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/picc/report-readiness?fy=${e.target.value}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="fy" className="text-sm font-medium text-gray-700">Fiscal Year:</label>
      <select 
        id="fy" 
        name="fy" 
        value={currentYear}
        onChange={handleChange}
        className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre focus:border-picc-ochre bg-white"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
