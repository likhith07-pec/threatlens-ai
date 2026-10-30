import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Database,
  Globe,
  GitCompare,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';

export const NewInvestigationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveInvestigation, refreshRecent } = useInvestigation();

  const [cveId, setCveId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check URL query param
  useEffect(() => {
    const paramCve = searchParams.get('cve');
    if (paramCve) {
      setCveId(paramCve.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = cveId.trim().toUpperCase();

    // Regex check: CVE-YYYY-NNNN+
    const cveRegex = /^CVE-\d{4}-\d{4,7}$/i;
    if (!cveRegex.test(formatted)) {
      setValidationError('CVE identifier must follow official format: CVE-YYYY-NNNN (e.g. CVE-2024-3094)');
      return;
    }

    setValidationError(null);
    setApiError(null);
    setIsSubmitting(true);

    try {
      const res = await investigationsApi.createInvestigation(formatted);
      // Set as active investigation
      setActiveInvestigation(res.id, formatted);
      await refreshRecent();
      // Redirect to detail page
      navigate(`/investigations/${res.id}`);
    } catch (err: any) {
      setApiError(err?.detail || 'Failed to submit investigation to backend pipeline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#1E3560]">
        <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#60A5FA]" />
          Launch New Vulnerability Investigation
        </h1>
        <p className="text-xs text-[#94A3B8] font-mono mt-1">
          Initiates automated evidence collection, claim normalization, and contradiction analysis
        </p>
      </div>

      {apiError && <ErrorAlert message={apiError} />}

      {/* Main Input Form Card */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
              Common Vulnerabilities and Exposures (CVE) Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                value={cveId}
                onChange={(e) => {
                  setCveId(e.target.value.toUpperCase());
                  setValidationError(null);
                  setApiError(null);
                }}
                disabled={isSubmitting}
                placeholder="e.g. CVE-2024-3094"
                className="w-full h-11 px-4 bg-[#0C1F3F] border border-[#1E3560] focus:border-[#60A5FA] rounded-md text-base font-mono text-[#E2E8F0] placeholder-[#64748B] outline-none transition-colors"
                autoFocus
              />
            </div>
            {validationError && (
              <div className="flex items-center gap-1.5 text-xs text-[#FCA5A5] mt-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-[#64748B] font-mono">
              Supported Sources: NVD 2.0, CISA KEV, CVE Program, Vendor Feeds
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !cveId.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#1E3560] disabled:text-[#64748B] disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Submitting to Engine...</span>
                </>
              ) : (
                <>
                  <span>Start Investigation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Investigation Pipeline Workflow Stages Overview */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
        <h2 className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider mb-4">
          Automated Pipeline Pipeline Stages
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded bg-[#0C1F3F]/50 border border-[#1E3560]/60">
            <Database className="w-5 h-5 text-[#60A5FA] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#E2E8F0]">1. Authoritative Ingestion</div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Pulls official metadata, CVSS vectors, and affected configurations from NVD and CISA KEV.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded bg-[#0C1F3F]/50 border border-[#1E3560]/60">
            <Globe className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#E2E8F0]">2. Web & Vendor Research</div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Performs bounded research using TinyFish Search/Fetch for patches, exploits, and advisories.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded bg-[#0C1F3F]/50 border border-[#1E3560]/60">
            <GitCompare className="w-5 h-5 text-[#FBBF24] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#E2E8F0]">3. Claim & Contradiction Check</div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Extracts testable claims, links exact source excerpts, and flags temporal or version discrepancies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded bg-[#0C1F3F]/50 border border-[#1E3560]/60">
            <FileText className="w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#E2E8F0]">4. Transparent Risk Synthesis</div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Computes derived ThreatLens score, identifies evidence gaps, and produces exportable intel reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
