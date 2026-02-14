'use client';

import { X, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  itemLabel?: string;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  actions,
  itemLabel = 'item',
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm sticky top-4 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear selection"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} {pluralLabel} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.map((action) => {
            const baseClasses =
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

            let variantClasses = '';
            switch (action.variant) {
              case 'primary':
                variantClasses = 'bg-picc-red text-white hover:bg-picc-red';
                break;
              case 'danger':
                variantClasses = 'bg-red-600 text-white hover:bg-red-700';
                break;
              default:
                variantClasses = 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
            }

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={`${baseClasses} ${variantClasses}`}
              >
                {action.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  action.icon
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BulkActionsBar;
