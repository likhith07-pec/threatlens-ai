import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Intelligence Retrieval Failed',
  message,
  code,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#7F1D1D]/20 border border-[#F87171]/40 rounded-lg p-4 text-[#FCA5A5] ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#FCA5A5] flex items-center justify-between">
            <span>{title}</span>
            {code && (
              <span className="font-mono text-[10px] bg-[#7F1D1D]/60 px-1.5 py-0.5 rounded border border-[#F87171]/30">
                {code}
              </span>
            )}
          </div>
          <div className="text-xs text-[#E2E8F0]/80 mt-1 leading-relaxed">{message}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#7F1D1D]/50 hover:bg-[#7F1D1D] text-xs font-medium rounded border border-[#F87171]/40 text-[#FCA5A5] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
