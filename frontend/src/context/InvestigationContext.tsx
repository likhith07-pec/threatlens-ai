import React, { createContext, useContext, useState, useEffect } from 'react';
import { investigationsApi } from '@/api/investigations';
import type { InvestigationListItem } from '@/types/api';

interface InvestigationContextType {
  activeId: string | null;
  activeCve: string | null;
  setActiveInvestigation: (id: string, cve: string) => void;
  recentInvestigations: InvestigationListItem[];
  refreshRecent: () => Promise<void>;
  isLoadingRecent: boolean;
}

const InvestigationContext = createContext<InvestigationContextType>({
  activeId: null,
  activeCve: null,
  setActiveInvestigation: () => {},
  recentInvestigations: [],
  refreshRecent: async () => {},
  isLoadingRecent: false,
});

export const InvestigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeId, setActiveId] = useState<string | null>(() => {
    return localStorage.getItem('threatlens_active_id');
  });
  const [activeCve, setActiveCve] = useState<string | null>(() => {
    return localStorage.getItem('threatlens_active_cve');
  });
  const [recentInvestigations, setRecentInvestigations] = useState<InvestigationListItem[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState<boolean>(false);

  const setActiveInvestigation = (id: string, cve: string) => {
    setActiveId(id);
    setActiveCve(cve);
    localStorage.setItem('threatlens_active_id', id);
    localStorage.setItem('threatlens_active_cve', cve);
  };

  const refreshRecent = async () => {
    try {
      setIsLoadingRecent(true);
      const res = await investigationsApi.listInvestigations(1, 10);
      setRecentInvestigations(res.items);
      // Auto-set the first one if none selected
      if (!activeId && res.items.length > 0) {
        setActiveInvestigation(res.items[0].id, res.items[0].cve_id);
      }
    } catch {
      // Backend may be offline during initial scaffolding; ignore silent error
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    refreshRecent();
  }, []);

  return (
    <InvestigationContext.Provider
      value={{
        activeId,
        activeCve,
        setActiveInvestigation,
        recentInvestigations,
        refreshRecent,
        isLoadingRecent,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = () => useContext(InvestigationContext);
