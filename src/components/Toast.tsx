import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-primary text-white shadow-xl border border-secondary/40 animate-slideUp">
      <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
        check_circle
      </span>
      <span className="text-xs sm:text-sm font-medium tracking-wide">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/70 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
