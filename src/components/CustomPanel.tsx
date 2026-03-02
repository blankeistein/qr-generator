import { useRef } from 'react';
import { Upload, X, Zap } from 'lucide-react';
import { QrConfig, ImageFormat } from '../types';

interface CustomPanelProps {
  draft: QrConfig;
  setDraft: React.Dispatch<React.SetStateAction<QrConfig>>;
  onApply: () => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, unit = 'px', onChange }: SliderRowProps) {
  return (
    <div className="mb-4">
      <label className="label-brutal">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
            className="input-brutal text-center"
            style={{ width: 58, padding: '4px 6px', fontSize: 12 }}
          />
          <span className="text-[11px] font-bold opacity-60">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function CustomPanel({ draft, setDraft, onApply }: CustomPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraft((d) => ({ ...d, logoImage: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div>
      {/* ── Logo Image ── */}
      <div className="mb-5">
        <label className="label-brutal">Logo Image</label>
        {draft.logoImage ? (
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 border-[2px] border-[var(--border)] flex items-center justify-center overflow-hidden"
              style={{ background: '#fff' }}
            >
              <img
                src={draft.logoImage}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-ghost text-[10px] px-2 py-1"
                style={{ boxShadow: '2px 2px 0 var(--border)' }}
              >
                Replace
              </button>
              <button
                onClick={() => setDraft((d) => ({ ...d, logoImage: null }))}
                className="btn-brutal bg-red-400 text-black text-[10px] px-2 py-1"
                style={{ boxShadow: '2px 2px 0 var(--border)' }}
              >
                <span className="flex items-center gap-1"><X size={10} /> Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-ghost w-full text-left flex items-center gap-2"
            style={{ padding: '10px 12px' }}
          >
            <Upload size={14} />
            <span className="text-xs">Upload PNG / JPEG / SVG</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {/* ── Logo controls (only when logo present) ── */}
      {draft.logoImage && (
        <div
          className="mb-4 p-3 border-[2px] border-dashed border-[var(--border)]"
          style={{ borderColor: 'var(--border)', opacity: 0.9 }}
        >
          <SliderRow
            label="Logo Size"
            value={draft.logoSize}
            min={10}
            max={100}
            onChange={(v) => setDraft((d) => ({ ...d, logoSize: v }))}
          />
          <SliderRow
            label="Logo Padding"
            value={draft.logoPadding}
            min={0}
            max={20}
            onChange={(v) => setDraft((d) => ({ ...d, logoPadding: v }))}
          />
        </div>
      )}

      {/* ── QR Size ── */}
      <SliderRow
        label="QR Code Size"
        value={draft.size}
        min={64}
        max={1024}
        onChange={(v) => setDraft((d) => ({ ...d, size: v }))}
      />

      {/* ── Padding ── */}
      <SliderRow
        label="Padding"
        value={draft.padding}
        min={0}
        max={40}
        onChange={(v) => setDraft((d) => ({ ...d, padding: v }))}
      />

      {/* ── Colors ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Foreground', field: 'fgColor' as const },
          { label: 'Background', field: 'bgColor' as const },
        ].map(({ label, field }) => (
          <div key={field}>
            <label className="label-brutal">{label}</label>
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={draft[field] as string}
                onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                className="w-9 h-9 border-[2px] border-[var(--border)] cursor-pointer"
                style={{ padding: 2 }}
              />
              <input
                type="text"
                value={draft[field] as string}
                onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                className="input-brutal uppercase"
                style={{ fontSize: 11, padding: '4px 6px', letterSpacing: 1 }}
                maxLength={7}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Format ── */}
      <div className="mb-5">
        <label className="label-brutal">Export Format</label>
        <div className="flex gap-2">
          {(['png', 'jpeg', 'svg'] as ImageFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setDraft((d) => ({ ...d, format: fmt }))}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider border-[2px] border-[var(--border)] transition-all`}
              style={{
                fontFamily: 'Space Mono, monospace',
                background: draft.format === fmt ? 'var(--fg)' : 'var(--card)',
                color: draft.format === fmt ? 'var(--bg)' : 'var(--fg)',
                boxShadow: draft.format === fmt ? '2px 2px 0 var(--border)' : 'none',
              }}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
        {draft.format === 'svg' && (
          <p className="mt-1.5 text-[10px] opacity-50 font-mono">
            * SVG preview only — exported as PNG
          </p>
        )}
      </div>

      {/* ── Apply ── */}
      <button onClick={onApply} className="btn-primary w-full flex items-center justify-center gap-2">
        <Zap size={14} />
        Apply Changes
      </button>
    </div>
  );
}
