import React, { useState } from 'react';
import { toggleWeddingPlaylist } from '../utils/audio';

interface HeaderProps {
  onOpenBlessingModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenPhotoModal: () => void;
  onOpenCoupleModal: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  activeNav?: string;
  onSelectNav?: (nav: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBlessingModal,
  onOpenVoiceModal,
  onOpenPhotoModal,
  onOpenCoupleModal,
  isAdmin,
  onToggleAdmin,
  activeNav = 'wall',
  onSelectNav,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const handleToggleMusic = () => {
    toggleWeddingPlaylist((playing) => {
      setIsPlayingMusic(playing);
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_4px_20px_-2px_rgba(74,21,37,0.04)] border-b border-[#EFE8DF]/60 transition-all">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        {/* Brand / Monogram */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectNav?.('wall')}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#4a1525] to-[#775a19] flex items-center justify-center shadow-xs">
            <span className="font-serif italic text-white text-base font-bold tracking-tight">H</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[22px] font-semibold text-primary tracking-tight leading-none">
              Hambalyo
            </span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.14em] mt-1">
              BLESSING KEEPSAKE
            </span>
          </div>
        </div>

        {/* Center Navigation & Event Metadata */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <nav className="flex items-center gap-6 mb-1">
            <button
              onClick={() => onSelectNav?.('wall')}
              className={`text-xs font-semibold tracking-wide transition-colors ${
                activeNav === 'wall'
                  ? 'text-primary border-b-2 border-secondary pb-0.5'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Blessings Wall
            </button>
            <button
              onClick={onOpenVoiceModal}
              className="text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors tracking-wide"
            >
              Voice Notes
            </button>
            <button
              onClick={onOpenPhotoModal}
              className="text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors tracking-wide"
            >
              Photo Keepsakes
            </button>
            <button
              onClick={onOpenCoupleModal}
              className="text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors tracking-wide"
            >
              Amina &amp; Farhan
            </button>
          </nav>
          <div className="flex items-center gap-1.5 font-serif text-xs text-on-surface-variant italic">
            <span>Saturday, August 16, 2025</span>
            <span className="text-secondary">•</span>
            <span>The Grand Pavilion</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Ambient Music Button */}
          <button
            onClick={handleToggleMusic}
            type="button"
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all text-xs font-medium ${
              isPlayingMusic
                ? 'bg-secondary-container text-on-secondary-container shadow-sm animate-pulse ring-1 ring-secondary'
                : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface'
            }`}
            title="Play ambient wedding playlist"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isPlayingMusic ? 'volume_up' : 'music_note'}
            </span>
            <span>{isPlayingMusic ? 'Melody Playing ♫' : 'Wedding Playlist ♫'}</span>
          </button>

          {/* Leave a Message CTA Button */}
          <button
            onClick={onOpenBlessingModal}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary shadow-[0_4px_16px_rgba(74,21,37,0.2)] hover:bg-primary hover:shadow-[0_6px_20px_rgba(74,21,37,0.3)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">stylus_note</span>
            <span className="text-xs font-semibold tracking-wide">+ Leave a Message</span>
          </button>

          {/* Admin Avatar Toggle */}
          <button
            onClick={onToggleAdmin}
            type="button"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative ${
              isAdmin
                ? 'bg-secondary text-white ring-2 ring-secondary ring-offset-2'
                : 'bg-primary text-on-primary hover:opacity-90'
            }`}
            title={isAdmin ? 'Admin Moderation Active (Click to disable)' : 'Moderator / Admin Controls'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAdmin ? 'admin_panel_settings' : 'person'}
            </span>
            {isAdmin && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
