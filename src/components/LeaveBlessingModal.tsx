import React, { useState, useEffect, useRef } from 'react';
import { Relationship, NewBlessingInput } from '../types';

interface LeaveBlessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewBlessingInput) => Promise<void>;
}

const RELATIONSHIP_OPTIONS: Relationship[] = [
  'Waalid',
  'Walal',
  'Saaxib',
  'Xiriir',
  'Macallin',
  'Jaar',
];

export const LeaveBlessingModal: React.FC<LeaveBlessingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [guestName, setGuestName] = useState('');
  const [selectedRelation, setSelectedRelation] = useState<Relationship>('Saaxib');
  const [message, setMessage] = useState('');
  const [includePhoto, setIncludePhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        guest_name: guestName.trim(),
        relationship: selectedRelation,
        content: message.trim(),
        photo_url: includePhoto ? photoPreview : null,
      });

      // Reset
      setGuestName('');
      setMessage('');
      setSelectedRelation('Saaxib');
      setIncludePhoto(false);
      setPhotoPreview(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-modal p-6 sm:p-8 overflow-hidden border border-[#EFE8DF] animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              stylus_note
            </span>
            <h2 className="font-serif text-2xl font-medium text-primary">
              Send Your Blessings
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-2 pb-4 font-serif text-xs sm:text-sm text-secondary italic">
          <span className="h-px w-10 bg-secondary/30"></span>
          <span>Amina &amp; Farhan Keepsake Wall</span>
          <span className="h-px w-10 bg-secondary/30"></span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase text-on-surface-variant tracking-[0.12em]">
              Your Name or Family
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g., Khadija & Family"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-sm focus:outline-none focus:bg-surface-container border border-transparent focus:border-secondary/40 transition-all"
            />
          </div>

          {/* Field 2: Relationship Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase text-on-surface-variant tracking-[0.12em]">
              Relationship to Couple
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RELATIONSHIP_OPTIONS.map((rel) => {
                const isSelected = selectedRelation === rel;
                return (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setSelectedRelation(rel)}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-secondary-container text-on-secondary-container font-semibold ring-1 ring-secondary/50 shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Message Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase text-on-surface-variant tracking-[0.12em]">
                Your Blessing / Message
              </label>
              <span className="text-xs text-outline font-normal">
                {message.length} / 350
              </span>
            </div>
            <textarea
              required
              maxLength={350}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your heartfelt congratulations, memories, or dua for Amina & Farhan..."
              className="w-full p-4 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-serif italic text-sm focus:outline-none focus:bg-surface-container border border-transparent focus:border-secondary/40 transition-all resize-none"
            />
          </div>

          {/* Photo Checkbox & Optional Upload */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant text-xs hover:text-on-surface transition-colors select-none">
              <input
                type="checkbox"
                checked={includePhoto}
                onChange={(e) => setIncludePhoto(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-4 h-4 rounded bg-surface-container-high peer-checked:bg-primary-container flex items-center justify-center transition-all">
                <span
                  className={`material-symbols-outlined text-[12px] text-on-primary ${
                    includePhoto ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  check
                </span>
              </div>
              <span>Include table portrait photo 📷</span>
            </label>

            {includePhoto && (
              <div className="p-3 bg-surface-container-low rounded-xl border border-dashed border-secondary/40 animate-fadeIn">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="relative flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-[#EFE8DF]"
                    />
                    <div className="flex-1 text-xs">
                      <p className="text-primary font-medium">Portrait attached</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-secondary underline hover:text-primary mt-1 inline-block"
                      >
                        Change photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs text-secondary font-medium hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                    <span>Select photo from phone / device</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !guestName.trim() || !message.trim()}
              className="w-full py-3 rounded-full bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-primary hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer group"
            >
              <span>{isSubmitting ? 'Posting...' : 'Post to Wall'}</span>
              <span className="text-secondary-fixed group-hover:scale-125 transition-transform">
                ✨
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
