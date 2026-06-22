# MediaDL — Premium Media Downloader

A production-quality, premium SaaS-style media downloader built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

![MediaDL](https://img.shields.io/badge/MediaDL-v1.0.0-6366F1?style=for-the-badge&logo=download&logoColor=white)

## ✨ Features

- **🔗 URL Input** — Paste any media URL with auto-validation and sanitization
- **📋 Clipboard Paste** — One-click paste from clipboard
- **🎬 Metadata Preview** — Thumbnail, title, duration, uploader, view count
- **🎛️ Format Selection** — Choose from available video and audio formats
- **📊 Progress Tracking** — Real-time animated progress bar
- **🌙 Dark/Light Theme** — Toggle between premium dark and light modes
- **📱 Fully Responsive** — Desktop, laptop, tablet, and mobile
- **♿ Accessible** — Keyboard navigation, ARIA labels, focus indicators
- **🔒 Secure** — URL validation, XSS prevention, no data storage
- **⚡ Fast** — Smooth 200-400ms animations, optimized rendering

## 🚫 What This App Does NOT Do

- ❌ No Firebase / Firestore / any database
- ❌ No localStorage / sessionStorage / cookies
- ❌ No analytics / tracking / advertisements
- ❌ No authentication / login / signup
- ❌ No user profiles / history storage
- ❌ URLs are never stored anywhere

**Everything is completely stateless** — exists only during your current session.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Theme | next-themes |
| Backend | yt-dlp (CLI) |

## 📦 Prerequisites

1. **Node.js 18+** — [Download](https://nodejs.org)
2. **yt-dlp** — Required for media processing

### Install yt-dlp

**Windows (winget):**
```bash
winget install yt-dlp
```

**Windows (scoop):**
```bash
scoop install yt-dlp
```

**macOS (Homebrew):**
```bash
brew install yt-dlp
```

**Linux:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Verify installation:
```bash
yt-dlp --version
```

## 🚀 Installation

```bash
# Clone or navigate to the project
cd media-downloader

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Inter font + ThemeProvider
│   ├── page.tsx            # Main page orchestrating all sections
│   ├── globals.css         # Design system (Vercel-inspired)
│   └── api/
│       ├── info/route.ts   # Metadata extraction via yt-dlp
│       └── download/route.ts  # Stream download via yt-dlp
├── components/
│   ├── layout/
│   │   ├── navbar.tsx      # Sticky navbar with theme toggle
│   │   └── footer.tsx      # Privacy + disclaimer
│   ├── sections/
│   │   ├── hero.tsx        # Animated hero with gradient orbs
│   │   ├── url-input.tsx   # URL input with paste/clear
│   │   ├── metadata-preview.tsx  # Media info + skeleton loading
│   │   ├── download-options.tsx  # Format selection grid
│   │   ├── progress-section.tsx  # Animated progress bar
│   │   ├── error-card.tsx  # Contextual error display
│   │   └── empty-state.tsx # Initial instructions
│   └── ui/
│       ├── button.tsx      # CVA button variants
│       ├── card.tsx        # Glass-morphism card
│       ├── input.tsx       # Styled input
│       ├── progress.tsx    # Animated progress bar
│       ├── skeleton.tsx    # Shimmer loading placeholder
│       └── theme-toggle.tsx # Dark/light toggle
├── utils/
│   ├── url-validator.ts    # URL validation + sanitization
│   ├── format-helpers.ts   # Duration, filesize, count formatters
│   └── constants.ts        # App-wide constants
├── types/
│   └── index.ts            # TypeScript interfaces
└── lib/
    └── utils.ts            # Tailwind class merge utility
```

## 🎨 Design System

Vercel / Linear / Stripe-inspired premium design with:

| Token | Value |
|-------|-------|
| Background | `#050816` |
| Card | `rgba(255,255,255,0.05)` |
| Border | `rgba(255,255,255,0.08)` |
| Accent | `#6366F1` (Indigo) |
| Secondary | `#8B5CF6` (Violet) |
| Success | `#22C55E` |
| Error | `#EF4444` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#A1A1AA` |

## 🔐 Security

- URL validation (HTTP/HTTPS only)
- Input sanitization (control characters + HTML stripped)
- XSS prevention
- Anti-spam debouncing
- No data persistence
- Temp files cleaned after download

## 📱 Responsive Breakpoints

| Breakpoint | Width |
|-----------|-------|
| Desktop | ≥1440px |
| Laptop | ≥1024px |
| Tablet | ≥768px |
| Mobile | ≤480px |

## 🚀 Deployment

### Vercel (Recommended)

> **Note:** yt-dlp must be available in your deployment environment. Standard Vercel serverless functions may not support system binaries. Consider a VPS or Docker deployment for full functionality.

### Docker

```dockerfile
FROM node:18-slim
RUN apt-get update && apt-get install -y python3 ffmpeg && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-hosted (VPS)

```bash
npm run build
npm start
```

## 📄 License

MIT

---

**Built with ❤️ — No tracking. No ads. No BS.**
