import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  FileCheck2,
  GitCompareArrows,
  Search,
  ExternalLink,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { InvestigationListItem, HealthResponse } from '@/types/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveInvestigation } = useInvestigation();
  const [investigations, setInvestigations] = useState<InvestigationListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cveInput, setCveInput] = useState<string>('');
  const [cveError, setCveError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [invRes, healthRes] = await Promise.allSettled([
        investigationsApi.listInvestigations(1, 10),
        investigationsApi.getHealth(),
      ]);

      if (invRes.status === 'fulfilled') {
        setInvestigations(invRes.value.items);
        setTotalCount(invRes.value.total);
      } else {
        // API offline or error
        setError('Backend API unreachable. Ensure FastAPI is running on http://127.0.0.1:8000.');
      }

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLaunchSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cve = cveInput.trim().toUpperCase();
    const cveRegex = /^CVE-\d{4}-\d{4,7}$/i;
    if (!cveRegex.test(cve)) {
      setCveError('Invalid format. Must match CVE-YYYY-NNNN (e.g. CVE-2024-3094)');
      return;
    }
    setCveError(null);
    navigate(`/investigations/new?cve=${encodeURIComponent(cve)}`);
  };

  const completedCount = investigations.filter((i) => i.status === 'completed').length;
  const runningCount = investigations.filter((i) => i.status === 'running' || i.status === 'queued').length;
  const partialCount = investigations.filter((i) => i.status === 'partial' || i.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1E3560]">
        <div>
          <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#60A5FA]" />
            ThreatLens AI Operations Center
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Authoritative Vulnerability Verification & Evidence Synthesis
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Pipeline
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchDashboardData} />}

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Investigations"
          value={totalCount}
          subtext="Persisted in system"
          variant="default"
          icon={<ShieldAlert className="w-4 h-4 text-[#60A5FA]" />}
        />
        <StatCard
          label="Active Pipeline"
          value={runningCount}
          subtext="Queued or analyzing"
          variant="blue"
          icon={<Activity className="w-4 h-4 text-[#60A5FA]" />}
        />
        <StatCard
          label="Completed Verified"
          value={completedCount}
          subtext="Evidence-backed"
          variant="green"
          icon={<FileCheck2 className="w-4 h-4 text-[#4ADE80]" />}
        />
        <StatCard
          label="Discrepancies / Partial"
          value={partialCount}
          subtext="Needs analyst review"
          variant="amber"
          icon={<GitCompareArrows className="w-4 h-4 text-[#FCD34D]" />}
        />
      </div>

      {/* Quick Launch Investigation Box */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold text-[#E2E8F0] mb-1">
            Launch New Evidence-Driven Investigation
          </h2>
          <p className="text-xs text-[#94A3B8] mb-4">
            Enter a standard CVE identifier. The engine fetches authoritative NVD & CISA records,
            researches vendor advisories via TinyFish, normalizes claims, and detects contradictions.
          </p>

          <form onSubmit={handleLaunchSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={cveInput}
                onChange={(e) => {
                  setCveInput(e.target.value);
                  setCveError(null);
                }}
                placeholder="e.g. CVE-2024-3094, CVE-2023-4863..."
                className="w-full h-10 pl-9 pr-3 bg-[#0C1F3F] border border-[#1E3560] focus:border-[#60A5FA] rounded text-sm font-mono text-[#E2E8F0] placeholder-[#64748B] outline-none"
              />
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <span>Analyze CVE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {cveError && <div className="text-xs text-[#FCA5A5] mt-2 font-mono">{cveError}</div>}
        </div>
      </div>

      {/* Recent Investigations Table */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#1E3560] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#E2E8F0]">Recent Investigations</h2>
            <span className="text-xs font-mono text-[#64748B]">({investigations.length} listed)</span>
          </div>
          <button
            onClick={() => navigate('/investigations')}
            className="text-xs font-mono text-[#60A5FA] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner label="Loading investigations queue..." />
          </div>
        ) : investigations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Investigations Found"
              description="No CVE investigations have been submitted to the backend yet. Launch your first investigation above to begin."
              actionText="Create Investigation"
              onAction={() => navigate('/investigations/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040D1A] text-[#94A3B8] border-b border-[#1E3560] font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">CVE ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3560]/60 font-mono">
                {investigations.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setActiveInvestigation(item.id, item.cve_id);
                      navigate(`/investigations/${item.id}`);
                    }}
                    className="hover:bg-[#0C1F3F]/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#60A5FA]">{item.cve_id}</td>
                    <td className="py-3 px-4">
                      <Badge variant="status" status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">
                      {item.progress_stage || 'Ready'}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInvestigation(item.id, item.cve_id);
                          navigate(`/investigations/${item.id}`);
                        }}
                        className="px-2.5 py-1 bg-[#1A3561] hover:bg-[#1E3F70] text-[#60A5FA] rounded text-[11px] font-sans font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
