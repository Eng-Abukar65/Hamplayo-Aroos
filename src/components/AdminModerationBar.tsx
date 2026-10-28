import React from 'react';

interface AdminModerationBarProps {
  isAdmin: boolean;
  totalBlessings: number;
  hiddenCount: number;
  showHidden: boolean;
  onToggleShowHidden: () => void;
  onExitAdmin: () => void;
}

export const AdminModerationBar: React.FC<AdminModerationBarProps> = ({
  isAdmin,
  totalBlessings,
  hiddenCount,
  showHidden,
  onToggleShowHidden,
  onExitAdmin,
}) => {
  if (!isAdmin) return null;

  return (
    <div className="bg-amber-900 text-amber-50 px-4 py-2 border-b border-amber-800 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-amber-300">
          admin_panel_settings
        </span>
        <span className="font-semibold tracking-wide">
          Moderator Mode Active
        </span>
        <span className="hidden sm:inline text-amber-200/80">•</span>
        <span className="text-amber-200">
          {totalBlessings} Total | {hiddenCount} Hidden
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleShowHidden}
          className="px-2.5 py-1 rounded bg-amber-800 hover:bg-amber-700 text-amber-100 transition-colors text-[11px] font-medium cursor-pointer"
        >
          {showHidden ? 'Showing Hidden Messages' : 'Hide Hidden from View'}
        </button>
        <button
          onClick={onExitAdmin}
          className="px-2.5 py-1 rounded bg-amber-950 hover:bg-black/40 text-amber-200 transition-colors text-[11px] font-medium cursor-pointer"
        >
          Exit Admin
        </button>
      </div>
    </div>
  );
};
