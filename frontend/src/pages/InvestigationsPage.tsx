import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderSearch,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { InvestigationListItem, InvestigationStatus } from '@/types/api';

export const InvestigationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveInvestigation } = useInvestigation();
  const [items, setItems] = useState<InvestigationListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(15);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestigations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await investigationsApi.listInvestigations(page, pageSize);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.detail || 'Failed to retrieve investigations from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, [page]);

  // Client-side filtering on current page or query
  const filteredItems = items.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = item.cve_id.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E3560]">
        <div>
          <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
            <FolderSearch className="w-5 h-5 text-[#60A5FA]" />
            Vulnerability Investigations Queue
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            Historical & active CVE investigation repository
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvestigations}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/investigations/new')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-medium rounded transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Investigation
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchInvestigations} />}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#071428] border border-[#1E3560] p-3 rounded-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by CVE ID..."
            className="w-full h-8 pl-8 pr-3 bg-[#0C1F3F] border border-[#1E3560] focus:border-[#60A5FA] rounded text-xs font-mono text-[#E2E8F0] placeholder-[#64748B] outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-xs text-[#94A3B8] font-mono">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 bg-[#0C1F3F] border border-[#1E3560] focus:border-[#60A5FA] text-xs font-mono text-[#E2E8F0] px-2.5 rounded outline-none"
          >
            <option value="all">All Statuses ({total})</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="queued">Queued</option>
            <option value="partial">Partial</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Investigations Table Container */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner label="Fetching investigations list..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Investigations Match Criteria"
              description="No investigation records match your current filter or search query. You can reset filters or launch a new investigation."
              actionText="New Investigation"
              onAction={() => navigate('/investigations/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040D1A] text-[#94A3B8] border-b border-[#1E3560] font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">CVE Identifier</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Created Time</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3560]/60 font-mono">
                {filteredItems.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => {
                      setActiveInvestigation(inv.id, inv.cve_id);
                      navigate(`/investigations/${inv.id}`);
                    }}
                    className="hover:bg-[#0C1F3F]/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#60A5FA]">{inv.cve_id}</td>
                    <td className="py-3 px-4">
                      <Badge variant="status" status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">
                      {inv.progress_stage || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {new Date(inv.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {inv.completed_at ? new Date(inv.completed_at).toLocaleString() : 'In Progress'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInvestigation(inv.id, inv.cve_id);
                          navigate(`/investigations/${inv.id}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1A3561] hover:bg-[#1E3F70] text-[#60A5FA] rounded text-[11px] font-sans font-medium transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > pageSize && (
          <div className="p-3 bg-[#040D1A] border-t border-[#1E3560] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <div>
              Showing Page {page} of {totalPages} ({total} total)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-[#0C1F3F] border border-[#1E3560] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#112850]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-[#0C1F3F] border border-[#1E3560] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#112850]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
