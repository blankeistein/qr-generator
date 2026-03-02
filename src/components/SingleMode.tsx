import { useState } from 'react';
import { Download, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { QrConfig } from '../types';
import QRPreview from './QRPreview';
import { renderQRToCanvas, downloadCanvas } from '../hooks/useQrRenderer';

interface SingleModeProps {
  config: QrConfig;
}

export default function SingleMode({ config }: SingleModeProps) {
  const [text, setText] = useState('https://example.com');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await renderQRToCanvas(text || 'https://example.com', config);
      const safeName = (text || 'qrcode').replace(/[^a-z0-9]/gi, '_').slice(0, 40);
      const ext = config.format === 'jpeg' ? 'jpg' : 'png';
      downloadCanvas(canvas, `${safeName}.${ext}`, config.format);
      toast.success(`Downloaded as ${ext.toUpperCase()}!`);
    } catch (err) {
      toast.error('Download failed. Try again.');
      console.error(err);
    }
    setDownloading(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Input */}
      <div className="card p-5 animate-fade-in">
        <label className="label-brutal flex items-center gap-1.5">
          <Link size={10} /> Input URL / Text
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          className="input-brutal text-sm"
        />
        <p className="mt-1.5 text-[10px] opacity-40 font-mono">
          Supports URLs, plain text, email, phone, Wi-Fi, etc.
        </p>
      </div>

      {/* Preview (mobile: below input, desktop: handled by parent layout) */}
      <div className="card p-5 lg:hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="label-brutal mb-3">◉ Preview</div>
        <div
          className="flex justify-center items-center p-4 border-[2px] border-dashed border-[var(--border)]"
          style={{ background: config.bgColor }}
        >
          <QRPreview text={text} config={config} />
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
        >
          <Download size={14} />
          {downloading ? 'Generating…' : `Download ${config.format.toUpperCase()}`}
        </button>
      </div>

      {/* Desktop preview is rendered in the sticky sidebar (App.tsx) */}
      <div className="hidden lg:block">
        {/* Placeholder — actual preview shown in sidebar */}
      </div>
    </div>
  );
}

// Export the text state up via callback variant
export function SingleModeWithPreview({
  config,
  renderPreview,
}: {
  config: QrConfig;
  renderPreview: (text: string) => React.ReactNode;
}) {
  const [text, setText] = useState('https://example.com');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await renderQRToCanvas(text || 'https://example.com', config);
      const safeName = (text || 'qrcode').replace(/[^a-z0-9]/gi, '_').slice(0, 40);
      const ext = config.format === 'jpeg' ? 'jpg' : 'png';
      downloadCanvas(canvas, `${safeName}.${ext}`, config.format);
      toast.success(`Downloaded as ${ext.toUpperCase()}!`);
    } catch (err) {
      toast.error('Download failed. Try again.');
    }
    setDownloading(false);
  };

  return (
    <div className="contents">
      {/* Input Card */}
      <div className="card p-5 animate-fade-in">
        <label className="label-brutal flex items-center gap-1.5">
          <Link size={10} /> Input URL / Text
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          className="input-brutal text-sm"
        />
        <p className="mt-1.5 text-[10px] opacity-40 font-mono">
          Supports URLs, plain text, email, phone, Wi-Fi, vCard, and more.
        </p>
      </div>

      {/* Preview (mobile only — desktop handled in parent) */}
      <div className="card p-5 lg:hidden animate-fade-in">
        <div className="label-brutal mb-3">◉ Preview</div>
        <div
          className="flex justify-center items-center p-6 border-[2px] border-dashed border-[var(--border)]"
          style={{ background: config.bgColor }}
        >
          <QRPreview text={text} config={config} />
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
        >
          <Download size={14} />
          {downloading ? 'Generating…' : `Download ${config.format.toUpperCase()}`}
        </button>
      </div>

      {/* Hidden carrier for renderPreview to consume text */}
      <div className="hidden">{renderPreview(text)}</div>

      {/* Desktop download button (shown in sidebar via parent) */}
      <div
        id="single-download-trigger"
        data-text={text}
        className="hidden"
      />
    </div>
  );
}
