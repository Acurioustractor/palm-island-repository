import { create } from 'zustand';
import type { NetworkNode, NodeType } from './types';

type TabId = 'network' | 'trends' | 'financial' | 'services' | 'insights';

interface DataIntelligenceState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  fiscalYear: number;
  setFiscalYear: (year: number) => void;

  activeDomains: NodeType[];
  toggleDomain: (domain: NodeType) => void;

  selectedNode: NetworkNode | null;
  setSelectedNode: (node: NetworkNode | null) => void;
}

export const useDataIntelligenceStore = create<DataIntelligenceState>((set) => ({
  activeTab: 'network',
  setActiveTab: (tab) => set({ activeTab: tab }),

  fiscalYear: 2025,
  setFiscalYear: (year) => set({ fiscalYear: year }),

  activeDomains: ['service', 'partner', 'finance', 'staff', 'story', 'governance'],
  toggleDomain: (domain) =>
    set((state) => ({
      activeDomains: state.activeDomains.includes(domain)
        ? state.activeDomains.filter((d) => d !== domain)
        : [...state.activeDomains, domain],
    })),

  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
}));
