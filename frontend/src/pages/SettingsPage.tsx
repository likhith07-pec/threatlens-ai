import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Server,
  Key,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
  Terminal,
} from 'lucide-react';
import { StatusDot } from '@/components/common/StatusDot';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { investigationsApi } from '@/api/investigations';
import type { HealthResponse } from '@/types/api';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await investigationsApi.getHealth();
      setHealth(res);
    } catch (err: any) {
      setError(
        'Unable to reach backend health endpoint (/api/health). Please verify that FastAPI is running on http://127.0.0.1:8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const integrations = [
    {
      name: 'NVD CVE API 2.0',
      description: 'Official National Vulnerability Database feed for baseline CVSS scores and CVE descriptions.',
      envVar: 'NVD_API_KEY',
      status: health?.integrations?.nvd || (health ? 'missing' : 'unknown'),
      required: false,
    },
    {
      name: 'CISA KEV Catalog',
      description: 'Catalog of Known Exploited Vulnerabilities maintained by CISA.',
      envVar: 'Bundled / Direct Fetch',
      status: health?.integrations?.cisa_kev || (health ? 'ok' : 'unknown'),
      required: true,
    },
    {
      name: 'TinyFish Search & Fetch',
      description: 'Live web scraping and search agent for retrieving vendor advisories and security research.',
      envVar: 'TINYFISH_API_KEY',
      status: health?.integrations?.tinyfish || (health ? 'missing' : 'unknown'),
      required: true,
    },
    {
      name: 'Gemini AI Synthesis',
      description: 'LLM adapter for claim extraction assistance and executive briefing drafts.',
      envVar: 'GEMINI_API_KEY',
      status: health?.integrations?.gemini || (health ? 'missing' : 'unknown'),
      required: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E3560]">
        <div>
          <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#60A5FA]" />
            System Integration & Feed Health
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            Non-secret backend dependency status verified against /api/health
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Probe Health
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchHealth} />}

      {/* Backend API Connection Status */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-[#60A5FA]" />
            <h2 className="text-sm font-semibold text-[#E2E8F0]">FastAPI Backend Connection</h2>
          </div>
          <StatusDot status={health ? 'online' : 'offline'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
          <div className="p-3 rounded bg-[#040D1A] border border-[#1E3560]">
            <span className="text-[#64748B] block text-[10px] uppercase">Service Status</span>
            <span
              className={`font-bold ${
                health?.status === 'ok' ? 'text-[#4ADE80]' : 'text-[#F87171]'
              }`}
            >
              {health ? `Operational (${health.status})` : 'Offline / Unreachable'}
            </span>
          </div>

          <div className="p-3 rounded bg-[#040D1A] border border-[#1E3560]">
            <span className="text-[#64748B] block text-[10px] uppercase">Default Base URL</span>
            <span className="text-[#60A5FA]">/api (proxied to :8000)</span>
          </div>

          <div className="p-3 rounded bg-[#040D1A] border border-[#1E3560]">
            <span className="text-[#64748B] block text-[10px] uppercase">Protocol Contract</span>
            <span className="text-[#E2E8F0]">RESTful JSON OpenAPI</span>
          </div>
        </div>
      </div>

      {/* External Feeds & Integrations Table */}
      <div className="bg-[#071428] border border-[#1E3560] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-[#60A5FA]" />
            External Threat Intelligence Feeds & Providers
          </h2>
          <span className="text-[10px] font-mono text-[#64748B]">Read-only status</span>
        </div>

        <div className="space-y-3 font-mono">
          {integrations.map((item) => {
            const isOk = item.status === 'ok' || item.status === 'configured';
            return (
              <div
                key={item.name}
                className="p-4 rounded-lg bg-[#040D1A] border border-[#1E3560] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#E2E8F0] font-sans">{item.name}</span>
                    {item.required && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#1E3A8A] text-[#60A5FA]">
                        Core Pipeline
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] font-sans mt-0.5">{item.description}</p>
                  <div className="mt-1 text-[10px] text-[#64748B]">
                    Env variable: <code className="text-[#CBD5E1] bg-[#071428] px-1 py-0.5 rounded">{item.envVar}</code>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isOk ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-[#4ADE80] bg-[#14532D]/50 border border-[#22C55E]/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-[#FCD34D] bg-[#78350F]/50 border border-[#FBBF24]/40">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Not Configured
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Secrets Guidance */}
      <div className="p-4 rounded-lg bg-[#0C1F3F]/40 border border-[#1E3560] text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#60A5FA] font-mono font-semibold">
          <Terminal className="w-4 h-4" />
          <span>Security Notice for API Keys</span>
        </div>
        <p className="text-[#94A3B8] leading-relaxed">
          In compliance with the ThreatLens AI specification, all third-party credentials (TinyFish,
          Gemini, NVD) are strictly stored in backend environment variables (`.env`) on Member 1's
          server. No secrets are ever exposed or entered via the frontend client.
        </p>
      </div>
    </div>
  );
};
