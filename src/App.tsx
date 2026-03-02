import { useState, useCallback, useRef } from 'react';
import { Download, QrCode } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import JSZip from 'jszip';

import Header from './components/Header';
import CustomPanel from './components/CustomPanel';
import MobileSheet from './components/MobileSheet';
import QRPreview from './components/QRPreview';

import { useTheme } from './hooks/useTheme';
import { renderQRToCanvas, downloadCanvas } from './hooks/useQrRenderer';
import { QrConfig, DEFAULT_CONFIG } from './types';

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'single' | 'multiple';

// ─── Inline SingleInput ───────────────────────────────────────────────────────
function SingleInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="card p-5 animate-fade-in">
      <label className="label-brutal flex items-center gap-1.5">
        <QrCode size={11} /> URL / Text
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com"
        className="input-brutal text-sm"
      />
      <p className="mt-2 text-[10px] opacity-40 font-mono leading-relaxed">
        URLs · plain text · email · phone · Wi-Fi · vCard · anything
      </p>
    </div>
  );
}

// ─── Inline MultiInput ────────────────────────────────────────────────────────
function MultiInput({
  value,
  onChange,
  count,
}: {
  value: string;
  onChange: (v: string) => void;
  count: number;
}) {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <label className="label-brutal mb-0 flex items-center gap-1.5">
          <QrCode size={11} /> URLs (one per line)
        </label>
        <span
          className="tag text-[9px]"
          style={{
            background: count > 0 ? 'var(--accent)' : 'transparent',
            color: count > 0 ? '#000' : 'var(--fg)',
          }}
        >
          {count} item{count !== 1 ? 's' : ''}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder={'https://example.com\nhttps://github.com\nhttps://anthropic.com'}
        className="input-brutal text-sm leading-relaxed"
        style={{ resize: 'vertical', minHeight: 160 }}
      />
      <p className="mt-2 text-[10px] opacity-40 font-mono">
        Each line becomes a separate QR code in the ZIP archive.
      </p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('single');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Config
  const [config, setConfig] = useState<QrConfig>(DEFAULT_CONFIG);
  const [draft, setDraft] = useState<QrConfig>(DEFAULT_CONFIG);

  // Single mode
  const [singleText, setSingleText] = useState('https://example.com');
  const [singleDownloading, setSingleDownloading] = useState(false);

  // Multi mode
  const [multiRaw, setMultiRaw] = useState(
    'https://example.com\nhttps://github.com\nhttps://anthropic.com\nhttps://react.dev'
  );
  const [zipLoading, setZipLoading] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const multiLines = multiRaw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const miniConfig: QrConfig = {
    ...config,
    size: 96,
    padding: 4,
    logoSize: Math.max(12, Math.round(config.logoSize * 0.38)),
    logoPadding: Math.max(2, Math.round(config.logoPadding * 0.5)),
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleApply = useCallback(() => {
    setConfig({ ...draft });
    toast.success('Config applied! ⚡');
    setSheetOpen(false);
  }, [draft]);

  const handleSingleDownload = useCallback(async () => {
    if (singleDownloading) return;
    setSingleDownloading(true);
    try {
      const canvas = await renderQRToCanvas(singleText || 'https://example.com', config);
      const safe = (singleText || 'qrcode').replace(/[^a-z0-9]/gi, '_').slice(0, 40);
      const ext = config.format === 'jpeg' ? 'jpg' : 'png';
      downloadCanvas(canvas, `${safe}.${ext}`, config.format);
      toast.success(`Saved as ${ext.toUpperCase()}!`);
    } catch {
      toast.error('Download failed. Please try again.');
    }
    setSingleDownloading(false);
  }, [singleText, config, singleDownloading]);

  const handleDownloadZip = useCallback(async () => {
    if (zipLoading || multiLines.length === 0) return;
    setZipLoading(true);
    const tid = toast.loading(`Generating ${multiLines.length} QR codes…`);
    try {
      const zip = new JSZip();
      const ext = config.format === 'jpeg' ? 'jpg' : 'png';
      const mime = config.format === 'jpeg' ? 'image/jpeg' : 'image/png';
      for (let i = 0; i < multiLines.length; i++) {
        const canvas = await renderQRToCanvas(multiLines[i], config);
        const b64 = canvas.toDataURL(mime, 0.95).split(',')[1];
        const safe = multiLines[i].replace(/[^a-z0-9]/gi, '_').slice(0, 40);
        zip.file(`qrcode_${String(i + 1).padStart(2, '0')}_${safe}.${ext}`, b64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'qrcodes.zip';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${multiLines.length} QR codes → qrcodes.zip ✅`, { id: tid });
    } catch {
      toast.error('ZIP generation failed.', { id: tid });
    }
    setZipLoading(false);
  }, [multiLines, config, zipLoading]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Toast */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'Space Mono, monospace',
            fontSize: 12,
            border: '3px solid #000',
            boxShadow: '4px 4px 0 #000',
            borderRadius: 0,
            background: isDark ? '#1a1a1a' : '#fff',
            color: isDark ? '#f5f0e8' : '#0a0a0a',
          },
          success: {
            iconTheme: { primary: '#f5c518', secondary: '#000' },
          },
        }}
      />

      {/* Header */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setSheetOpen(true)}
      />

      {/* Mobile sheet */}
      <MobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        draft={draft}
        setDraft={setDraft}
        onApply={handleApply}
      />

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Tab selector */}
            <div
              className="inline-flex border-[3px] border-[var(--border)] self-start"
              style={{ boxShadow: '4px 4px 0 var(--border)' }}
            >
              {(['single', 'multiple'] as Tab[]).map((t, idx) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all"
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    background: tab === t ? 'var(--fg)' : 'var(--card)',
                    color: tab === t ? 'var(--bg)' : 'var(--fg)',
                    borderRight: idx === 0 ? '2px solid var(--border)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {t === 'single' ? '01 — Single' : '02 — Multiple'}
                </button>
              ))}
            </div>

            {/* Mode inputs */}
            {tab === 'single' ? (
              <SingleInput value={singleText} onChange={setSingleText} />
            ) : (
              <MultiInput
                value={multiRaw}
                onChange={setMultiRaw}
                count={multiLines.length}
              />
            )}

            {/* Desktop Customization Panel */}
            <div className="hidden lg:block card p-5">
              <div
                className="text-xl tracking-[3px] border-b-[2px] border-[var(--border)] pb-2.5 mb-5"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                ⚙ Customization
              </div>
              <CustomPanel draft={draft} setDraft={setDraft} onApply={handleApply} />
            </div>
          </div>

          {/* ── Right column: sticky preview ── */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div
              className="card p-5 sticky top-20"
              style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
            >
              {tab === 'single' ? (
                <>
                  {/* Header */}
                  <div
                    className="text-xl tracking-[3px] border-b-[2px] border-[var(--border)] pb-2.5 mb-4"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    ◉ Preview
                  </div>

                  {/* QR Canvas */}
                  <div
                    className="flex justify-center items-center p-5 border-[2px] border-dashed border-[var(--border)] mb-4"
                    style={{ background: config.bgColor }}
                  >
                    <QRPreview text={singleText} config={config} />
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      ['Size', `${config.size + config.padding * 2}px`],
                      ['Format', config.format.toUpperCase()],
                      ['FG', config.fgColor],
                      ['BG', config.bgColor],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="border-[2px] border-[var(--border)] px-2 py-1.5"
                        style={{ background: 'var(--bg)' }}
                      >
                        <div className="label-brutal mb-0.5" style={{ fontSize: 8 }}>{k}</div>
                        <div className="font-mono text-[11px] font-bold truncate">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Download */}
                  <button
                    onClick={handleSingleDownload}
                    disabled={singleDownloading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Download size={13} />
                    {singleDownloading
                      ? 'Generating…'
                      : `Download ${config.format.toUpperCase()}`}
                  </button>
                </>
              ) : (
                <>
                  {/* Multi preview header */}
                  <div className="flex items-center justify-between border-b-[2px] border-[var(--border)] pb-2.5 mb-4">
                    <div
                      className="text-xl tracking-[3px]"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      ◉ Preview
                    </div>
                    <span
                      className="tag text-[9px]"
                      style={{ background: 'var(--accent)', color: '#000' }}
                    >
                      {multiLines.length}
                    </span>
                  </div>

                  {/* Grid */}
                  {multiLines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30">
                      <QrCode size={32} />
                      <p className="text-[11px] font-mono mt-3">Add URLs above</p>
                    </div>
                  ) : (
                    <div
                      className="overflow-y-auto border-[2px] border-dashed border-[var(--border)] p-2 mb-4"
                      style={{ maxHeight: 380, background: isDark ? '#0a0a0a' : '#f0ece2' }}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {multiLines.map((line, i) => (
                          <div
                            key={`${i}-${line.slice(0, 20)}`}
                            className="border-[2px] border-[var(--border)] p-1.5 flex flex-col items-center gap-1"
                            style={{ background: 'var(--card)' }}
                          >
                            <QRPreview text={line} config={miniConfig} />
                            <span
                              className="w-full text-center font-mono truncate"
                              style={{ fontSize: 8, opacity: 0.5 }}
                              title={line}
                            >
                              {line}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ZIP download */}
                  <button
                    onClick={handleDownloadZip}
                    disabled={zipLoading || multiLines.length === 0}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    style={{ opacity: multiLines.length === 0 ? 0.4 : 1 }}
                  >
                    <Download size={13} />
                    {zipLoading
                      ? 'Generating…'
                      : `Download All .ZIP (${multiLines.length})`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t-[3px] border-[var(--border)] py-4 text-center font-mono opacity-50"
        style={{ fontSize: 11 }}
      >
        Made with ❤️ for U
      </footer>
    </div>
  );
}
