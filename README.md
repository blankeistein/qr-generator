# QR Generator

A fully-featured QR Code Generator built with **Vite + React + TypeScript + Tailwind CSS**.

## ✨ Features

- **Single Mode** — Generate a single QR code from any text/URL
- **Multiple Mode** — Batch generate QR codes (one per line) and download as `.zip`
- **Live Preview** — Real-time QR code canvas preview
- **Customization Panel** — Full control over:
  - Logo image upload (PNG/JPEG/SVG) with size & padding
  - QR code size (64–1024px)
  - Padding around QR
  - Foreground & background colors
  - Export format (PNG / JPEG / SVG*)
- **Dark/Light Mode** — Persisted to localStorage
- **Brutalist Design** — Bold borders, box shadows, dot-pattern background
- **Responsive** — Mobile settings via sheet drawer, desktop sidebar

> *SVG format is exported as PNG (canvas limitation)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠 Tech Stack

| Tool | Version |
|------|---------|
| Vite | ^4.4 |
| React | ^18.2 |
| TypeScript | ^5.0 |
| Tailwind CSS | ^3.3 |
| qrcode | ^1.5 |
| qrcode.react | ^3.1 |
| jszip | ^3.10 |
| lucide-react | ^0.263 |
| react-hot-toast | ^2.4 |

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx        # Sticky header with logo + theme toggle
│   ├── CustomPanel.tsx   # Customization controls
│   ├── QRPreview.tsx     # Canvas-based live QR preview
│   ├── MobileSheet.tsx   # Slide-in settings drawer (mobile)
│   ├── SingleMode.tsx    # Single QR input
│   └── MultiMode.tsx     # Multi QR batch input
├── hooks/
│   ├── useTheme.ts       # Dark/light mode hook
│   └── useQrRenderer.ts  # Canvas QR rendering + download
├── types/
│   └── index.ts          # QrConfig type + defaults
├── App.tsx               # Root layout + state
├── main.tsx
└── index.css             # Tailwind + brutalism CSS
```
