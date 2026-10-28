import React from 'react';

interface TableBannerProps {
  onOpenVoiceModal: () => void;
  onOpenPhotoModal: () => void;
}

export const TableBanner: React.FC<TableBannerProps> = ({
  onOpenVoiceModal,
  onOpenPhotoModal,
}) => {
  return (
    <div className="mt-12 p-6 sm:p-7 rounded-2xl bg-surface-container-low border border-[#EFE8DF] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left shadow-xs">
      <div className="space-y-1">
        <h2 className="font-serif text-lg sm:text-xl font-semibold text-primary">
          Joining via Reception Table Card?
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          You can also record an audio voice note or upload portrait moments to the collective album.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenVoiceModal}
          type="button"
          className="px-4 py-2 rounded-full bg-surface-container text-primary text-xs sm:text-sm font-medium hover:bg-surface-container-high hover:shadow-xs transition-all cursor-pointer"
        >
          Record Voice Note 🎙️
        </button>

        <button
          onClick={onOpenPhotoModal}
          type="button"
          className="px-4 py-2 rounded-full bg-surface-container text-primary text-xs sm:text-sm font-medium hover:bg-surface-container-high hover:shadow-xs transition-all cursor-pointer"
        >
          Upload Photos 📷
        </button>
      </div>
    </div>
  );
};
