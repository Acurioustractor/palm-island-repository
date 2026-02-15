'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Building2, DollarSign, BookOpen, Shield, Users2 } from 'lucide-react';
import type { NetworkNode, NodeType } from '@/lib/data-intelligence/types';
import { formatCurrency, formatNumber } from '@/lib/data-intelligence/calculations';

interface NodeDetailPanelProps {
  node: NetworkNode | null;
  onClose: () => void;
}

const ICONS: Record<NodeType, React.ReactNode> = {
  service: <Building2 className="w-5 h-5" />,
  partner: <Users2 className="w-5 h-5" />,
  finance: <DollarSign className="w-5 h-5" />,
  staff: <Users className="w-5 h-5" />,
  story: <BookOpen className="w-5 h-5" />,
  governance: <Shield className="w-5 h-5" />,
};

function MetadataRow({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  const displayValue = typeof value === 'number' ? formatNumber(value) : String(value);
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{displayValue}</span>
    </div>
  );
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-xl overflow-y-auto z-20"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${node.color}20` }}
                >
                  <div style={{ color: node.color }}>
                    {ICONS[node.type]}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{node.label}</h3>
                  <span className="text-xs text-gray-500 capitalize">{node.type}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Service-specific details */}
            {node.type === 'service' && (
              <>
                <MetadataRow label="Service Type" value={node.metadata.serviceType as string} />
                <MetadataRow label="Clients Served" value={node.metadata.clientsServed as number} />
                <MetadataRow label="Sessions" value={node.metadata.sessionsDelivered as number} />
                <MetadataRow label="Staff Count" value={node.metadata.staffCount as number} />
                {!!node.metadata.keyAchievement && (
                  <div className="bg-warm-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-picc-red mb-1">Key Achievement</div>
                    <div className="text-sm text-picc-earth">{String(node.metadata.keyAchievement)}</div>
                  </div>
                )}
              </>
            )}

            {/* Partner-specific details */}
            {node.type === 'partner' && (
              <>
                <MetadataRow label="Full Name" value={node.metadata.fullName as string} />
                <MetadataRow label="Type" value={node.metadata.partnerType as string} />
                {!!node.metadata.website && (
                  <MetadataRow label="Website" value={node.metadata.website as string} />
                )}
              </>
            )}

            {/* Finance-specific details */}
            {node.type === 'finance' && (
              <>
                <MetadataRow label="Amount" value={formatCurrency(node.metadata.amount as number)} />
                <MetadataRow label="Fiscal Year" value={node.metadata.fiscalYear as number} />
              </>
            )}

            {/* Staff-specific details */}
            {node.type === 'staff' && (
              <MetadataRow label="Count" value={node.metadata.count as number} />
            )}

            {/* Governance-specific details */}
            {node.type === 'governance' && node.metadata.role && (
              <MetadataRow label="Role" value={node.metadata.role as string} />
            )}

            {/* Story-specific details */}
            {node.type === 'story' && (
              <>
                <MetadataRow label="Category" value={node.metadata.category as string} />
                <MetadataRow label="Section" value={node.metadata.section as string} />
              </>
            )}

            {/* Node size indicator */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-xs text-gray-400">
                  Size: {Math.round(node.size)} (relative importance)
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
