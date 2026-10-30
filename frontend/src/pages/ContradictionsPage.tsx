import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  GitCompareArrows,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { EvidenceResponse, Claim } from '@/types/api';

export const ContradictionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeId, activeCve } = useInvestigation();

  const targetId = searchParams.get('id') || activeId;

  const [evidenceData, setEvidenceData] = useState<EvidenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = async () => {
    if (!targetId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await investigationsApi.getEvidence(targetId);
      setEvidenceData(res);
    } catch (err: any) {
      setError(err?.detail || 'Failed to retrieve claims and contradiction analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [targetId]);

  if (!targetId) {
    return (
      <EmptyState
        title="No Investigation Selected"
        description="Select an investigation to analyze claim contradictions, version scope divergences, and evidence gaps."
        actionText="View Investigations"
        onAction={() => navigate('/investigations')}
      />
    );
  }

  const claims = evidenceData?.claims || [];
  const contradictedClaims = claims.filter(
    (c) => c.verification_state === 'contradicted' || c.verification_state === 'needs_review'
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E3560]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
              <GitCompareArrows className="w-5 h-5 text-[#F87171]" />
              Contradiction & Discrepancy Review
            </h1>
            {activeCve && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0C1F3F] border border-[#2A4D80] text-[#60A5FA]">
                {activeCve}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            Cross-source validation detecting scope mismatches, scoring differences, and temporal divergence
          </p>
        </div>

        <button
          onClick={fetchEvidence}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Re-evaluate Conflicts
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchEvidence} />}

      {/* Rules Notice Card */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-4 text-xs">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
          <div className="text-[#94A3B8] leading-relaxed">
            <span className="text-[#E2E8F0] font-semibold">Evaluation Criteria:</span> ThreatLens AI
            does not treat all differences as contradictions. Different CVSS versions (v3.1 vs v4.0),
            vendor-specific downstream packaging scopes, or newer vendor advisories overriding initial NVD
            records are analyzed with context.
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner label="Evaluating claim contradictions and version gaps..." />
        </div>
      ) : claims.length === 0 ? (
        <EmptyState
          title="No Claims Found"
          description="This investigation has no extracted claims yet. Check the investigation progress stage."
          actionText="View Status"
          onAction={() => navigate(`/investigations/${targetId}`)}
        />
      ) : contradictedClaims.length === 0 ? (
        <div className="bg-[#071428] border border-[#22C55E]/40 rounded-lg p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#14532D]/50 border border-[#22C55E]/40 flex items-center justify-center text-[#4ADE80] mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#E2E8F0] mb-1">
            Zero Contradictions Detected
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto mb-4 font-mono">
            All {claims.length} extracted claims across retrieved authoritative sources (NVD, KEV, Vendor)
            are mutually consistent within their respective scopes and temporal bounds.
          </p>
          <button
            onClick={() => navigate(`/evidence?id=${targetId}`)}
            className="px-4 py-2 bg-[#0C1F3F] hover:bg-[#112850] text-[#60A5FA] border border-[#1E3560] rounded text-xs font-mono transition-colors"
          >
            Review All Verified Claims
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-mono text-[#FCA5A5] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#F87171]" />
            <span>
              {contradictedClaims.length} Claims Flagged for Discrepancy or Human Review
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {contradictedClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-[#071428] border border-[#F87171]/40 rounded-lg p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#7F1D1D]/50 text-[#FCA5A5] border border-[#F87171]/40 uppercase">
                      {claim.claim_type}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#E2E8F0]">
                      Subject: <span className="text-[#60A5FA]">{claim.subject}</span>
                    </span>
                  </div>
                  <Badge variant="verification" verificationState={claim.verification_state} />
                </div>

                <div className="p-3 bg-[#040D1A] border border-[#1E3560] rounded text-xs text-[#E2E8F0] font-mono leading-relaxed">
                  "{claim.text}"
                </div>

                {claim.rationale && (
                  <div className="text-xs font-mono text-[#94A3B8]">
                    <span className="text-[#FCA5A5] font-semibold">Conflict Rationale:</span>{' '}
                    {claim.rationale}
                  </div>
                )}

                <div className="pt-2 border-t border-[#1E3560] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                  <span>Claim Value: {claim.value}</span>
                  <button
                    onClick={() => navigate(`/evidence?id=${targetId}`)}
                    className="text-[#60A5FA] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Linked Excerpts</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

