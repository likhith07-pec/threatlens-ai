import React from 'react';
import type { VerificationState, InvestigationStatus } from '@/types/api';

interface BadgeProps {
  variant?: 'verification' | 'status' | 'custom';
  verificationState?: VerificationState;
  status?: InvestigationStatus;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'custom',
  verificationState,
  status,
  label,
  className = '',
}) => {
  if (variant === 'verification' && verificationState) {
    switch (verificationState) {
      case 'verified':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#14532D]/70 text-[#4ADE80] border border-[#22C55E]/40 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Verified
          </span>
        );
      case 'partially_supported':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#1E3A8A]/60 text-[#60A5FA] border border-[#60A5FA]/40 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
            Partially Supported
          </span>
        );
      case 'contradicted':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#7F1D1D]/70 text-[#FCA5A5] border border-[#F87171]/40 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
            Contradicted
          </span>
        );
      case 'insufficient_evidence':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#334155]/60 text-[#94A3B8] border border-[#64748B]/40 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
            Insufficient Evidence
          </span>
        );
      case 'needs_review':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#78350F]/70 text-[#FCD34D] border border-[#FBBF24]/40 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            Needs Review
          </span>
        );
    }
  }

  if (variant === 'status' && status) {
    switch (status) {
      case 'completed':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#14532D]/60 text-[#4ADE80] border border-[#22C55E]/30 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Completed
          </span>
        );
      case 'running':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#1E3A8A]/60 text-[#60A5FA] border border-[#60A5FA]/40 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-pulse" />
            Analyzing
          </span>
        );
      case 'queued':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#334155]/60 text-[#CBD5E1] border border-[#475569] ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
            Queued
          </span>
        );
      case 'partial':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#78350F]/60 text-[#FCD34D] border border-[#FBBF24]/30 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            Partial Results
          </span>
        );
      case 'failed':
      case 'cancelled':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#7F1D1D]/60 text-[#FCA5A5] border border-[#F87171]/30 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
            {status === 'failed' ? 'Failed' : 'Cancelled'}
          </span>
        );
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#0C1F3F] text-[#94A3B8] border border-[#1E3560] ${className}`}
    >
      {label}
    </span>
  );
};
