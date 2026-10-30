import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Analyzing Vulnerability Intelligence...',
  subtext = 'Gathering authoritative evidence and correlating claims',
  size = 'md',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-4">
        {/* Radar concentric rings */}
        <div className="w-16 h-16 rounded-full border border-[#1E3560] flex items-center justify-center animate-spin">
          <div className="w-12 h-12 rounded-full border border-t-[#60A5FA] border-r-transparent border-b-[#1E3560] border-l-transparent animate-spin" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-[#60A5FA]" />
        </div>
      </div>
      <div className="text-sm font-semibold text-[#E2E8F0] tracking-wide font-mono mb-1 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-[#60A5FA] animate-pulse" />
        {label}
      </div>
      {subtext && <div className="text-xs text-[#64748B] max-w-sm">{subtext}</div>}
    </div>
  );
};

