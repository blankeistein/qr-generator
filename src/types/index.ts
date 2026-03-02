export type ImageFormat = 'png' | 'jpeg' | 'svg';

export interface QrConfig {
  size: number;
  fgColor: string;
  bgColor: string;
  padding: number;
  format: ImageFormat;
  logoImage: string | null;
  logoPadding: number;
  logoSize: number;
}

export const DEFAULT_CONFIG: QrConfig = {
  size: 256,
  fgColor: '#000000',
  bgColor: '#ffffff',
  padding: 10,
  format: 'png',
  logoImage: null,
  logoPadding: 5,
  logoSize: 50,
};
