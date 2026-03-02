import QRCode from 'qrcode';
import { QrConfig } from '../types';

export async function renderQRToCanvas(
  text: string,
  config: QrConfig
): Promise<HTMLCanvasElement> {
  const totalSize = config.size + config.padding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext('2d')!;

  // Fill background
  ctx.fillStyle = config.bgColor;
  ctx.fillRect(0, 0, totalSize, totalSize);

  // Render QR onto temp canvas
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, text || 'https://example.com', {
    width: config.size,
    margin: 0,
    errorCorrectionLevel: config.logoImage ? 'H' : 'M',
    color: {
      dark: config.fgColor,
      light: config.bgColor,
    },
  });

  ctx.drawImage(qrCanvas, config.padding, config.padding);

  // Overlay logo if present
  if (config.logoImage) {
    await new Promise<void>((resolve, reject) => {
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
      img.onerror = reject;
      img.src = config.logoImage!;
    });
  }

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpeg' | 'svg') {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const url = canvas.toDataURL(mime, 0.95);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
