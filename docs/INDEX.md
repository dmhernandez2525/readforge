# ReadForge Documentation Index

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## Quick Links

| Document | Description |
|----------|-------------|
| [ROADMAP.md](./ROADMAP.md) | Phase-by-phase implementation plan |
| [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) | All features with IDs and dependencies |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Code style and patterns |
| [ARCHITECTURE_PATTERNS.md](./ARCHITECTURE_PATTERNS.md) | System design patterns |

---

## Software Design Documents (SDDs)

### Phase 1: MVP Foundation

| SDD | Feature | Status |
|-----|---------|--------|
| [SDD-001](./sdd/phase-1/SDD-001-TTS-CORE.md) | Core TTS Engine | Draft |
| [SDD-002](./sdd/phase-1/SDD-002-CHROME-EXTENSION.md) | Chrome Extension | Draft |
| [SDD-003](./sdd/phase-1/SDD-003-MACOS-DESKTOP.md) | macOS Desktop App | Draft |

### Phase 2: Platform Expansion

| SDD | Feature | Status |
|-----|---------|--------|
| SDD-004 | Safari Extension | Pending |
| SDD-005 | Firefox Extension | Pending |
| SDD-006 | iOS App | Pending |
| SDD-007 | Voice Cloning | Pending |

### Phase 3: Cross-Platform

| SDD | Feature | Status |
|-----|---------|--------|
| SDD-008 | Windows/Linux Desktop | Pending |
| SDD-009 | Android App | Pending |
| SDD-010 | Sync Service | Pending |

### Phase 4: Monetization

| SDD | Feature | Status |
|-----|---------|--------|
| SDD-011 | Payment & Licensing | Pending |
| SDD-012 | Developer API | Pending |
| SDD-013 | Team Features | Pending |

---

## External Resources

### Research
- [Competitive Research Report](../_@agent-prompts/readforge/research/COMPILED_RESEARCH.md)

### Technologies
- [Kokoro-82M on HuggingFace](https://huggingface.co/hexgrad/Kokoro-82M)
- [kokoro-js npm package](https://www.npmjs.com/package/kokoro-js)
- [WXT Browser Extension Framework](https://wxt.dev)
- [Tauri Desktop Framework](https://tauri.app)
- [ONNX Runtime](https://onnxruntime.ai)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Readability.js](https://github.com/mozilla/readability)

---

## Development Guides

### Getting Started
1. Clone the repository
2. Install dependencies for your target platform
3. Read the relevant SDD for your feature
4. Follow the coding standards

### Platform Setup

#### Browser Extension
```bash
cd browser-extension
npm install
npm run dev  # Start development server
```

#### macOS Desktop
```bash
cd desktop-mac
open ReadForge.xcodeproj
# Build and run in Xcode
```

#### Windows/Linux Desktop
```bash
cd desktop-cross
cargo tauri dev
```

---

## Document Conventions

### SDD Structure
Each SDD follows this format:
1. **Overview** - What the feature does
2. **Goals** - Success criteria
3. **Technical Specification** - Detailed design
4. **Acceptance Criteria** - Must-pass requirements
5. **Test Plan** - How to verify
6. **Dependencies** - Required packages/services
7. **Risks & Mitigations** - What could go wrong

### Feature IDs
- **TTS-XXX** - Core TTS engine features
- **CHR-XXX** - Chrome extension features
- **SAF-XXX** - Safari extension features
- **FFX-XXX** - Firefox extension features
- **MAC-XXX** - macOS desktop features
- **TAU-XXX** - Tauri (Windows/Linux) features
- **IOS-XXX** - iOS app features
- **AND-XXX** - Android app features
- **CLN-XXX** - Voice cloning features
- **DES-XXX** - Voice design features
- **SYN-XXX** - Sync service features
- **PAY-XXX** - Payment/licensing features
- **API-XXX** - Developer API features
- **TEM-XXX** - Team features
- **PRE-XXX** - Premium features

### Priority Levels
- **P0** - Launch blocker, must have
- **P1** - Important, competitive parity
- **P2** - Nice to have, differentiator
- **P3** - Future consideration

### Effort Levels
- **S** - Small (1-2 days)
- **M** - Medium (3-5 days)
- **L** - Large (1-2 weeks)
- **XL** - Extra Large (2+ weeks)
