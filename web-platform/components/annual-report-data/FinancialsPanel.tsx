'use client';

import FinancialsForm from './FinancialsForm';

interface FinancialsPanelProps {
  initialData: any;
  fiscalYear: number;
  onSave: (data: any) => Promise<void>;
}

export default function FinancialsPanel({
  initialData,
  fiscalYear,
  onSave,
}: FinancialsPanelProps) {
  return (
    <div className="max-w-4xl">
      <p className="text-sm text-gray-600 mb-4">
        Balance sheet, income &amp; expenditure, and audit status.
      </p>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FinancialsForm
          key={fiscalYear}
          initialData={initialData}
          fiscalYear={fiscalYear}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
