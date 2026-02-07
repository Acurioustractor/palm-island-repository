'use client';

import { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';

interface FinancialData {
  current_assets: number | null;
  non_current_assets: number | null;
  current_liabilities: number | null;
  non_current_liabilities: number | null;
  total_income: number | null;
  labour_costs: number | null;
  administration_expenses: number | null;
  property_energy_expenses: number | null;
  motor_vehicle_expenses: number | null;
  travel_training_expenses: number | null;
  client_related_costs: number | null;
  audited: boolean;
  auditor_name: string | null;
  audit_date: string | null;
  notes: string | null;
}

interface FinancialsFormProps {
  initialData: Partial<FinancialData> | null;
  fiscalYear: number;
  onSave: (data: FinancialData & { fiscal_year: number }) => Promise<void>;
}

const CURRENCY_FIELDS: { key: keyof FinancialData; label: string; section: string }[] = [
  { key: 'current_assets', label: 'Current Assets', section: 'Balance Sheet' },
  { key: 'non_current_assets', label: 'Non-Current Assets', section: 'Balance Sheet' },
  { key: 'current_liabilities', label: 'Current Liabilities', section: 'Balance Sheet' },
  { key: 'non_current_liabilities', label: 'Non-Current Liabilities', section: 'Balance Sheet' },
  { key: 'total_income', label: 'Total Income', section: 'Income & Expenditure' },
  { key: 'labour_costs', label: 'Labour Costs', section: 'Income & Expenditure' },
  { key: 'administration_expenses', label: 'Administration Expenses', section: 'Income & Expenditure' },
  { key: 'property_energy_expenses', label: 'Property & Energy Expenses', section: 'Income & Expenditure' },
  { key: 'motor_vehicle_expenses', label: 'Motor Vehicle Expenses', section: 'Income & Expenditure' },
  { key: 'travel_training_expenses', label: 'Travel & Training Expenses', section: 'Income & Expenditure' },
  { key: 'client_related_costs', label: 'Client Related Costs', section: 'Income & Expenditure' },
];

export default function FinancialsForm({ initialData, fiscalYear, onSave }: FinancialsFormProps) {
  const [formData, setFormData] = useState<Partial<FinancialData>>({
    current_assets: null,
    non_current_assets: null,
    current_liabilities: null,
    non_current_liabilities: null,
    total_income: null,
    labour_costs: null,
    administration_expenses: null,
    property_energy_expenses: null,
    motor_vehicle_expenses: null,
    travel_training_expenses: null,
    client_related_costs: null,
    audited: false,
    auditor_name: null,
    audit_date: null,
    notes: null,
    ...initialData,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof FinancialData, value: string | boolean) => {
    if (typeof value === 'boolean') {
      setFormData(prev => ({ ...prev, [key]: value }));
    } else {
      const numValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({ ...prev, [key]: numValue }));
    }
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        fiscal_year: fiscalYear,
        current_assets: formData.current_assets ?? null,
        non_current_assets: formData.non_current_assets ?? null,
        current_liabilities: formData.current_liabilities ?? null,
        non_current_liabilities: formData.non_current_liabilities ?? null,
        total_income: formData.total_income ?? null,
        labour_costs: formData.labour_costs ?? null,
        administration_expenses: formData.administration_expenses ?? null,
        property_energy_expenses: formData.property_energy_expenses ?? null,
        motor_vehicle_expenses: formData.motor_vehicle_expenses ?? null,
        travel_training_expenses: formData.travel_training_expenses ?? null,
        client_related_costs: formData.client_related_costs ?? null,
        audited: formData.audited ?? false,
        auditor_name: formData.auditor_name ?? null,
        audit_date: formData.audit_date ?? null,
        notes: formData.notes ?? null,
      });
      setSaved(true);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Computed totals
  const totalAssets = (formData.current_assets || 0) + (formData.non_current_assets || 0);
  const totalLiabilities = (formData.current_liabilities || 0) + (formData.non_current_liabilities || 0);
  const netAssets = totalAssets - totalLiabilities;
  const totalExpenditure = (formData.labour_costs || 0) + (formData.administration_expenses || 0) +
    (formData.property_energy_expenses || 0) + (formData.motor_vehicle_expenses || 0) +
    (formData.travel_training_expenses || 0) + (formData.client_related_costs || 0);
  const netSurplus = (formData.total_income || 0) - totalExpenditure;

  const sections = Array.from(new Set(CURRENCY_FIELDS.map(f => f.section)));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {sections.map(section => (
        <div key={section}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {section}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CURRENCY_FIELDS.filter(f => f.section === section).map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData[field.key] !== null && formData[field.key] !== undefined ? formData[field.key]!.toString() : ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Computed totals */}
          {section === 'Balance Sheet' && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Total Assets</div>
                <div className="text-lg font-bold text-gray-900">${totalAssets.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Total Liabilities</div>
                <div className="text-lg font-bold text-gray-900">${totalLiabilities.toLocaleString()}</div>
              </div>
              <div className={`rounded-lg p-3 ${netAssets >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-500">Net Assets</div>
                <div className={`text-lg font-bold ${netAssets >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  ${netAssets.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {section === 'Income & Expenditure' && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Total Income</div>
                <div className="text-lg font-bold text-gray-900">${(formData.total_income || 0).toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Total Expenditure</div>
                <div className="text-lg font-bold text-gray-900">${totalExpenditure.toLocaleString()}</div>
              </div>
              <div className={`rounded-lg p-3 ${netSurplus >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-500">Net Surplus/Deficit</div>
                <div className={`text-lg font-bold ${netSurplus >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  ${netSurplus.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Audit section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Audit Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="audited"
              checked={formData.audited || false}
              onChange={e => handleChange('audited', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="audited" className="text-sm font-medium text-gray-700">
              Audited
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditor Name</label>
            <input
              type="text"
              value={formData.auditor_name || ''}
              onChange={e => setFormData(prev => ({ ...prev, auditor_name: e.target.value || null }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none"
              placeholder="Auditor name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audit Date</label>
            <input
              type="date"
              value={formData.audit_date || ''}
              onChange={e => setFormData(prev => ({ ...prev, audit_date: e.target.value || null }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value || null }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none"
          placeholder="Additional notes..."
        />
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Financials
            </>
          )}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-emerald-600 text-sm">
            <CheckCircle className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
