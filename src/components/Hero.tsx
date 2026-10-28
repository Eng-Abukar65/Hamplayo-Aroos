import React from 'react';

interface HeroProps {
  totalCount: number;
  onOpenBlessingModal: () => void;
  tableNumber?: string;
  onOpenTableCardModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalCount,
  onOpenBlessingModal,
  tableNumber = "Table 12 Live Reception",
  onOpenTableCardModal
}) => {
  return (
    <div className="relative flex flex-col items-center text-center space-y-4 mb-10 pt-4">
      {/* Golden Filigree Starburst Monogram Ornament */}
      <div className="inline-flex items-center justify-center p-2 rounded-full bg-secondary-container/40 text-secondary shadow-xs">
        <svg
          className="w-10 h-10 transition-transform duration-700 hover:rotate-45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          viewBox="0 0 48 48"
        >
          <path d="M24 6c-3 6-8 10-14 11 6 3 10 8 11 15 2-7 6-12 14-13-8-2-12-6-14-13z" />
          <path d="M12 24c4-1 7-4 8-8" strokeDasharray="2 2" />
          <path d="M36 24c-4-1-7-4-8-8" strokeDasharray="2 2" />
          <circle cx="24" cy="24" fill="currentColor" r="1.5" />
        </svg>
      </div>

      {/* Main Title & Couple Subheading */}
      <div className="space-y-2 max-w-2xl px-4">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-primary tracking-tight font-semibold leading-tight">
          Amina &amp; Farhan
        </h1>
        <div className="flex items-center justify-center gap-3 font-serif text-base sm:text-lg text-secondary italic">
          <span className="h-px w-8 sm:w-12 bg-secondary/30"></span>
          <span>Wedding Message Wall — Leave your blessing</span>
          <span className="h-px w-8 sm:w-12 bg-secondary/30"></span>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant tracking-wide font-normal">
          August 16, 2025 • The Grand Pavilion, Minneapolis
        </p>
      </div>

      {/* Stat Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-low text-primary shadow-xs border border-[#EFE8DF]">
          <span className="text-secondary text-xs">✨</span>
          <span className="text-xs font-semibold tracking-wide">
            {totalCount} Blessings shared
          </span>
        </div>

        <button
          onClick={onOpenTableCardModal}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant shadow-xs border border-[#EFE8DF] hover:border-secondary/40 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">
            location_on
          </span>
          <span className="text-xs tracking-wide font-medium">{tableNumber}</span>
        </button>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          onClick={onOpenBlessingModal}
          type="button"
          className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-container text-on-primary shadow-md hover:bg-primary hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary-container">
            stylus_note
          </span>
          <span className="text-sm sm:text-base font-semibold tracking-wide">
            + Leave a Message
          </span>
          <span className="text-secondary-fixed text-sm group-hover:scale-125 transition-transform">
            ✨
          </span>
        </button>
      </div>
    </div>
  );
};
