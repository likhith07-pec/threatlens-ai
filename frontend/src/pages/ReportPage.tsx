import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Share2,
  RefreshCw,
  Code,
  FileCode,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useInvestigation } from '@/context/InvestigationContext';
import { reportsApi } from '@/api/reports';
import type { ReportResponse } from '@/types/api';

export const ReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeId, activeCve } = useInvestigation();

  const targetId = searchParams.get('id') || activeId;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [activeView, setActiveView] = useState<'markdown' | 'json'>('markdown');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!targetId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await reportsApi.getReport(targetId);
      setReport(res);
    } catch (err: any) {
      setError(
        err?.detail ||
          'Report not yet generated for this investigation. The backend compiles the report once pipeline stages complete.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [targetId]);

  const handleExport = async (format: 'markdown' | 'json') => {
    if (!targetId) return;
    try {
      setIsExporting(true);
      await reportsApi.exportReport(targetId, format);
    } catch (err: any) {
      alert(`Export failed: ${err?.detail || err?.message || 'Server error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!targetId) {
    return (
      <EmptyState
        title="No Investigation Selected"
        description="Select an investigation from the queue to view or export the synthesized threat intelligence report."
        actionText="View Investigations"
        onAction={() => navigate('/investigations')}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E3560]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#60A5FA]" />
              Threat Intelligence Report & Export
            </h1>
            {activeCve && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0C1F3F] border border-[#2A4D80] text-[#60A5FA]">
                {activeCve}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            Synthesized executive briefing, technical evidence audit, and machine-readable JSON exports
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('markdown')}
            disabled={isExporting || !report}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] disabled:opacity-40 disabled:cursor-not-allowed text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting || !report}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#1E3560] disabled:cursor-not-allowed text-white text-xs font-mono rounded transition-colors shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchReport} />}

      {isLoading ? (
        <div className="py-24">
          <LoadingSpinner label="Compiling intelligence report from persisted findings..." />
        </div>
      ) : !report ? (
        <EmptyState
          title="Report Not Available"
          description="The backend report has not been generated yet for this investigation. If the investigation is running, check the detail page for progress."
          actionText="Check Investigation Detail"
          onAction={() => navigate(`/investigations/${targetId}`)}
        />
      ) : (
        <div className="space-y-4">
          {/* Metadata Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071428] border border-[#1E3560] p-3 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-3 text-[#94A3B8]">
              <span className="flex items-center gap-1 text-[#4ADE80]">
                <CheckCircle2 className="w-4 h-4" />
                Report Ready
              </span>
              <span>Schema v{report.format_version}</span>
              <span>Generated: {new Date(report.generated_at).toLocaleString()}</span>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-[#0C1F3F] p-0.5 rounded border border-[#1E3560]">
              <button
                onClick={() => setActiveView('markdown')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  activeView === 'markdown'
                    ? 'bg-[#1A3561] text-[#60A5FA]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Markdown View
              </button>
              <button
                onClick={() => setActiveView('json')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  activeView === 'json'
                    ? 'bg-[#1A3561] text-[#60A5FA]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Raw JSON
              </button>
            </div>
          </div>

          {/* Content Viewer Card */}
          <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-6 overflow-x-auto">
            {activeView === 'markdown' ? (
              <div className="prose prose-invert max-w-none text-xs text-[#E2E8F0] font-mono leading-relaxed whitespace-pre-wrap">
                {report.content.markdown || 'No markdown body available.'}
              </div>
            ) : (
              <pre className="text-xs text-[#60A5FA] font-mono overflow-x-auto p-4 bg-[#040D1A] border border-[#1E3560] rounded">
                {JSON.stringify(report.content.json || report, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

