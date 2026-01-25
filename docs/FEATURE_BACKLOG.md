# ReadForge Feature Backlog

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## Backlog Overview

Features are organized by phase and priority. Each feature includes effort estimates and dependencies.

**Priority Levels:**
- **P0** - Launch blocker, must have
- **P1** - Important, needed for competitive parity
- **P2** - Nice to have, differentiator
- **P3** - Future consideration

**Effort Levels:**
- **S** - Small (1-2 days)
- **M** - Medium (3-5 days)
- **L** - Large (1-2 weeks)
- **XL** - Extra Large (2+ weeks)

---

## Phase 1: MVP Foundation

### Core TTS Engine

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| TTS-001 | Kokoro-82M ONNX model loading | P0 | M | None | Pending |
| TTS-002 | Real-time audio streaming | P0 | M | TTS-001 | Pending |
| TTS-003 | Speed control (0.5x-4x) | P0 | S | TTS-002 | Pending |
| TTS-004 | Pitch control | P1 | S | TTS-002 | Pending |
| TTS-005 | Sentence boundary detection | P0 | M | TTS-001 | Pending |
| TTS-006 | Piper TTS fallback engine | P1 | M | TTS-002 | Pending |
| TTS-007 | Voice metadata (name, language, gender) | P0 | S | TTS-001 | Pending |
| TTS-008 | Audio format options (WAV, MP3) | P2 | S | TTS-002 | Pending |

### Chrome Extension

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| CHR-001 | WXT project scaffolding | P0 | S | None | Pending |
| CHR-002 | Content script injection | P0 | S | CHR-001 | Pending |
| CHR-003 | Readability.js text extraction | P0 | M | CHR-002 | Pending |
| CHR-004 | PDF.js integration | P0 | L | CHR-001 | Pending |
| CHR-005 | Google Docs content extraction | P0 | M | CHR-002 | Pending |
| CHR-006 | Floating player component | P0 | L | CHR-002 | Pending |
| CHR-007 | Play/pause controls | P0 | S | CHR-006 | Pending |
| CHR-008 | Progress bar with scrubbing | P0 | M | CHR-006 | Pending |
| CHR-009 | Speed control slider | P0 | S | CHR-006, TTS-003 | Pending |
| CHR-010 | Voice selection dropdown | P0 | S | CHR-006 | Pending |
| CHR-011 | Text highlighting sync | P0 | M | CHR-006, TTS-005 | Pending |
| CHR-012 | kokoro-js WebGPU TTS | P0 | L | CHR-001, TTS-001 | Pending |
| CHR-013 | WASM fallback | P1 | M | CHR-012 | Pending |
| CHR-014 | Desktop app relay | P1 | M | CHR-012 | Pending |
| CHR-015 | Context menu "Read selection" | P1 | S | CHR-002 | Pending |
| CHR-016 | Extension popup UI | P1 | M | CHR-001 | Pending |
| CHR-017 | Settings persistence | P0 | S | CHR-001 | Pending |
| CHR-018 | Keyboard shortcuts | P1 | S | CHR-006 | Pending |

### macOS Desktop App

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| MAC-001 | Swift/AppKit project setup | P0 | M | None | Pending |
| MAC-002 | Menu bar app shell | P0 | M | MAC-001 | Pending |
| MAC-003 | Status bar icon + dropdown | P0 | S | MAC-002 | Pending |
| MAC-004 | PDF reader view (PDFKit) | P0 | L | MAC-002 | Pending |
| MAC-005 | EPUB reader view | P0 | L | MAC-002 | Pending |
| MAC-006 | Python TTS server | P0 | M | TTS-001 | Pending |
| MAC-007 | Native ONNX inference (Metal) | P0 | L | MAC-006 | Pending |
| MAC-008 | Document library view | P1 | M | MAC-004, MAC-005 | Pending |
| MAC-009 | Reading position persistence | P0 | M | MAC-004, MAC-005 | Pending |
| MAC-010 | Global keyboard shortcuts | P0 | M | MAC-002 | Pending |
| MAC-011 | System-wide selection reading | P1 | M | MAC-010 | Pending |
| MAC-012 | Auto-launch on login | P1 | S | MAC-002 | Pending |
| MAC-013 | Player mini-window | P1 | M | MAC-002 | Pending |

---

## Phase 2: Platform Expansion

