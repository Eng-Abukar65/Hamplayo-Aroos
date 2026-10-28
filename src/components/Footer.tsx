import React from 'react';

interface FooterProps {
  onOpenTableCardModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenPrivacyModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTableCardModal,
  onOpenVoiceModal,
  onOpenPrivacyModal,
}) => {
  return (
    <footer className="w-full bg-surface-container-low mt-16 border-t border-[#EFE8DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Heart filigree emblem */}
          <div className="flex items-center gap-4 text-secondary">
            <span className="h-px w-16 bg-secondary-container"></span>
            <span className="material-symbols-outlined text-secondary text-[24px]">
              favorite
            </span>
            <span className="h-px w-16 bg-secondary-container"></span>
          </div>

          <div className="space-y-1.5">
            <p className="font-serif text-2xl font-medium text-primary">
              Celebrating Amina &amp; Farhan
            </p>
            <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              May their union be adorned with endless barakah, warmth, and lifelong joy. Thank you for preserving your heartfelt prayers and memories.
            </p>
          </div>

          {/* Interactive QR scan table pill */}
          <button
            onClick={onOpenTableCardModal}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-all cursor-pointer shadow-xs border border-[#EFE8DF]"
          >
            <span className="material-symbols-outlined text-secondary text-[20px]">
              qr_code_scanner
            </span>
            <span className="text-xs sm:text-sm font-medium">
              Scan table card to leave your wish directly from your seat
            </span>
          </button>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between w-full text-on-surface-variant text-xs border-t border-[#EFE8DF]/60">
            <p>© 2025 Hambalyo Wedding Keepsake Suite. Bespoke Somali Matrimonial Stationery.</p>
            <div className="flex gap-4 mt-3 sm:mt-0 text-xs">
              <a
                href="#wall"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Blessings Wall
              </a>
              <button
                onClick={onOpenVoiceModal}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Audio Blessings
              </button>
              <button
                onClick={onOpenPrivacyModal}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Archival Privacy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
