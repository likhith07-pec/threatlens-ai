import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2,
  Network,
  GitCompareArrows,
  FileText,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { InvestigationDetail, EvidenceResponse } from '@/types/api';

export const InvestigationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeId, setActiveInvestigation } = useInvestigation();

  const targetId = id || activeId;

  const [detail, setDetail] = useState<InvestigationDetail | null>(null);
  const [evidenceData, setEvidenceData] = useState<EvidenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDetail = async (showLoading = false) => {
    if (!targetId) return;
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const [resDetail, resEvidence] = await Promise.allSettled([
        investigationsApi.getInvestigation(targetId),
        investigationsApi.getEvidence(targetId),
      ]);

      if (resDetail.status === 'fulfilled') {
        setDetail(resDetail.value);
        setActiveInvestigation(resDetail.value.id, resDetail.value.cve_id);
      } else {
        setError('Investigation not found or backend unreachable.');
      }

      if (resEvidence.status === 'fulfilled') {
        setEvidenceData(resEvidence.value);
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(true);
  }, [targetId]);

  // Bounded polling for running or queued investigations
  useEffect(() => {
    if (!detail) return;
    const isOngoing = detail.status === 'running' || detail.status === 'queued';
    if (isOngoing && pollCount < 40) {
      pollTimerRef.current = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        fetchDetail(false);
      }, 3000);
    }
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [detail, pollCount]);

  if (!targetId) {
    return (
      <EmptyState
        title="No Investigation Selected"
        description="Select an existing investigation from the queue or launch a new investigation to view deep intelligence details."
        actionText="View Investigations Queue"
        onAction={() => navigate('/investigations')}
      />
    );
  }

  if (isLoading && !detail) {
    return (
      <div className="py-24">
        <LoadingSpinner label="Loading investigation details..." />
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error} onRetry={() => fetchDetail(true)} />
      </div>
    );
  }

  if (!detail) return null;

  const isCompleted = detail.status === 'completed';
  const isRunning = detail.status === 'running' || detail.status === 'queued';

  const sourcesCount = evidenceData?.sources?.length || 0;
  const claimsCount = evidenceData?.claims?.length || 0;
  const verifiedCount =
    evidenceData?.claims?.filter((c) => c.verification_state === 'verified').length || 0;
  const contradictedCount =
    evidenceData?.claims?.filter((c) => c.verification_state === 'contradicted').length || 0;

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-[#60A5FA] tracking-wide">
                {detail.cve_id}
              </h1>
              <Badge variant="status" status={detail.status} />
            </div>
            <p className="text-xs text-[#94A3B8] font-mono mt-1">
              Investigation ID: <span className="text-[#E2E8F0]">{detail.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDetail(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={() => navigate(`/reports?id=${detail.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-medium rounded transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Pipeline Stage Bar */}
        <div className="mt-6 pt-5 border-t border-[#1E3560]/70">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#94A3B8] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#60A5FA]" />
              Pipeline Progress Stage:
            </span>
            <span className="font-semibold text-[#60A5FA]">
              {detail.progress_stage || (isCompleted ? 'Pipeline Complete' : 'Initializing')}
            </span>
          </div>

          {/* Progress Indicator Bar */}
          <div className="w-full h-2 bg-[#0C1F3F] rounded-full overflow-hidden border border-[#1E3560]">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted
                  ? 'w-full bg-[#22C55E]'
                  : isRunning
                  ? 'w-3/5 bg-[#60A5FA] animate-pulse'
                  : 'w-1/4 bg-[#FBBF24]'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono mt-2">
            <span>Submitted: {new Date(detail.created_at).toLocaleString()}</span>
            <span>
              {detail.completed_at
                ? `Completed: ${new Date(detail.completed_at).toLocaleString()}`
                : isRunning
                ? 'Analysis running in background'
                : 'Pending completion'}
            </span>
          </div>
        </div>

        {detail.error_summary && (
          <div className="mt-4 p-3 bg-[#7F1D1D]/30 border border-[#F87171]/40 rounded text-xs text-[#FCA5A5] font-mono">
            <strong>Pipeline Warning / Note:</strong> {detail.error_summary}
          </div>
        )}
      </div>

      {/* Intelligence Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => navigate(`/evidence?id=${detail.id}`)}
          className="bg-[#071428] border border-[#1E3560] hover:border-[#60A5FA]/40 p-4 rounded-lg cursor-pointer transition-all"
        >
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase flex items-center justify-between">
            <span>Authoritative Sources</span>
            <FileCheck2 className="w-3.5 h-3.5 text-[#60A5FA]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#E2E8F0] mt-1">{sourcesCount}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">NVD, KEV, Vendor</div>
        </div>

        <div
          onClick={() => navigate(`/evidence?id=${detail.id}`)}
          className="bg-[#071428] border border-[#1E3560] hover:border-[#22C55E]/40 p-4 rounded-lg cursor-pointer transition-all"
        >
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase flex items-center justify-between">
            <span>Extracted Claims</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#4ADE80] mt-1">{claimsCount}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">{verifiedCount} verified</div>
        </div>

        <div
          onClick={() => navigate(`/contradictions?id=${detail.id}`)}
          className="bg-[#071428] border border-[#1E3560] hover:border-[#F87171]/40 p-4 rounded-lg cursor-pointer transition-all"
        >
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase flex items-center justify-between">
            <span>Contradictions</span>
            <GitCompareArrows className="w-3.5 h-3.5 text-[#F87171]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FCA5A5] mt-1">{contradictedCount}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Claims in conflict</div>
        </div>

        <div
          onClick={() => navigate(`/risk?id=${detail.id}`)}
          className="bg-[#071428] border border-[#1E3560] hover:border-[#FBBF24]/40 p-4 rounded-lg cursor-pointer transition-all"
        >
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase flex items-center justify-between">
            <span>Risk Assessment</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FCD34D] mt-1">Ready</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Official & derived metrics</div>
        </div>
      </div>

      {/* Quick Navigation Cards for Analyst Workflows */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
        <h2 className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider mb-4">
          Deep Dive Intelligence Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate(`/evidence?id=${detail.id}`)}
            className="p-4 rounded-lg bg-[#0C1F3F]/60 border border-[#1E3560] hover:border-[#60A5FA]/60 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#E2E8F0] group-hover:text-[#60A5FA] transition-colors flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#60A5FA]" />
                Evidence & Excerpts
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#60A5FA]" />
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Inspect cited source URLs, exact quotation excerpts, timestamps, and verifiable hashes.
            </p>
          </div>

          <div
            onClick={() => navigate(`/graph?id=${detail.id}`)}
            className="p-4 rounded-lg bg-[#0C1F3F]/60 border border-[#1E3560] hover:border-[#60A5FA]/60 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#E2E8F0] group-hover:text-[#60A5FA] transition-colors flex items-center gap-1.5">
                <Network className="w-4 h-4 text-[#60A5FA]" />
                Evidence Graph
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#60A5FA]" />
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Interactive visual relationship map connecting claims to supporting and challenging sources.
            </p>
          </div>

          <div
            onClick={() => navigate(`/contradictions?id=${detail.id}`)}
            className="p-4 rounded-lg bg-[#0C1F3F]/60 border border-[#1E3560] hover:border-[#F87171]/60 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#E2E8F0] group-hover:text-[#F87171] transition-colors flex items-center gap-1.5">
                <GitCompareArrows className="w-4 h-4 text-[#F87171]" />
                Contradiction Review
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#F87171]" />
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Compare conflicting vendor vs advisory reports with temporal scope and version boundaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