### Safari Extension

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| SAF-001 | Safari extension port | P0 | M | CHR-* | Pending |
| SAF-002 | Safari-specific content script | P0 | M | SAF-001 | Pending |
| SAF-003 | macOS app bundle integration | P1 | M | SAF-001, MAC-001 | Pending |

### Firefox Extension

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| FFX-001 | Firefox extension port | P0 | M | CHR-* | Pending |
| FFX-002 | Firefox-specific manifest v3 | P0 | S | FFX-001 | Pending |

### iOS App

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| IOS-001 | Swift + SwiftUI project setup | P0 | M | None | Pending |
| IOS-002 | ONNX Runtime integration | P0 | L | TTS-001 | Pending |
| IOS-003 | Kokoro model loading | P0 | M | IOS-002 | Pending |
| IOS-004 | AVAudioSession background mode | P0 | M | IOS-003 | Pending |
| IOS-005 | MPNowPlayingInfoCenter (lock screen) | P0 | S | IOS-004 | Pending |
| IOS-006 | MPRemoteCommandCenter (controls) | P0 | S | IOS-005 | Pending |
| IOS-007 | Share extension | P0 | M | IOS-001 | Pending |
| IOS-008 | PDF reader (PDFKit) | P0 | L | IOS-001 | Pending |
| IOS-009 | EPUB reader | P1 | L | IOS-008 | Pending |
| IOS-010 | CoreML acceleration | P1 | L | IOS-002 | Pending |
| IOS-011 | Safari extension | P1 | M | SAF-001 | Pending |
| IOS-012 | Camera OCR (Vision) | P1 | M | IOS-001 | Pending |
| IOS-013 | Document library | P1 | M | IOS-008 | Pending |
| IOS-014 | Reading position sync | P2 | M | IOS-013 | Pending |
| IOS-015 | Piper fallback for low memory | P1 | M | TTS-006 | Pending |

### Voice Cloning

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| CLN-001 | F5-TTS model integration | P1 | L | TTS-001 | Pending |
| CLN-002 | Audio recording UI (10s) | P1 | M | CLN-001 | Pending |
| CLN-003 | Audio sample processing | P1 | M | CLN-002 | Pending |
| CLN-004 | Voice embedding extraction | P1 | M | CLN-003 | Pending |
| CLN-005 | Cloned voice storage | P1 | M | CLN-004 | Pending |
| CLN-006 | Clone preview playback | P1 | S | CLN-005 | Pending |
| CLN-007 | Voice profile management | P1 | M | CLN-005 | Pending |

### Voice Design

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| DES-001 | Qwen3-TTS integration | P2 | L | TTS-001 | Pending |
| DES-002 | Text description input UI | P2 | S | DES-001 | Pending |
| DES-003 | Voice generation from description | P2 | M | DES-002 | Pending |
| DES-004 | Designed voice storage | P2 | M | DES-003 | Pending |

### Enhanced Features

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| ENH-001 | DOCX support (mammoth.js) | P1 | M | MAC-004 | Pending |
| ENH-002 | Multiple preset voices | P1 | S | TTS-007 | Pending |
| ENH-003 | Voice favorites | P1 | S | ENH-002 | Pending |
| ENH-004 | Bookmarks | P1 | M | MAC-009 | Pending |
| ENH-005 | Reading history | P1 | M | MAC-008 | Pending |
| ENH-006 | OCR for images (Tesseract) | P1 | M | MAC-004 | Pending |
| ENH-007 | Gmail integration | P1 | M | CHR-005 | Pending |

---

## Phase 3: Cross-Platform Expansion

### Windows/Linux Desktop (Tauri)

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| TAU-001 | Tauri 2.0 project setup | P0 | M | None | Pending |
| TAU-002 | React + Tailwind UI | P0 | M | TAU-001 | Pending |
| TAU-003 | ONNX Runtime Rust bindings | P0 | L | TTS-001 | Pending |
| TAU-004 | DirectML backend (Windows) | P0 | M | TAU-003 | Pending |
| TAU-005 | Vulkan/CUDA backend (Linux) | P0 | M | TAU-003 | Pending |
| TAU-006 | System tray integration | P0 | M | TAU-001 | Pending |
| TAU-007 | PDF reader | P0 | L | TAU-002 | Pending |
| TAU-008 | EPUB reader | P0 | L | TAU-002 | Pending |
| TAU-009 | DOCX reader | P1 | M | TAU-002 | Pending |
| TAU-010 | Global keyboard shortcuts | P0 | M | TAU-006 | Pending |
| TAU-011 | System selection reading | P1 | M | TAU-010 | Pending |
| TAU-012 | Linux CLI interface | P1 | M | TAU-003 | Pending |
| TAU-013 | AppImage package | P1 | S | TAU-001 | Pending |
| TAU-014 | Flatpak package | P1 | S | TAU-001 | Pending |
| TAU-015 | .deb package | P1 | S | TAU-001 | Pending |
| TAU-016 | Windows installer (MSI) | P0 | S | TAU-001 | Pending |

