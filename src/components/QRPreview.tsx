import { useEffect, useRef } from 'react';
import { QrConfig } from '../types';
import { renderQRToCanvas } from '../hooks/useQrRenderer';

interface QRPreviewProps {
  text: string;
  config: QrConfig;
  className?: string;
}

export default function QRPreview({ text, config, className = '' }: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debounce re-renders
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const canvas = await renderQRToCanvas(text || 'https://example.com', config);
        if (!canvasRef.current) return;
        canvasRef.current.width = canvas.width;
        canvasRef.current.height = canvas.height;
        const ctx = canvasRef.current.getContext('2d')!;
        ctx.drawImage(canvas, 0, 0);
      } catch (err) {
        console.error('QR render error:', err);
      }
    }, 150);

    return () => clearTimeout(timerRef.current);
  }, [text, config]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: 'pixelated', maxWidth: '100%' }}
    />
  );
}
