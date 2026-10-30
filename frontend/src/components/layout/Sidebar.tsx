import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderSearch,
  PlusCircle,
  FileCheck2,
  Network,
  GitCompareArrows,
  AlertTriangle,
  FileText,
  Sliders,
  Shield,
  Activity,
} from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';

export const Sidebar: React.FC = () => {
  const { activeId, activeCve } = useInvestigation();

  const getTarget = (path: string) => {
    if (activeId && path !== '/' && path !== '/investigations' && path !== '/investigations/new' && path !== '/settings') {
      return `${path}?id=${activeId}`;
    }
    return path;
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all select-none ${
      isActive
        ? 'bg-[#1A3561] text-[#60A5FA] shadow-sm border border-[#2A4D80]/60'
        : 'text-[#94A3B8] hover:bg-[#112850] hover:text-[#E2E8F0]'
    }`;

  return (
    <aside className="w-56 h-screen flex-shrink-0 bg-[#071428] border-r border-[#1E3560] flex flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#1E3560] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0C1F3F] border border-[#2A4D80] flex items-center justify-center text-[#60A5FA] shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-[#60A5FA] tracking-wider flex items-center gap-1.5">
              THREATLENS<span className="text-white">AI</span>
            </div>
            <div className="text-[10px] text-[#64748B] tracking-wide uppercase font-mono">
              Evidence-Driven CTI
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-4 overflow-y-auto">
          {/* Main Section */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-mono tracking-wider text-[#64748B] uppercase">
              Operations
            </div>
            <div className="space-y-0.5">
              <NavLink to="/" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 text-[#60A5FA]" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/investigations" end className={navLinkClass}>
                <FolderSearch className="w-4 h-4 text-[#94A3B8]" />
                <span>Investigations</span>
              </NavLink>
              <NavLink to="/investigations/new" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 text-[#22C55E]" />
                <span>New Investigation</span>
              </NavLink>
            </div>
          </div>

          {/* Active Intelligence Section */}
          <div>
            <div className="px-3 pb-1 flex items-center justify-between text-[10px] font-mono tracking-wider text-[#64748B] uppercase">
              <span>Intelligence Analysis</span>
              {activeCve && (
                <span className="text-[9px] text-[#60A5FA] lowercase tracking-normal">
                  {activeCve.slice(-8)}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              <NavLink to={getTarget(activeId ? `/investigations/${activeId}` : '/investigations')} className={navLinkClass}>
                <Activity className="w-4 h-4 text-[#60A5FA]" />
                <span>Investigation Detail</span>
              </NavLink>
              <NavLink to={getTarget('/evidence')} className={navLinkClass}>
                <FileCheck2 className="w-4 h-4 text-[#22C55E]" />
                <span>Evidence Viewer</span>
              </NavLink>
              <NavLink to={getTarget('/graph')} className={navLinkClass}>
                <Network className="w-4 h-4 text-[#60A5FA]" />
                <span>Evidence Graph</span>
              </NavLink>
              <NavLink to={getTarget('/contradictions')} className={navLinkClass}>
                <GitCompareArrows className="w-4 h-4 text-[#F87171]" />
                <span>Contradictions</span>
              </NavLink>
              <NavLink to={getTarget('/risk')} className={navLinkClass}>
                <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
                <span>Risk Assessment</span>
              </NavLink>
              <NavLink to={getTarget('/reports')} className={navLinkClass}>
                <FileText className="w-4 h-4 text-[#94A3B8]" />
                <span>Reports & Export</span>
              </NavLink>
            </div>
          </div>

          {/* System Section */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-mono tracking-wider text-[#64748B] uppercase">
              Management
            </div>
            <div className="space-y-0.5">
              <NavLink to="/settings" className={navLinkClass}>
                <Sliders className="w-4 h-4 text-[#94A3B8]" />
                <span>Settings & Feeds</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1E3560] bg-[#040D1A]/60">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            SOC Node: 01
          </span>
          <span className="text-[#64748B]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
