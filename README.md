# ReadForge

**100% local text-to-speech. Premium voices, zero cloud dependency.**

ReadForge is a cross-platform text-to-speech application that runs entirely on your device. Your text never leaves your computer.

## Current State

The **Chrome browser extension** is the first working component. It extracts text from any web page and reads it aloud using the browser's built-in Speech Synthesis API. All processing is local.

Other platforms (desktop, mobile) are planned but not yet implemented. Their directories contain scaffolding only.

## Platforms

| Platform | Status |
|----------|--------|
| Chrome Extension | **Working** (MVP) |
| Safari Extension | Planned |
| Firefox Extension | Planned |
| macOS Desktop | Planned |
| Windows Desktop | Planned |
| Linux Desktop | Planned |
| iOS App | Planned |
| Android App | Planned |

## Browser Extension

### What it does

- Extracts readable content from any web page (via Mozilla Readability)
- Reads selected text or full articles aloud
- Provides a popup UI with play/pause, skip, and speed controls
- Persists reading position and settings in local storage
- Context menu integration ("Read with ReadForge")
- Keyboard shortcuts (Alt+Shift+P to play/pause, Alt+Shift+R to read selection)

### Quick Start

```bash
cd browser-extension
npm install
npm run dev
```

This starts WXT in development mode and opens Chrome with the extension loaded.

### Load in Chrome (production build)

```bash
cd browser-extension
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser-extension/.output/chrome-mv3`

### Run Tests

```bash
cd browser-extension
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

Current test coverage: 95%+ statements, 89%+ branches, 94%+ functions across 86 tests.

### Architecture

```
browser-extension/src/
  entrypoints/
    background.ts          # Service worker: context menus, keyboard shortcuts, message relay
    content.ts             # Content script: text extraction, TTS playback per tab
    popup/
      App.tsx              # React popup UI with playback controls
      main.tsx             # Entry point
      index.html           # Popup HTML shell
      style.css            # Tailwind styles
  services/
    text-extractor.ts      # Page content extraction (Readability, selection, full-page)
    sentence-splitter.ts   # Text to sentence segmentation with offset tracking
    tts-engine.ts          # Web Speech API wrapper with play/pause/skip
    storage.ts             # Chrome storage for settings and reading history
  types/
    messages.ts            # Typed message passing between extension components
```

### Technology

- **Framework:** [WXT](https://wxt.dev) (browser extension framework)
- **UI:** React 18 + Tailwind CSS
- **Text Extraction:** [@mozilla/readability](https://github.com/mozilla/readability)
- **TTS:** Web Speech API (browser built-in)
- **Testing:** Vitest + Testing Library + happy-dom
- **Language:** TypeScript (strict mode)

### Roadmap for Extension

- [ ] Premium voices via Kokoro-82M (WebGPU/WASM)
- [ ] Text highlighting that follows along with speech
- [ ] PDF reading support
- [ ] Google Docs integration
- [ ] Voice selection UI in popup
- [ ] Firefox support

## Website

A marketing landing page exists in `website/` (React + Vite + Tailwind). It is independent of the extension.

## Documentation

- [Roadmap](docs/ROADMAP.md)
- [Feature Backlog](docs/FEATURE_BACKLOG.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [Architecture Patterns](docs/ARCHITECTURE_PATTERNS.md)

## License

Proprietary. See LICENSE for details.
