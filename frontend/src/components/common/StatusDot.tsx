import React from 'react';

interface StatusDotProps {
  status: 'online' | 'busy' | 'offline' | 'warning';
  pulse?: boolean;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  pulse = true,
  className = '',
}) => {
  const colorMap = {
    online: 'bg-[#22C55E]',
    busy: 'bg-[#60A5FA]',
    offline: 'bg-[#F87171]',
    warning: 'bg-[#FBBF24]',
  };

  const glowMap = {
    online: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    busy: 'shadow-[0_0_8px_rgba(96,165,250,0.6)]',
    offline: 'shadow-[0_0_8px_rgba(248,113,113,0.6)]',
    warning: 'shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  };

  return (
    <span className={`relative inline-flex items-center justify-center w-2.5 h-2.5 ${className}`}>
      {pulse && (
        <span
          className={`absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping ${colorMap[status]}`}
        />
      )}
      <span className={`relative inline-flex w-2 h-2 rounded-full ${colorMap[status]} ${glowMap[status]}`} />
    </span>
  );
};
