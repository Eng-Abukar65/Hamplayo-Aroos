import React, { useState, useRef } from 'react';

interface PhotoKeepsakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto?: (photoUrl: string, caption: string) => void;
}

export const PhotoKeepsakeModal: React.FC<PhotoKeepsakeModalProps> = ({
  isOpen,
  onClose,
  onAddPhoto,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (photoPreview && onAddPhoto) {
      onAddPhoto(photoPreview, caption);
    }
    setPhotoPreview(null);
    setCaption('');
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
            <span className="material-symbols-outlined text-secondary text-[24px]">photo_camera</span>
            <h2 className="font-serif text-2xl font-medium text-primary">Photo Keepsake</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant pb-4">
          Upload candid reception memories, table portraits, or celebratory smiles for Amina &amp; Farhan.
        </p>

        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#EFE8DF] bg-stone-100 max-h-60 flex items-center justify-center">
              <img src={photoPreview} alt="Upload preview" className="max-h-60 object-contain w-full" />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-44 rounded-xl border-2 border-dashed border-[#EFE8DF] hover:border-secondary/60 bg-surface-container-low flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
              </div>
              <span className="text-xs font-medium text-primary">Tap to select photo from device</span>
              <span className="text-[11px] text-on-surface-variant">JPEG, PNG, or HEIC portrait</span>
            </div>
          )}

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a sweet photo caption or table number..."
            className="w-full px-4 py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:bg-surface-container border border-transparent focus:border-secondary/40 transition-all"
          />

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={!photoPreview}
              type="button"
              className="w-full py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              Add to Wedding Gallery 📷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
