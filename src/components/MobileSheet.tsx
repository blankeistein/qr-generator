import { useEffect } from 'react';
import { X } from 'lucide-react';
import { QrConfig } from '../types';
import CustomPanel from './CustomPanel';

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  draft: QrConfig;
  setDraft: React.Dispatch<React.SetStateAction<QrConfig>>;
  onApply: () => void;
}

export default function MobileSheet({ open, onClose, draft, setDraft, onApply }: MobileSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className="absolute top-0 left-0 bottom-0 bg-[var(--card)] border-r-[3px] border-[var(--border)] overflow-y-auto animate-slide-in-left"
        style={{ width: 'min(340px, 90vw)', boxShadow: '8px 0 0 var(--border)' }}
      >
        {/* Sheet header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b-[3px] border-[var(--border)]"
          style={{ background: 'var(--card)' }}
        >
          <span
            className="text-xl tracking-[3px]"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            ⚙ SETTINGS
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-[2px] border-[var(--border)] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Panel body */}
        <div className="p-4">
          <CustomPanel draft={draft} setDraft={setDraft} onApply={onApply} />
        </div>
      </div>
    </div>
  );
}
