import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { EvidenceResponse, InvestigationDetail } from '@/types/api';

export const RiskPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeId, activeCve } = useInvestigation();

  const targetId = searchParams.get('id') || activeId;

  const [detail, setDetail] = useState<InvestigationDetail | null>(null);
  const [evidenceData, setEvidenceData] = useState<EvidenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!targetId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [invRes, evRes] = await Promise.allSettled([
        investigationsApi.getInvestigation(targetId),
        investigationsApi.getEvidence(targetId),
      ]);

      if (invRes.status === 'fulfilled') setDetail(invRes.value);
      if (evRes.status === 'fulfilled') setEvidenceData(evRes.value);
    } catch (err: any) {
      setError(err?.detail || 'Failed to load risk assessment data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetId]);

  if (!targetId) {
    return (
      <EmptyState
        title="No Investigation Selected"
        description="Select an investigation to compute and view the evidence-driven risk profile."
        actionText="View Investigations"
        onAction={() => navigate('/investigations')}
      />
    );
  }

  // Derive risk indicators from persisted evidence and claims
  const sources = evidenceData?.sources || [];
  const claims = evidenceData?.claims || [];

  const kevSource = sources.find(
    (s) => s.source_type === 'cisa_kev' || s.title.toLowerCase().includes('cisa')
  );
  const isKevListed = Boolean(kevSource);

  const cvssEvidence = evidenceData?.evidence?.find(
    (e) => e.provenance?.metadata?.cvss || e.provenance?.metadata?.score
  );
  const cvssScore = cvssEvidence?.provenance?.metadata?.cvss || cvssEvidence?.provenance?.metadata?.score || null;

  const hasContradictions = claims.some((c) => c.verification_state === 'contradicted');
  const verifiedCount = claims.filter((c) => c.verification_state === 'verified').length;
  const totalClaims = claims.length;

  // Confidence is calculated from claim verification ratio
  const confidencePercent = totalClaims > 0 ? Math.round((verifiedCount / totalClaims) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E3560]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FBBF24]" />
              Vulnerability Risk Assessment
            </h1>
            {activeCve && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0C1F3F] border border-[#2A4D80] text-[#60A5FA]">
                {activeCve}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            Separation of official baseline scores from derived evidence-driven indicators
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Recalculate Signals
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchData} />}

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner label="Compiling multidimensional risk signals..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Risk Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Official Baseline Metrics */}
            <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3560] mb-4">
                <span className="text-xs font-mono font-medium text-[#94A3B8] uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#60A5FA]" />
                  Authoritative Baseline Metrics
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0C1F3F] text-[#60A5FA] border border-[#1E3560]">
                  Official Feeds
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[#94A3B8] font-mono mb-1">Official CVSS Vector / Score</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-[#E2E8F0]">
                      {cvssScore !== null ? cvssScore : 'Available in Report'}
                    </span>
                    <span className="text-xs text-[#64748B] font-mono">
                      (NVD 2.0 / CVE Program Record)
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E3560]/60 flex items-center justify-between font-mono">
                  <span className="text-xs text-[#94A3B8]">CISA KEV Catalog Inclusion:</span>
                  {isKevListed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#F87171] font-bold">
                      <Flame className="w-4 h-4" />
                      Known Exploited (Active)
                    </span>
                  ) : (
                    <span className="text-xs text-[#94A3B8]">Not Listed in KEV</span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1E3560]/60 flex items-center justify-between font-mono">
                  <span className="text-xs text-[#94A3B8]">Contradiction Status:</span>
                  {hasContradictions ? (
                    <span className="text-xs text-[#FBBF24]">Discrepancies Flagged</span>
                  ) : (
                    <span className="text-xs text-[#4ADE80]">No Contradictions</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. ThreatLens Derived Assessment */}
            <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3560] mb-4">
                <span className="text-xs font-mono font-medium text-[#94A3B8] uppercase flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
                  ThreatLens Evidence-Driven Score
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#14532D] text-[#4ADE80] border border-[#22C55E]/40">
                  Synthesized
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[#94A3B8] font-mono mb-1">Evidence Confidence Rating</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-[#4ADE80]">
                      {confidencePercent}%
                    </span>
                    <span className="text-xs text-[#64748B] font-mono">
                      ({verifiedCount} of {totalClaims} claims backed by excerpts)
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="w-full h-2 bg-[#0C1F3F] rounded-full overflow-hidden border border-[#1E3560]">
                  <div
                    className="h-full bg-[#22C55E] transition-all duration-500"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>

                <div className="pt-3 border-t border-[#1E3560]/60 text-xs text-[#94A3B8] leading-relaxed">
                  ThreatLens derives confidence dynamically from verified citations. When source
                  excerpts are absent or conflicting, certainty is explicitly lowered rather than
                  assumed.
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Signal Breakdown */}
          <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
            <h2 className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#60A5FA]" />
              Signal Provenance Breakdown
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-[#040D1A] border border-[#1E3560] gap-2">
                <div>
                  <div className="font-bold text-[#E2E8F0]">1. NVD & Vendor Baseline Coverage</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-sans">
                    Authoritative baseline scoring, vulnerability description, and affected configurations.
                  </div>
                </div>
                <span className="text-[#4ADE80] shrink-0 font-bold">
                  {sources.length > 0 ? 'Verified Ingested' : 'Pending'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-[#040D1A] border border-[#1E3560] gap-2">
                <div>
                  <div className="font-bold text-[#E2E8F0]">2. Real-World Exploitation Evidence</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-sans">
                    Checks CISA KEV and vendor advisory threat bulletins for confirmed in-the-wild exploitation.
                  </div>
                </div>
                <span className="text-[#60A5FA] shrink-0 font-bold">
                  {isKevListed ? 'Exploit Confirmed (KEV)' : 'Unconfirmed / Not In KEV'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-[#040D1A] border border-[#1E3560] gap-2">
                <div>
                  <div className="font-bold text-[#E2E8F0]">3. Remediation & Patch Clarity</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-sans">
                    Evaluates available vendor advisories for specific patched version ranges and workarounds.
                  </div>
                </div>
                <span className="text-[#FCD34D] shrink-0 font-bold">
                  {claims.length > 0 ? 'Documented in Claims' : 'Pending Retrieval'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

