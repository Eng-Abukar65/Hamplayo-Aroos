import React, { useState } from 'react';
import { Blessing } from '../types';

interface BlessingCardProps {
  blessing: Blessing;
  onLike: (id: string, currentLikes: number) => void;
  isAdmin?: boolean;
  onModerate?: (id: string, isApproved: boolean) => void;
  onDelete?: (id: string) => void;
}

export const BlessingCard: React.FC<BlessingCardProps> = ({
  blessing,
  onLike,
  isAdmin = false,
  onModerate,
  onDelete,
}) => {
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(blessing.likes || 0);

  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setLocalLikes((prev) => prev + 1);
      onLike(blessing.id, localLikes);
    } else {
      setHasLiked(false);
      setLocalLikes((prev) => Math.max(0, prev - 1));
    }
  };

  // Badge styles according to relationship
  const getBadgeStyle = (rel: string) => {
    switch (rel) {
      case 'Waalid':
        return 'bg-secondary-container text-on-secondary-container font-semibold';
      case 'Walal':
        return 'bg-secondary-container/60 text-secondary font-semibold';
      case 'Saaxib':
        return 'bg-surface-container-low text-secondary font-semibold shadow-xs';
      case 'Macallin':
        return 'bg-surface-container-high text-on-surface font-semibold';
      case 'Xiriir':
        return 'bg-surface-container-low text-secondary font-semibold';
      case 'Jaar':
        return 'bg-surface-container-low text-on-surface-variant font-semibold';
      default:
        return 'bg-surface-container-low text-secondary font-semibold';
    }
  };

  const isHidden = !blessing.is_approved;

  return (
    <div
      className={`stationery-card bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
        isHidden ? 'opacity-60 bg-amber-50/40 border-dashed border-amber-300' : ''
      }`}
    >
      {/* Moderation Alert Ribbon if Hidden */}
      {isHidden && (
        <div className="mb-2 py-1 px-2.5 rounded bg-amber-100 text-amber-900 text-[11px] font-medium flex items-center justify-between">
          <span>Message hidden by moderator</span>
          {isAdmin && (
            <button
              onClick={() => onModerate?.(blessing.id, true)}
              className="underline font-bold hover:text-amber-950"
            >
              Restore
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Card Header: Guest Name & Relationship Pill */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-[20px] font-semibold text-primary leading-snug">
              {blessing.guest_name}
            </span>
            <span className="text-xs text-on-surface-variant mt-0.5">
              {blessing.display_time || 'Just now'}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0 ${getBadgeStyle(
              blessing.relationship
            )}`}
          >
            {blessing.relationship === 'Waalid' ? '• Waalid' : blessing.relationship}
          </span>
        </div>

        {/* Highlight Quote Box (e.g. Arabic blessing/Dua) */}
        {blessing.highlight_text && (
          <div className="p-3 rounded-xl bg-surface-container-low font-serif text-sm sm:text-[15px] text-primary italic leading-relaxed border border-[#EFE8DF]/80">
            “{blessing.highlight_text}”
          </div>
        )}

        {/* Body Message */}
        {blessing.is_calligraphy ? (
          <p className="font-serif text-base sm:text-lg text-primary leading-relaxed italic">
            “{blessing.content}”
          </p>
        ) : (
          <p className="text-sm sm:text-[15px] text-on-surface leading-relaxed">
            “{blessing.content}”
          </p>
        )}

        {/* Photo Attachment if present */}
        {blessing.photo_url && (
          <div className="mt-2 rounded-xl overflow-hidden border border-[#EFE8DF] max-h-48 bg-stone-100">
            <img
              src={blessing.photo_url}
              alt="Table keepsake"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Card Footer: Decorative Label & Heart Counter / Admin Actions */}
      <div className="pt-5 mt-2 flex items-center justify-between text-on-surface-variant text-xs border-t border-[#EFE8DF]/50">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
          <span className="font-serif italic text-secondary font-medium">
            {blessing.custom_tag || 'Heartfelt Blessing'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Moderation Buttons */}
          {isAdmin && (
            <div className="flex items-center gap-1 bg-surface-container-high/60 px-1.5 py-0.5 rounded-full">
              <button
                onClick={() => onModerate?.(blessing.id, !blessing.is_approved)}
                title={blessing.is_approved ? 'Hide message' : 'Approve message'}
                className="p-1 hover:text-primary transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {blessing.is_approved ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              <button
                onClick={() => onDelete?.(blessing.id)}
                title="Delete message permanently"
                className="p-1 hover:text-red-700 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  delete
                </span>
              </button>
            </div>
          )}

          {/* Heart / Like Button */}
          <button
            onClick={handleLike}
            type="button"
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all cursor-pointer ${
              hasLiked
                ? 'text-primary bg-primary-fixed/30 font-semibold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/60'
            }`}
            title="Send love"
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform ${
                hasLiked ? 'text-surface-tint fill-current scale-110' : 'text-surface-tint'
              }`}
            >
              favorite
            </span>
            <span className="font-medium text-xs">{localLikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
