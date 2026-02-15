'use client';

import { useState } from 'react';
import { Plus, Star, Users, Image, X } from 'lucide-react';
import QuickAddModal, { type QuickAddType } from './QuickAddModal';

interface QuickAddFABProps {
  reportId: string | null;
  fiscalYear: number;
  onSaved: (type: QuickAddType) => void;
}

const QUICK_ACTIONS: { type: QuickAddType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'highlight', label: 'Add Highlight', icon: Star },
  { type: 'board_member', label: 'Add Board Member', icon: Users },
  { type: 'photo', label: 'Upload Photo', icon: Image },
];

export default function QuickAddFAB({ reportId, fiscalYear, onSaved }: QuickAddFABProps) {
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState<QuickAddType | null>(null);

  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-2">
        {/* Menu items */}
        {open && QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.type}
              onClick={() => {
                setModalType(action.type);
                setOpen(false);
              }}
              className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-white rounded-full shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {action.label}
              <div className="p-1 bg-warm-100 rounded-full">
                <Icon className="w-4 h-4 text-picc-ochre" />
              </div>
            </button>
          );
        })}

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(!open)}
          className={`p-4 rounded-full shadow-xl transition-all ${
            open
              ? 'bg-gray-700 hover:bg-gray-800 rotate-45'
              : 'bg-gradient-to-br from-picc-ochre to-picc-ochre-600 hover:from-picc-ochre-600 hover:to-picc-ochre-700'
          }`}
        >
          {open ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Backdrop when menu is open */}
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Modal */}
      {modalType && (
        <QuickAddModal
          type={modalType}
          reportId={reportId}
          fiscalYear={fiscalYear}
          onClose={() => setModalType(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