### Android App

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| AND-001 | Kotlin + Compose project | P0 | M | None | Pending |
| AND-002 | ONNX Runtime Android | P0 | L | TTS-001 | Pending |
| AND-003 | NNAPI acceleration | P0 | M | AND-002 | Pending |
| AND-004 | ExoPlayer audio | P0 | M | AND-002 | Pending |
| AND-005 | Background service | P0 | M | AND-004 | Pending |
| AND-006 | Media notification | P0 | S | AND-005 | Pending |
| AND-007 | Share intent receiver | P0 | M | AND-001 | Pending |
| AND-008 | PDF reader | P0 | L | AND-001 | Pending |
| AND-009 | EPUB reader | P1 | L | AND-008 | Pending |
| AND-010 | Accessibility service | P1 | L | AND-001 | Pending |
| AND-011 | Camera OCR (ML Kit) | P1 | M | AND-001 | Pending |
| AND-012 | Document library | P1 | M | AND-008 | Pending |
| AND-013 | Piper fallback | P1 | M | TTS-006 | Pending |

### Sync Service

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| SYN-001 | Node.js + Express API | P2 | M | None | Pending |
| SYN-002 | User authentication (JWT) | P2 | M | SYN-001 | Pending |
| SYN-003 | Reading position sync | P2 | M | SYN-002 | Pending |
| SYN-004 | Bookmark sync | P2 | S | SYN-002 | Pending |
| SYN-005 | Voice profile sync (E2E encrypted) | P2 | L | SYN-002, CLN-005 | Pending |
| SYN-006 | SQLite database (self-hosted) | P2 | M | SYN-001 | Pending |
| SYN-007 | PostgreSQL option (cloud) | P2 | M | SYN-001 | Pending |
| SYN-008 | Docker Compose deployment | P2 | M | SYN-001 | Pending |
| SYN-009 | Self-hosted documentation | P2 | S | SYN-008 | Pending |

---

## Phase 4: Monetization & Enterprise

### Payment & Licensing

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| PAY-001 | Stripe integration | P0 | M | None | Pending |
| PAY-002 | License key generation | P0 | M | PAY-001 | Pending |
| PAY-003 | License validation | P0 | M | PAY-002 | Pending |
| PAY-004 | Free tier gate (Piper only) | P0 | S | TTS-006, PAY-003 | Pending |
| PAY-005 | Personal tier ($59/yr) | P0 | M | PAY-002 | Pending |
| PAY-006 | Lifetime license ($99) | P0 | M | PAY-002 | Pending |
| PAY-007 | Professional tier ($129/yr) | P1 | M | PAY-002 | Pending |
| PAY-008 | BYOK integration | P2 | L | PAY-003 | Pending |

### Developer API

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| API-001 | REST API design (OpenAPI) | P1 | M | None | Pending |
| API-002 | TTS endpoint | P1 | M | API-001, TTS-001 | Pending |
| API-003 | Streaming endpoint (SSE) | P1 | M | API-002 | Pending |
| API-004 | Voice list endpoint | P1 | S | API-001 | Pending |
| API-005 | Voice cloning endpoint | P1 | M | API-002, CLN-001 | Pending |
| API-006 | API key management | P1 | M | API-001 | Pending |
| API-007 | Rate limiting | P1 | M | API-006 | Pending |
| API-008 | Usage metering | P1 | M | API-006 | Pending |
| API-009 | API documentation | P1 | M | API-001 | Pending |
| API-010 | Self-hosted API option | P2 | L | API-001 | Pending |

### Team Features

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| TEM-001 | Team dashboard | P2 | L | PAY-003 | Pending |
| TEM-002 | Seat management | P2 | M | TEM-001 | Pending |
| TEM-003 | Shared voice profiles | P2 | M | TEM-001, CLN-005 | Pending |
| TEM-004 | SSO (SAML) | P2 | L | TEM-001 | Pending |
| TEM-005 | SSO (OIDC) | P2 | L | TEM-001 | Pending |
| TEM-006 | Usage analytics dashboard | P2 | M | TEM-001 | Pending |
| TEM-007 | Admin billing management | P2 | M | TEM-001, PAY-001 | Pending |

