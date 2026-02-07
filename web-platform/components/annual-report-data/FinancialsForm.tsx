'use client';

import { useState, useMemo } from 'react';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

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

const CURRENCY_FIELDS: { key: keyof FinancialData; label: string; section: string; help?: string }[] = [
  { key: 'current_assets', label: 'Current Assets', section: 'Balance Sheet', help: 'Cash, receivables, and other assets expected to convert to cash within 12 months' },
  { key: 'non_current_assets', label: 'Non-Current Assets', section: 'Balance Sheet', help: 'Property, equipment, and long-term investments' },
  { key: 'current_liabilities', label: 'Current Liabilities', section: 'Balance Sheet', help: 'Debts and obligations due within 12 months' },
  { key: 'non_current_liabilities', label: 'Non-Current Liabilities', section: 'Balance Sheet', help: 'Long-term debts and obligations' },
  { key: 'total_income', label: 'Total Income', section: 'Income & Expenditure', help: 'All revenue including grants, fees, and other income' },
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

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Non-negative check for currency fields
    for (const field of CURRENCY_FIELDS) {
      const val = formData[field.key];
      if (typeof val === 'number' && val < 0) {
        errs[field.key] = 'Value cannot be negative';
      }
    }

    // Audit conditional requirements
    if (formData.audited) {
      if (!formData.auditor_name?.trim()) {
        errs.auditor_name = 'Required when audited';
      }
      if (!formData.audit_date) {
        errs.audit_date = 'Required when audited';
      }
    }

    return errs;
  }, [formData]);

  // Warnings (non-blocking)
  const warnings = useMemo(() => {
    const warns: string[] = [];
    const totalExpenditure = (formData.labour_costs || 0) + (formData.administration_expenses || 0) +
      (formData.property_energy_expenses || 0) + (formData.motor_vehicle_expenses || 0) +
      (formData.travel_training_expenses || 0) + (formData.client_related_costs || 0);

    if (formData.total_income && totalExpenditure > formData.total_income) {
      warns.push('Total expenditure exceeds total income — this results in a deficit');
    }
    return warns;
  }, [formData]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;

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
      {/* Error summary */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</div>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {Object.entries(errors).map(([key, msg]) => (
              <li key={key}>{CURRENCY_FIELDS.find(f => f.key === key)?.label || key}: {msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            {warnings.map((w, i) => (
              <div key={i} className="text-sm text-amber-800">{w}</div>
            ))}
          </div>
        </div>
      )}

      {sections.map(section => (
        <div key={section}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
            {section}
            <HelpTooltip content={
              section === 'Balance Sheet'
                ? 'Assets, liabilities, and net position at fiscal year end'
                : 'Revenue and expenses for the fiscal year period'
            } />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CURRENCY_FIELDS.filter(f => f.section === section).map(field => {
              const fieldError = errors[field.key];
              return (
                <div key={field.key}>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.help && <HelpTooltip content={field.help} />}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData[field.key] !== null && formData[field.key] !== undefined ? formData[field.key]!.toString() : ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                        fieldError
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                          : 'border-gray-200 focus:border-purple-400 focus:ring-purple-400'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {fieldError && (
                    <p className="text-xs text-red-600 mt-1">{fieldError}</p>
                  )}
                </div>
              );
            })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auditor Name {formData.audited && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.auditor_name || ''}
              onChange={e => setFormData(prev => ({ ...prev, auditor_name: e.target.value || null }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                errors.auditor_name
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-gray-200 focus:border-purple-400'
              }`}
              placeholder="Auditor name"
            />
            {errors.auditor_name && (
              <p className="text-xs text-red-600 mt-1">{errors.auditor_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audit Date {formData.audited && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={formData.audit_date || ''}
              onChange={e => setFormData(prev => ({ ...prev, audit_date: e.target.value || null }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                errors.audit_date
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-gray-200 focus:border-purple-400'
              }`}
            />
            {errors.audit_date && (
              <p className="text-xs text-red-600 mt-1">{errors.audit_date}</p>
            )}
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
          disabled={saving || hasErrors}
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
