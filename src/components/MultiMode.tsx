import { useState, useCallback } from 'react';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { QrConfig } from '../types';
import QRPreview from './QRPreview';
import { renderQRToCanvas } from '../hooks/useQrRenderer';

interface MultiModeProps {
  config: QrConfig;
}

const PLACEHOLDER = `https://example.com
https://github.com
https://anthropic.com
https://react.dev`;

export default function MultiMode({ config }: MultiModeProps) {
  const [rawText, setRawText] = useState(PLACEHOLDER);
  const [zipLoading, setZipLoading] = useState(false);

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const handleDownloadZip = useCallback(async () => {
    if (zipLoading || lines.length === 0) return;
    setZipLoading(true);

    const toastId = toast.loading(`Generating ${lines.length} QR codes…`);

    try {
      const zip = new JSZip();
      const ext = config.format === 'jpeg' ? 'jpg' : 'png';
      const mime = config.format === 'jpeg' ? 'image/jpeg' : 'image/png';

      for (let i = 0; i < lines.length; i++) {
        const text = lines[i];
        const canvas = await renderQRToCanvas(text, config);
        const dataUrl = canvas.toDataURL(mime, 0.95);
        const base64 = dataUrl.split(',')[1];
        const safeName = text.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
        zip.file(`qrcode_${String(i + 1).padStart(2, '0')}_${safeName}.${ext}`, base64, {
          base64: true,
        });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcodes.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${lines.length} QR codes saved as qrcodes.zip!`, { id: toastId });
    } catch (err) {
      toast.error('ZIP generation failed. Please try again.', { id: toastId });
      console.error(err);
    }

    setZipLoading(false);
  }, [lines, config, zipLoading]);

  const miniConfig: QrConfig = {
    ...config,
    size: 96,
    padding: 4,
    logoSize: Math.round(config.logoSize * 0.4),
    logoPadding: Math.round(config.logoPadding * 0.5),
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Textarea input */}
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-1.5">
          <label className="label-brutal flex items-center gap-1.5 mb-0">
            <FileText size={10} /> Input URLs (one per line)
          </label>
          <span className="tag" style={{ fontSize: 9 }}>
            {lines.length} item{lines.length !== 1 ? 's' : ''}
          </span>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={7}
          placeholder={"https://example.com\nhttps://github.com\nhttps://anthropic.com"}
          className="input-brutal text-sm leading-relaxed"
          style={{ resize: 'vertical', minHeight: 140 }}
        />
        <p className="mt-1.5 text-[10px] opacity-40 font-mono">
          Each line becomes a separate QR code in the ZIP file.
        </p>
      </div>

      {/* Grid preview (mobile) */}
      {lines.length > 0 && (
        <div className="card p-4 lg:hidden animate-fade-in">
          <div className="label-brutal mb-3">◉ Preview Grid ({lines.length})</div>
          <div
            className="overflow-y-auto border-[2px] border-dashed border-[var(--border)] p-2"
            style={{ maxHeight: 360 }}
          >
            <div className="grid grid-cols-3 gap-2">
              {lines.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  className="border-[2px] border-[var(--border)] p-1.5 flex flex-col items-center gap-1"
                  style={{ background: 'var(--card)' }}
                >
                  <QRPreview text={line} config={miniConfig} />
                  <span
                    className="w-full text-center text-[8px] opacity-50 font-mono truncate"
                    title={line}
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={zipLoading || lines.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Download size={14} />
            {zipLoading
              ? `Generating (${lines.length})…`
              : `Download All .ZIP (${lines.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

// Variant that exposes grid for sidebar + download
export function MultiModeWithSidebar({
  config,
  renderSidebar,
}: {
  config: QrConfig;
  renderSidebar: (lines: string[], onDownload: () => void, loading: boolean) => React.ReactNode;
}) {
  const [rawText, setRawText] = useState(PLACEHOLDER);
  const [zipLoading, setZipLoading] = useState(false);

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const handleDownloadZip = useCallback(async () => {
    if (zipLoading || lines.length === 0) return;
    setZipLoading(true);
    const toastId = toast.loading(`Generating ${lines.length} QR codes…`);
    try {
      const zip = new JSZip();
      const ext = config.format === 'jpeg' ? 'jpg' : 'png';
      const mime = config.format === 'jpeg' ? 'image/jpeg' : 'image/png';
      for (let i = 0; i < lines.length; i++) {
        const canvas = await renderQRToCanvas(lines[i], config);
        const dataUrl = canvas.toDataURL(mime, 0.95);
        const base64 = dataUrl.split(',')[1];
        const safeName = lines[i].replace(/[^a-z0-9]/gi, '_').slice(0, 40);
        zip.file(`qrcode_${String(i + 1).padStart(2, '0')}_${safeName}.${ext}`, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'qrcodes.zip';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${lines.length} QR codes → qrcodes.zip`, { id: toastId });
    } catch (err) {
      toast.error('ZIP failed. Try again.', { id: toastId });
    }
    setZipLoading(false);
  }, [lines, config, zipLoading]);

  return (
    <div className="contents">
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-1.5">
          <label className="label-brutal flex items-center gap-1.5 mb-0">
            <FileText size={10} /> Input URLs (one per line)
          </label>
          <span className="tag" style={{ fontSize: 9 }}>
            {lines.length} item{lines.length !== 1 ? 's' : ''}
          </span>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={8}
          placeholder={"https://example.com\nhttps://github.com"}
          className="input-brutal text-sm leading-relaxed"
          style={{ resize: 'vertical', minHeight: 160 }}
        />
        <p className="mt-1.5 text-[10px] opacity-40 font-mono">
          Each line → separate QR in ZIP.
        </p>
      </div>

      {/* Mobile preview */}
      {lines.length > 0 && (
        <div className="card p-4 lg:hidden animate-fade-in">
          <div className="label-brutal mb-2">◉ Preview</div>
          <div className="overflow-y-auto border-[2px] border-dashed border-[var(--border)] p-2" style={{ maxHeight: 340 }}>
            <div className="grid grid-cols-3 gap-2">
              {lines.map((line, i) => (
                <div key={i} className="border-[2px] border-[var(--border)] p-1 flex flex-col items-center gap-1" style={{ background: 'var(--card)' }}>
                  <QRPreview text={line} config={{ ...config, size: 80, padding: 3, logoSize: 22, logoPadding: 2 }} />
                  <span className="w-full text-center text-[8px] opacity-50 truncate font-mono" title={line}>{line}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleDownloadZip} disabled={zipLoading || lines.length === 0} className="btn-primary w-full flex items-center justify-center gap-2 mt-3">
            <Download size={13} />
            {zipLoading ? `Generating…` : `Download All .ZIP (${lines.length})`}
          </button>
        </div>
      )}

      {/* Sidebar slot */}
      <div className="hidden">{renderSidebar(lines, handleDownloadZip, zipLoading)}</div>
    </div>
  );
}
