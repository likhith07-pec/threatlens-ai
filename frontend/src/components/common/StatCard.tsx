import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'green' | 'amber' | 'red' | 'blue';
  icon?: React.ReactNode;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  variant = 'default',
  icon,
  trend,
}) => {
  const valueColorMap = {
    default: 'text-[#E2E8F0]',
    green: 'text-[#4ADE80]',
    amber: 'text-[#FCD34D]',
    red: 'text-[#FCA5A5]',
    blue: 'text-[#60A5FA]',
  };

  const accentBorderMap = {
    default: 'border-[#1E3560] hover:border-[#2A4D80]',
    green: 'border-[#1E3560] hover:border-[#22C55E]/40',
    amber: 'border-[#1E3560] hover:border-[#FBBF24]/40',
    red: 'border-[#1E3560] hover:border-[#F87171]/40',
    blue: 'border-[#1E3560] hover:border-[#60A5FA]/40',
  };

  return (
    <div
      className={`bg-[#071428] border rounded-lg p-4 transition-all duration-200 ${accentBorderMap[variant]}`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-[#94A3B8] mb-2">
        <span className="tracking-wide uppercase text-[11px] font-mono">{label}</span>
        {icon && <span className="text-[#64748B]">{icon}</span>}
      </div>
      <div className={`font-mono text-2xl font-bold tracking-tight mb-1 ${valueColorMap[variant]}`}>
        {value}
      </div>
      {(subtext || trend) && (
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>{subtext}</span>
          {trend && <span className="font-mono text-[11px] text-[#94A3B8]">{trend}</span>}
        </div>
      )}
    </div>
  );
};