### Premium Features

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| PRE-001 | AI summaries (local LLM) | P2 | L | None | Pending |
| PRE-002 | Audiobook mode (chapters) | P2 | M | MAC-005 | Pending |
| PRE-003 | Multi-voice documents | P2 | L | ENH-002 | Pending |
| PRE-004 | Pronunciation dictionary | P2 | M | TTS-001 | Pending |
| PRE-005 | Export to MP3 | P2 | M | TTS-002 | Pending |
| PRE-006 | Export to WAV | P2 | S | TTS-002 | Pending |

---

## Future Backlog (Post-Launch)

### Integrations

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| INT-001 | Notion integration | P3 | L | API-001 | Backlog |
| INT-002 | Obsidian plugin | P3 | L | API-001 | Backlog |
| INT-003 | Pocket import | P3 | M | None | Backlog |
| INT-004 | Instapaper import | P3 | M | None | Backlog |
| INT-005 | Kindle support | P3 | XL | None | Backlog |
| INT-006 | Readwise integration | P3 | M | None | Backlog |

### Advanced Voice Features

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| VOC-001 | Emotional expression controls | P3 | L | TTS-001 | Backlog |
| VOC-002 | Real-time translation + TTS | P3 | XL | TTS-001 | Backlog |
| VOC-003 | Voice mixing (blend voices) | P3 | L | CLN-001 | Backlog |
| VOC-004 | Background music/ambient | P3 | M | TTS-002 | Backlog |

### Accessibility

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| ACC-001 | VoiceOver integration (iOS/macOS) | P1 | M | IOS-001, MAC-001 | Pending |
| ACC-002 | TalkBack integration (Android) | P1 | M | AND-001 | Pending |
| ACC-003 | High contrast themes | P2 | S | CHR-006 | Pending |
| ACC-004 | Dyslexia-friendly fonts | P2 | S | MAC-004 | Pending |
| ACC-005 | Keyboard-only navigation | P1 | M | CHR-006 | Pending |

### Enterprise

| ID | Feature | Priority | Effort | Dependencies | Status |
|----|---------|----------|--------|--------------|--------|
| ENT-001 | On-premise deployment | P3 | XL | SYN-008 | Backlog |
| ENT-002 | Custom voice training | P3 | XL | CLN-001 | Backlog |
| ENT-003 | HIPAA compliance mode | P3 | L | None | Backlog |
| ENT-004 | GDPR audit logging | P3 | M | None | Backlog |
| ENT-005 | SLA monitoring | P3 | M | None | Backlog |

---

## Feature Dependencies Graph

```
TTS-001 (Kokoro)
├── TTS-002 (Streaming) ─┬── TTS-003 (Speed)
│                        ├── TTS-008 (Export formats)
│                        └── PRE-005 (MP3 export)
├── TTS-005 (Sentences) ─── CHR-011 (Highlighting)
├── TTS-006 (Piper) ─────── PAY-004 (Free tier)
├── CHR-012 (kokoro-js)
├── MAC-007 (ONNX Metal)
├── IOS-002 (ONNX iOS)
├── TAU-003 (ONNX Rust)
├── AND-002 (ONNX Android)
└── CLN-001 (F5-TTS)
    ├── CLN-002 → CLN-003 → CLN-004 → CLN-005 (Voice cloning pipeline)
    └── API-005 (Clone API)

CHR-001 (WXT)
├── CHR-002 (Content) → CHR-003 (Readability) → CHR-005 (Google Docs)
├── CHR-004 (PDF.js)
└── CHR-006 (Player) → CHR-007/08/09/10/11 (Controls)

MAC-001 (Swift)
├── MAC-002 (Menu bar) → MAC-010 (Shortcuts) → MAC-011 (Selection)
├── MAC-004 (PDF) ──┬── MAC-009 (Position)
└── MAC-005 (EPUB) ─┘

PAY-001 (Stripe)
└── PAY-002 (License)
    ├── PAY-003 (Validation) → PAY-004/05/06/07 (Tiers)
    └── TEM-001 (Team dashboard)
```

---

**Document Version:** 1.0.0
**Created:** January 25, 2026
**Next Review:** Weekly sprint planning
