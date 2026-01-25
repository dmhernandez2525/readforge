# ReadForge

**100% local text-to-speech. Premium voices, zero cloud dependency.**

ReadForge is a cross-platform text-to-speech application that runs entirely on your device. Your text never leaves your computer.

## Features

- **Complete Privacy** - Text processing happens 100% locally
- **No Word Limits** - Unlimited reading, unlike cloud services
- **Premium AI Voices** - Kokoro-82M quality (#1 TTS Arena)
- **Voice Cloning** - Create custom voices from 10-second samples
- **Cross-Platform** - Browser, desktop, and mobile

## Platforms

| Platform | Status |
|----------|--------|
| Chrome Extension | In Development |
| Safari Extension | Planned |
| Firefox Extension | Planned |
| macOS Desktop | In Development |
| Windows Desktop | Planned |
| Linux Desktop | Planned |
| iOS App | Planned |
| Android App | Planned |

## Quick Start

### Browser Extension

```bash
cd browser-extension
npm install
npm run dev
```

### macOS Desktop

Open `desktop-mac/ReadForge.xcodeproj` in Xcode and build.

## Documentation

- [Roadmap](docs/ROADMAP.md)
- [Feature Backlog](docs/FEATURE_BACKLOG.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [Architecture Patterns](docs/ARCHITECTURE_PATTERNS.md)

## Technology Stack

- **TTS Engine:** Kokoro-82M (ONNX), Piper TTS (fallback)
- **Browser:** WXT + kokoro-js (WebGPU)
- **macOS:** Swift/AppKit + Python TTS server
- **Windows/Linux:** Tauri + Rust
- **Mobile:** Swift/Kotlin + ONNX Runtime

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Piper voices (30+ languages), all platforms |
| Personal | $59/year or $99 lifetime | Kokoro premium voices, voice cloning |
| Professional | $129/year | Voice design, API access |
| Enterprise | Custom | Self-hosted, SLA |

## License

Proprietary. See LICENSE for details.

## Contributing

This is a private project. Contributions are not currently accepted.
