import React from 'react';

interface CoupleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBlessingModal: () => void;
}

export const CoupleModal: React.FC<CoupleModalProps> = ({
  isOpen,
  onClose,
  onOpenBlessingModal,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-modal p-6 sm:p-8 border border-[#EFE8DF] animate-scaleUp">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">favorite</span>
            <h2 className="font-serif text-2xl font-medium text-primary">Amina &amp; Farhan</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pb-4 font-serif text-xs text-secondary italic">
          <span className="h-px w-10 bg-secondary/30"></span>
          <span>Our Story &amp; Celebration</span>
          <span className="h-px w-10 bg-secondary/30"></span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-on-surface leading-relaxed">
          <p>
            Welcome to our Hambalyo keepsake wall! We are deeply honored and humbled to have our beloved parents, siblings, cherished mentors, dear neighbors, and closest comrades celebrating this milestone with us.
          </p>

          <div className="p-4 rounded-xl bg-surface-container-low border border-[#EFE8DF] space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-secondary">event</span>
              <span>Celebration Schedule</span>
            </div>
            <ul className="text-xs text-on-surface-variant space-y-1.5 pl-6 list-disc">
              <li><strong>Reception &amp; Greetings:</strong> 5:30 PM • The Grand Pavilion</li>
              <li><strong>Dinner &amp; Family Speeches:</strong> 7:00 PM</li>
              <li><strong>Dhaanto, Traditional Songs &amp; Dance:</strong> 8:30 PM</li>
              <li><strong>Digital Keepsake Archival:</strong> Ongoing</li>
            </ul>
          </div>

          <p className="font-serif italic text-primary text-center text-sm pt-1">
            “And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.”
          </p>
        </div>

        <div className="pt-5 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenBlessingModal();
            }}
            type="button"
            className="flex-1 py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer text-center"
          >
            + Leave a Message for Couple ✨
          </button>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-full bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
