import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  ExternalLink,
  Shield,
  Clock,
  Hash,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { EvidenceResponse, Source, Claim, EvidenceItem } from '@/types/api';

export const EvidencePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeId, activeCve } = useInvestigation();

  const targetId = searchParams.get('id') || activeId;

  const [data, setData] = useState<EvidenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'claims' | 'sources'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fetchEvidence = async () => {
    if (!targetId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await investigationsApi.getEvidence(targetId);
      setData(res);
    } catch (err: any) {
      setError(err?.detail || 'Failed to fetch evidence and claims from backend.');
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
        title="No Active Investigation"
        description="Select an investigation from the dashboard or queue to view evidence excerpts and verified claims."
        actionText="Go to Investigations"
        onAction={() => navigate('/investigations')}
      />
    );
  }

  const sources = data?.sources || [];
  const claims = data?.claims || [];
  const evidenceList = data?.evidence || [];

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    const query = searchFilter.toLowerCase();
    return (
      claim.text.toLowerCase().includes(query) ||
      claim.subject.toLowerCase().includes(query) ||
      claim.value.toLowerCase().includes(query) ||
      claim.claim_type.toLowerCase().includes(query)
    );
  });

  // Filter sources
  const filteredSources = sources.filter((source) => {
    const query = searchFilter.toLowerCase();
    return (
      source.title.toLowerCase().includes(query) ||
      source.url.toLowerCase().includes(query) ||
      source.source_type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E3560]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#22C55E]" />
              Evidence & Excerpt Viewer
            </h1>
            {activeCve && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0C1F3F] border border-[#2A4D80] text-[#60A5FA]">
                {activeCve}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            Traceable citations, exact text excerpts, provenance timestamps, and verified claims
          </p>
        </div>

        <button
          onClick={fetchEvidence}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Evidence
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchEvidence} />}

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#071428] border border-[#1E3560] p-3 rounded-lg">
        <div className="flex items-center gap-1 bg-[#0C1F3F] p-1 rounded-md border border-[#1E3560]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
              activeTab === 'all' ? 'bg-[#1A3561] text-[#60A5FA]' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            All Evidence ({claims.length + sources.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
              activeTab === 'claims' ? 'bg-[#1A3561] text-[#60A5FA]' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Claims ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
              activeTab === 'sources' ? 'bg-[#1A3561] text-[#60A5FA]' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Sources ({sources.length})
          </button>
        </div>

        <div className="relative max-w-xs">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search excerpt or claim text..."
            className="w-full h-8 pl-8 pr-3 bg-[#0C1F3F] border border-[#1E3560] focus:border-[#60A5FA] rounded text-xs font-mono text-[#E2E8F0] placeholder-[#64748B] outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner label="Fetching authoritative evidence records..." />
        </div>
      ) : sources.length === 0 && claims.length === 0 ? (
        <EmptyState
          title="No Evidence Ingested Yet"
          description="The investigation has not persisted any sources or extracted claims yet. Check the investigation detail page for current pipeline stage."
          actionText="View Status"
          onAction={() => navigate(`/investigations/${targetId}`)}
        />
      ) : (
        <div className="space-y-6">
          {/* Claims Section */}
          {(activeTab === 'all' || activeTab === 'claims') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  Extracted Normalized Claims ({filteredClaims.length})
                </h2>
              </div>

              {filteredClaims.length === 0 ? (
                <div className="p-4 bg-[#071428] border border-[#1E3560] rounded text-xs text-[#64748B] font-mono text-center">
                  No claims match the active search filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-[#071428] border border-[#1E3560] hover:border-[#2A4D80] rounded-lg p-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#0C1F3F] text-[#60A5FA] border border-[#1E3560] uppercase">
                            {claim.claim_type}
                          </span>
                          <span className="text-xs font-bold text-[#E2E8F0] font-mono">
                            {claim.subject}: <span className="text-[#60A5FA]">{claim.value}</span>
                          </span>
                        </div>
                        <Badge variant="verification" verificationState={claim.verification_state} />
                      </div>

                      <p className="text-xs text-[#CBD5E1] leading-relaxed mb-3">{claim.text}</p>

                      {claim.rationale && (
                        <div className="p-2.5 rounded bg-[#040D1A] border border-[#1E3560]/70 text-[11px] font-mono text-[#94A3B8] mb-3">
                          <span className="text-[#60A5FA] font-bold">Verification Rationale:</span>{' '}
                          {claim.rationale}
                        </div>
                      )}

                      {/* Linked Evidence IDs */}
                      {claim.evidence_ids && claim.evidence_ids.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#1E3560]/60 text-[10px] font-mono text-[#64748B]">
                          <span>Linked Evidence:</span>
                          {claim.evidence_ids.map((eid) => (
                            <span
                              key={eid}
                              className="px-1.5 py-0.5 rounded bg-[#0C1F3F] text-[#94A3B8] border border-[#1E3560]"
                            >
                              {eid.slice(0, 8)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sources Section */}
          {(activeTab === 'all' || activeTab === 'sources') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#60A5FA]" />
                  Authoritative Sources & Excerpts ({filteredSources.length})
                </h2>
              </div>

              {filteredSources.length === 0 ? (
                <div className="p-4 bg-[#071428] border border-[#1E3560] rounded text-xs text-[#64748B] font-mono text-center">
                  No sources match the active search filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredSources.map((source) => (
                    <div
                      key={source.id}
                      className="bg-[#071428] border border-[#1E3560] rounded-lg p-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0C1F3F] text-[#4ADE80] border border-[#22C55E]/30 uppercase">
                              {source.source_type}
                            </span>
                            <h3 className="text-sm font-semibold text-[#E2E8F0]">{source.title}</h3>
                          </div>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-mono text-[#60A5FA] hover:underline mt-1 break-all"
                          >
                            <span>{source.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>

                        <div className="text-[11px] font-mono text-[#64748B] text-right shrink-0">
                          <div>Retrieved: {new Date(source.retrieved_at).toLocaleString()}</div>
                          {source.published_at && (
                            <div>Published: {new Date(source.published_at).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>

                      {/* Excerpt quote */}
                      {source.excerpt && (
                        <div className="mt-3 p-3 rounded bg-[#040D1A] border-l-2 border-[#60A5FA] text-xs text-[#E2E8F0] leading-relaxed font-mono">
                          "{source.excerpt}"
                        </div>
                      )}

                      {/* Content Hash provenance */}
                      {source.content_hash && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-[#64748B]">
                          <Hash className="w-3 h-3 text-[#64748B]" />
                          <span>SHA256 Hash: {source.content_hash}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
