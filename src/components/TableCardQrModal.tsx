import React from 'react';

interface TableCardQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: string;
  coupleNames?: string;
}

export const TableCardQrModal: React.FC<TableCardQrModalProps> = ({
  isOpen,
  onClose,
  tableNumber = "Table 12",
  coupleNames = "Amina & Farhan"
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-modal p-6 border border-[#EFE8DF] animate-scaleUp">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">qr_code_scanner</span>
            <h2 className="font-serif text-xl font-medium text-primary">Reception Table Card</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Printable Table Stationery Preview Card */}
        <div className="p-6 rounded-xl bg-surface border-2 border-[#C5A059]/40 text-center space-y-3 relative overflow-hidden shadow-inner my-2">
          {/* Filigree corner brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/60"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/60"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-secondary/60"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-secondary/60"></div>

          <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-secondary">
            HAMBALYO BLESSINGS
          </div>

          <h3 className="font-serif text-2xl font-semibold text-primary">{coupleNames}</h3>

          <div className="inline-block px-3 py-1 rounded-full bg-secondary-container/50 text-xs font-semibold text-primary border border-secondary/30">
            {tableNumber}
          </div>

          {/* QR Code Graphic */}
          <div className="w-36 h-36 mx-auto bg-white p-2 rounded-lg border border-[#EFE8DF] shadow-xs flex items-center justify-center">
            {/* High visual fidelity QR SVG pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-primary" fill="currentColor">
              {/* Outer markers */}
              <rect x="5" y="5" width="26" height="26" rx="3" fill="#4A1525" />
              <rect x="9" y="9" width="18" height="18" fill="#FFFFFF" />
              <rect x="13" y="13" width="10" height="10" fill="#4A1525" />

              <rect x="69" y="5" width="26" height="26" rx="3" fill="#4A1525" />
              <rect x="73" y="9" width="18" height="18" fill="#FFFFFF" />
              <rect x="77" y="13" width="10" height="10" fill="#4A1525" />

              <rect x="5" y="69" width="26" height="26" rx="3" fill="#4A1525" />
              <rect x="9" y="73" width="18" height="18" fill="#FFFFFF" />
              <rect x="13" y="77" width="10" height="10" fill="#4A1525" />

              {/* Data matrix dots */}
              <rect x="36" y="8" width="6" height="6" fill="#C5A059" />
              <rect x="46" y="8" width="6" height="6" fill="#4A1525" />
              <rect x="56" y="8" width="6" height="6" fill="#4A1525" />

              <rect x="36" y="18" width="6" height="6" fill="#4A1525" />
              <rect x="46" y="18" width="6" height="6" fill="#C5A059" />
              <rect x="56" y="18" width="6" height="6" fill="#4A1525" />

              <rect x="8" y="36" width="6" height="6" fill="#4A1525" />
              <rect x="18" y="36" width="6" height="6" fill="#C5A059" />
              <rect x="28" y="36" width="6" height="6" fill="#4A1525" />
              <rect x="38" y="36" width="6" height="6" fill="#4A1525" />
              <rect x="48" y="36" width="6" height="6" fill="#C5A059" />
              <rect x="58" y="36" width="6" height="6" fill="#4A1525" />
              <rect x="68" y="36" width="6" height="6" fill="#4A1525" />
              <rect x="78" y="36" width="6" height="6" fill="#C5A059" />
              <rect x="88" y="36" width="6" height="6" fill="#4A1525" />

              <rect x="8" y="48" width="6" height="6" fill="#C5A059" />
              <rect x="22" y="48" width="6" height="6" fill="#4A1525" />
              <rect x="38" y="48" width="6" height="6" fill="#4A1525" />
              <rect x="52" y="48" width="6" height="6" fill="#C5A059" />
              <rect x="66" y="48" width="6" height="6" fill="#4A1525" />
              <rect x="80" y="48" width="6" height="6" fill="#4A1525" />

              <rect x="38" y="60" width="6" height="6" fill="#4A1525" />
              <rect x="48" y="60" width="6" height="6" fill="#C5A059" />
              <rect x="58" y="60" width="6" height="6" fill="#4A1525" />
              <rect x="68" y="60" width="6" height="6" fill="#C5A059" />
              <rect x="78" y="60" width="6" height="6" fill="#4A1525" />
              <rect x="88" y="60" width="6" height="6" fill="#4A1525" />

              <rect x="38" y="74" width="6" height="6" fill="#C5A059" />
              <rect x="50" y="74" width="6" height="6" fill="#4A1525" />
              <rect x="62" y="74" width="6" height="6" fill="#4A1525" />
              <rect x="74" y="74" width="6" height="6" fill="#C5A059" />
              <rect x="86" y="74" width="6" height="6" fill="#4A1525" />
            </svg>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-snug">
            Scan with your phone camera to share your blessings, dua, and photos.
          </p>

          <p className="text-[10px] font-mono font-medium text-secondary">
            hambalyo.app/amina-and-farhan
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handlePrint}
            type="button"
            className="flex-1 py-2 rounded-full bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Table Tent</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
