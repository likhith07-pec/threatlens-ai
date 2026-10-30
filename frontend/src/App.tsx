import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { InvestigationProvider } from '@/context/InvestigationContext';

import { DashboardPage } from '@/pages/DashboardPage';
import { InvestigationsPage } from '@/pages/InvestigationsPage';
import { NewInvestigationPage } from '@/pages/NewInvestigationPage';
import { InvestigationDetailPage } from '@/pages/InvestigationDetailPage';
import { EvidencePage } from '@/pages/EvidencePage';
import { GraphPage } from '@/pages/GraphPage';
import { ContradictionsPage } from '@/pages/ContradictionsPage';
import { RiskPage } from '@/pages/RiskPage';
import { ReportPage } from '@/pages/ReportPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <InvestigationProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="investigations" element={<InvestigationsPage />} />
            <Route path="investigations/new" element={<NewInvestigationPage />} />
            <Route path="investigations/:id" element={<InvestigationDetailPage />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="graph" element={<GraphPage />} />
            <Route path="contradictions" element={<ContradictionsPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="reports" element={<ReportPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </InvestigationProvider>
    </BrowserRouter>
  );
};

export default App;
