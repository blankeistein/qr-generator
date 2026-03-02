import QRCode from 'qrcode';
import { QrConfig } from '../types';

export async function renderQRToCanvas(
  text: string,
  config: QrConfig
): Promise<HTMLCanvasElement> {
  const safeText = text.trim() || 'https://example.com';
  const totalSize = config.size + config.padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = config.bgColor;
  ctx.fillRect(0, 0, totalSize, totalSize);

  // Generate QR code to a temp canvas
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, safeText, {
    width: config.size,
    margin: 0,
    color: {
      dark: config.fgColor,
      light: config.bgColor,
    },
    errorCorrectionLevel: config.logoImage ? 'H' : 'M',
  });

  ctx.drawImage(qrCanvas, config.padding, config.padding);

  // Draw logo if present
  if (config.logoImage) {
    await drawLogo(ctx, config, totalSize);
  }

  return canvas;
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  config: QrConfig,
  totalSize: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ls = config.logoSize;
      const lp = config.logoPadding;
      const cx = totalSize / 2;
      const cy = totalSize / 2;

      // White padding background behind logo
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(cx - ls / 2 - lp, cy - ls / 2 - lp, ls + lp * 2, ls + lp * 2);

      // Draw logo
      ctx.drawImage(img, cx - ls / 2, cy - ls / 2, ls, ls);
      resolve();
    };
    img.onerror = () => resolve(); // Fail silently
    img.src = config.logoImage!;
  });
}

export function canvasToDataURL(canvas: HTMLCanvasElement, format: string): string {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mime, 0.95);
}

export function triggerDownload(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
