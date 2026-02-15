// ============================================================================
// Data Intelligence Hub — Shared Types
// ============================================================================

export type NodeType = 'service' | 'partner' | 'finance' | 'staff' | 'story' | 'governance';
export type EdgeType = 'referral' | 'shared_staff' | 'co_located' | 'program_link' | 'funds_flow' | 'partnership' | 'employs' | 'governs' | 'tells';

export interface NetworkNode {
  id: string;
  label: string;
  type: NodeType;
  group: number;
  size: number;
  color: string;
  metadata: Record<string, any>;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  label?: string;
}

export interface OverviewKPI {
  label: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeLabel?: string;
  unit?: string;
  icon?: string;
  color?: string;
}

export interface TrendPoint {
  fiscal_year: string;
  fiscal_year_end: number;
  [key: string]: string | number | boolean | null;
}

export interface GrowthMetric {
  label: string;
  current: number;
  previous: number;
  yoyGrowth: number;
  cagr?: number;
}

export interface CorrelationPair {
  metricA: string;
  metricB: string;
  correlation: number;
  dataPoints: number;
  interpretation: string;
}

export interface FinancialBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ServiceHeatMapCell {
  serviceId: string;
  serviceName: string;
  metric: string;
  value: number;
  normalizedValue: number;
}

export interface DataQualityScore {
  table: string;
  completeness: number;
  rowCount: number;
  missingFields: string[];
}

// Color constants for node types
export const NODE_COLORS: Record<NodeType, string> = {
  service: '#3B82F6',
  partner: '#10B981',
  finance: '#F59E0B',
  staff: '#8B5CF6',
  story: '#EC4899',
  governance: '#6366F1',
};

// Edge style constants
export const EDGE_STYLES: Record<EdgeType, { stroke: string; dasharray: string }> = {
  referral: { stroke: '#3B82F6', dasharray: '' },
  shared_staff: { stroke: '#8B5CF6', dasharray: '4 2' },
  co_located: { stroke: '#6B7280', dasharray: '2 2' },
  program_link: { stroke: '#10B981', dasharray: '' },
  funds_flow: { stroke: '#10B981', dasharray: '8 4' },
  partnership: { stroke: '#8B5CF6', dasharray: '4 4' },
  employs: { stroke: '#F59E0B', dasharray: '' },
  governs: { stroke: '#6366F1', dasharray: '' },
  tells: { stroke: '#EC4899', dasharray: '2 4' },
};
