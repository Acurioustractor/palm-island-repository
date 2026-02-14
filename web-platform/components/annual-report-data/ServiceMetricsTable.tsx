'use client';

import { useState, useCallback } from 'react';
import { CheckCircle, Circle, Copy, Save } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

interface ServiceMetric {
  organization_service_id: string;
  service_name: string;
  service_slug: string | null;
  service_category: string | null;
  metrics: {
    id?: string;
    clients_served: number | null;
    sessions_delivered: number | null;
    events_held: number | null;
    staff_count: number | null;
    key_achievement: string | null;
    headline_stat_value: string | null;
    headline_stat_label: string | null;
  } | null;
}

interface CellChangeInfo {
  serviceId: string;
  field: string;
  previousValue: any;
  newValue: any;
}

interface ServiceMetricsTableProps {
  services: ServiceMetric[];
  fiscalYear: number;
  previousYearServices?: ServiceMetric[];
  onSave: (data: {
    organization_service_id: string;
    fiscal_year: number;
    [key: string]: any;
  }) => Promise<void>;
  onCellSaved?: (info: CellChangeInfo) => void;
}

export default function ServiceMetricsTable({
  services,
  fiscalYear,
  previousYearServices,
  onSave,
  onCellSaved,
}: ServiceMetricsTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [localData, setLocalData] = useState<Record<string, any>>({});

  const getMetricValue = (svc: ServiceMetric, field: string) => {
    const local = localData[`${svc.organization_service_id}.${field}`];
    if (local !== undefined) return local;
    return svc.metrics ? (svc.metrics as any)[field] : null;
  };

  const handleCellClick = (serviceId: string, field: string, currentValue: any) => {
    const key = `${serviceId}.${field}`;
    setEditingCell(key);
    setEditValue(currentValue?.toString() || '');
  };

  const handleBlur = useCallback(async (serviceId: string, field: string) => {
    const key = `${serviceId}.${field}`;
    setEditingCell(null);

    const numericFields = ['clients_served', 'sessions_delivered', 'events_held', 'staff_count'];
    const newValue = numericFields.includes(field)
      ? (editValue ? parseInt(editValue) : null)
      : (editValue || null);

    // Capture previous value before overwriting
    const previousValue = localData[key] !== undefined
      ? localData[key]
      : (() => {
          const svc = services.find(s => s.organization_service_id === serviceId);
          return svc?.metrics ? (svc.metrics as any)[field] : null;
        })();

    // Skip save if value hasn't changed
    if (previousValue === newValue) return;

    setLocalData(prev => ({ ...prev, [key]: newValue }));
    setSaving(serviceId);

    try {
      await onSave({
        organization_service_id: serviceId,
        fiscal_year: fiscalYear,
        [field]: newValue,
      });
      onCellSaved?.({ serviceId, field, previousValue, newValue });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(null);
    }
  }, [editValue, fiscalYear, onSave, onCellSaved, localData, services]);

  const handleKeyDown = (e: React.KeyboardEvent, serviceId: string, field: string) => {
    if (e.key === 'Enter') {
      handleBlur(serviceId, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const copyFromLastYear = async (svc: ServiceMetric) => {
    if (!previousYearServices) return;
    const prev = previousYearServices.find(
      p => p.organization_service_id === svc.organization_service_id
    );
    if (!prev?.metrics) return;

    setSaving(svc.organization_service_id);
    try {
      await onSave({
        organization_service_id: svc.organization_service_id,
        fiscal_year: fiscalYear,
        clients_served: prev.metrics.clients_served,
        sessions_delivered: prev.metrics.sessions_delivered,
        events_held: prev.metrics.events_held,
        staff_count: prev.metrics.staff_count,
        key_achievement: prev.metrics.key_achievement,
        headline_stat_value: prev.metrics.headline_stat_value,
        headline_stat_label: prev.metrics.headline_stat_label,
      });

      // Update local state
      const fields = ['clients_served', 'sessions_delivered', 'events_held', 'staff_count', 'key_achievement', 'headline_stat_value', 'headline_stat_label'];
      const updates: Record<string, any> = {};
      fields.forEach(f => {
        updates[`${svc.organization_service_id}.${f}`] = (prev.metrics as any)[f];
      });
      setLocalData(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Copy error:', error);
    } finally {
      setSaving(null);
    }
  };

  // Allow parent to apply an undo by updating local data
  const applyUndoValue = useCallback((serviceId: string, field: string, value: any) => {
    const key = `${serviceId}.${field}`;
    setLocalData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Expose applyUndoValue via a ref-based callback pattern
  // Parent can call onSave directly to persist, and we update local display
  // This is handled by the parent passing the undo save through onSave

  const hasData = (svc: ServiceMetric) => {
    const m = svc.metrics;
    if (!m) {
      // Check local data
      return Object.keys(localData).some(
        k => k.startsWith(svc.organization_service_id) && localData[k] !== null
      );
    }
    return m.clients_served !== null || m.sessions_delivered !== null ||
           m.events_held !== null || m.staff_count !== null || m.key_achievement !== null;
  };

  const renderCell = (svc: ServiceMetric, field: string, type: 'number' | 'text' = 'number') => {
    const key = `${svc.organization_service_id}.${field}`;
    const value = getMetricValue(svc, field);
    const isEditing = editingCell === key;

    if (isEditing) {
      return (
        <input
          autoFocus
          type={type === 'number' ? 'number' : 'text'}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => handleBlur(svc.organization_service_id, field)}
          onKeyDown={e => handleKeyDown(e, svc.organization_service_id, field)}
          className="w-full px-2 py-1 text-sm border-2 border-picc-ochre-300 rounded focus:outline-none"
        />
      );
    }

    const displayValue = type === 'number' && value !== null
      ? Number(value).toLocaleString()
      : value;

    return (
      <div
        onClick={() => handleCellClick(svc.organization_service_id, field, value)}
        className={`px-2 py-1 text-sm cursor-pointer rounded transition-colors hover:bg-gray-50 min-h-[28px] ${
          value !== null && value !== undefined && value !== ''
            ? 'text-gray-900'
            : 'text-gray-300 border border-dashed border-gray-200'
        }`}
      >
        {displayValue || '\u00A0'}
      </div>
    );
  };

  // Group by category
  const categories = Array.from(new Set(services.map(s => s.service_category || 'Other')));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[200px]">Service</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[100px]">Clients</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[100px]">Sessions</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[80px]">Events</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[80px]">Staff</th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[120px]">
              <span className="inline-flex items-center gap-1">Headline Stat <HelpTooltip content="A single standout number for this service, e.g. '1,200 meals served' or '98% satisfaction'" /></span>
            </th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
              <span className="inline-flex items-center gap-1">Key Achievement <HelpTooltip content="The most significant accomplishment for this service during the fiscal year" /></span>
            </th>
            <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[60px]"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <Fragment key={category}>
              <tr>
                <td colSpan={8} className="px-3 py-2 bg-gray-50">
                  <span className="text-xs font-bold text-gray-500 uppercase">{category}</span>
                </td>
              </tr>
              {services
                .filter(s => (s.service_category || 'Other') === category)
                .map(svc => (
                  <tr
                    key={svc.organization_service_id}
                    className={`border-b border-gray-100 ${
                      saving === svc.organization_service_id ? 'bg-warm-50' : ''
                    }`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {hasData(svc) ? (
                          <CheckCircle className="w-4 h-4 text-sage-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {svc.service_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{renderCell(svc, 'clients_served')}</td>
                    <td className="px-3 py-2">{renderCell(svc, 'sessions_delivered')}</td>
                    <td className="px-3 py-2">{renderCell(svc, 'events_held')}</td>
                    <td className="px-3 py-2">{renderCell(svc, 'staff_count')}</td>
                    <td className="px-3 py-2">{renderCell(svc, 'headline_stat_value', 'text')}</td>
                    <td className="px-3 py-2">{renderCell(svc, 'key_achievement', 'text')}</td>
                    <td className="px-3 py-2">
                      {previousYearServices && (
                        <button
                          onClick={() => copyFromLastYear(svc)}
                          className="p-1 text-gray-400 hover:text-picc-ochre transition-colors"
                          title="Copy from last year"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Need Fragment import
import { Fragment } from 'react';
