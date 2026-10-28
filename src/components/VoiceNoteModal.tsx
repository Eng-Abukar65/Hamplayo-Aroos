import React, { useState, useEffect, useRef } from 'react';

interface VoiceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVoiceNote?: (audioData: { name: string; duration: string }) => void;
}

export const VoiceNoteModal: React.FC<VoiceNoteModalProps> = ({
  isOpen,
  onClose,
  onSaveVoiceNote,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTime, setRecordedTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setRecordedTime(0);
      setHasRecorded(false);
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setHasRecorded(true);
    }
  };

  const handleSave = () => {
    if (onSaveVoiceNote) {
      onSaveVoiceNote({
        name: guestName || 'Table Guest',
        duration: formatTime(recordedTime),
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-modal p-6 sm:p-7 border border-[#EFE8DF] animate-scaleUp">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">mic</span>
            <h2 className="font-serif text-2xl font-medium text-primary">Voice Blessing</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant pb-4">
          Record a heartfelt verbal greeting, Somali poetry, or dua directly from your reception seat.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name or family"
            className="w-full px-4 py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:bg-surface-container border border-transparent focus:border-secondary/40 transition-all"
          />

          {/* Waveform / Visualizer simulation */}
          <div className="h-28 rounded-xl bg-surface-container-low border border-[#EFE8DF] flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-1.5 h-12">
              {[40, 75, 50, 90, 60, 30, 80, 100, 45, 65, 85, 30, 70, 50].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-200 ${
                    isRecording
                      ? 'bg-secondary animate-pulse'
                      : hasRecorded
                      ? 'bg-[#C5A059]'
                      : 'bg-outline-variant/50'
                  }`}
                  style={{
                    height: isRecording ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : `${h}%`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-semibold text-primary mt-2">
              {formatTime(recordedTime)}
            </span>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handleToggleRecord}
              type="button"
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isRecording ? 'stop' : 'mic'}
              </span>
            </button>

            {hasRecorded && !isRecording && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                type="button"
                className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:opacity-90 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            )}
          </div>

          {hasRecorded && !isRecording && (
            <div className="pt-2">
              <button
                onClick={handleSave}
                type="button"
                className="w-full py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-all cursor-pointer shadow-sm"
              >
                Save Voice Blessing to Wall 🎙️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
