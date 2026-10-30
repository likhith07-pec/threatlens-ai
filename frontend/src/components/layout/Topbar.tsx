import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Radio, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { HealthResponse } from '@/types/api';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { activeCve, activeId, setActiveInvestigation, recentInvestigations } = useInvestigation();
  const [quickInput, setQuickInput] = useState('');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await investigationsApi.getHealth();
        if (isMounted) {
          setHealth(res);
          setBackendOnline(res.status === 'ok');
        }
      } catch {
        if (isMounted) {
          setBackendOnline(false);
        }
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = quickInput.trim().toUpperCase();
    if (!formatted) return;

    // Check if already in recent investigations
    const match = recentInvestigations.find((item) => item.cve_id === formatted);
    if (match) {
      setActiveInvestigation(match.id, match.cve_id);
      navigate(`/investigations/${match.id}`);
    } else {
      // Go to new investigation form with pre-filled query
      navigate(`/investigations/new?cve=${encodeURIComponent(formatted)}`);
    }
    setQuickInput('');
  };

  return (
    <header className="h-14 bg-[#071428] border-b border-[#1E3560] px-6 flex items-center justify-between gap-4 z-10 shrink-0">
      {/* Left: Active CVE Pill / Context indicator */}
      <div className="flex items-center gap-3">
        {activeCve ? (
          <div className="flex items-center gap-2 bg-[#0C1F3F] border border-[#2A4D80] px-3 py-1.5 rounded-md text-xs">
            <Radio className="w-3.5 h-3.5 text-[#60A5FA] animate-pulse" />
            <span className="text-[#94A3B8] font-mono">Active Investigation:</span>
            <span className="font-mono font-bold text-[#60A5FA] tracking-wide">{activeCve}</span>
          </div>
        ) : (
          <div className="text-xs font-mono text-[#64748B] flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#64748B]" />
            <span>No Active Investigation Selected</span>
          </div>
        )}
      </div>

      {/* Middle: Quick Search / Lookup */}
      <form onSubmit={handleQuickSubmit} className="relative w-72">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Lookup or enter CVE-YYYY-NNNN..."
          className="w-full h-8 pl-8 pr-3 bg-[#0C1F3F] border border-[#1E3560] focus:border-[#60A5FA] rounded text-xs font-mono text-[#E2E8F0] placeholder-[#64748B] outline-none transition-colors"
        />
        <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
      </form>

      {/* Right: Backend Connection Status & New Action */}
      <div className="flex items-center gap-3">
        {/* Backend Status indicator */}
        <div
          title={
            backendOnline
              ? 'FastAPI Backend Online & Operational'
              : 'FastAPI Backend Disconnected or Scaffolding'
          }
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0C1F3F] border border-[#1E3560] text-xs font-mono cursor-pointer"
          onClick={() => navigate('/settings')}
        >
          <Server className="w-3.5 h-3.5 text-[#94A3B8]" />
          {backendOnline === true ? (
            <span className="flex items-center gap-1 text-[#4ADE80]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              API Online
            </span>
          ) : backendOnline === false ? (
            <span className="flex items-center gap-1 text-[#FCA5A5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
              API Offline
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#FCD34D]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
              Checking...
            </span>
          )}
        </div>

        {/* New Investigation Button */}
        <button
          onClick={() => navigate('/investigations/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-medium rounded transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Investigation</span>
        </button>
      </div>
    </header>
  );
};
