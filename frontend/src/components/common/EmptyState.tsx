import React from 'react';
import { Database, Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#071428]/40 border border-[#1E3560] border-dashed rounded-lg">
      <div className="w-12 h-12 rounded-lg bg-[#0C1F3F] border border-[#1E3560] flex items-center justify-center text-[#64748B] mb-4">
        {icon || <Database className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-[#E2E8F0] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-medium rounded transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          {actionText}
        </button>
      )}
    </div>
  );
};
