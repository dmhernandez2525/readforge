# ReadForge Development Roadmap

**Version:** 1.0.0
**Last Updated:** January 25, 2026
**Status:** Planning Complete

---

## Overview

ReadForge is a cross-platform, privacy-first text-to-speech application that runs 100% locally. This roadmap outlines the phased development plan based on competitive research findings.

### Strategic Positioning

> "Premium AI voices that never leave your device"

**Three Pillars:**
1. **Privacy-first** - Text processing happens 100% locally
2. **Unlimited usage** - No word limits, no credits, no overage charges
3. **Fair pricing** - $59/year or $99 lifetime (58% cheaper than Speechify)

---

## Phase 1: MVP Foundation (Weeks 1-12)

**Goal:** Launch Chrome extension + macOS desktop with core read-aloud functionality
**Target:** Privacy-conscious early adopters, developers, power readers

### Phase 1A: Core TTS Engine (Weeks 1-4)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 1A.1 | Kokoro-82M ONNX integration | P0 | L | None |
| 1A.2 | Audio streaming pipeline | P0 | M | 1A.1 |
| 1A.3 | Speed control (0.5x-4x) | P0 | S | 1A.2 |
| 1A.4 | Sentence boundary detection | P0 | M | 1A.1 |
| 1A.5 | Piper TTS fallback | P1 | M | 1A.2 |

**Deliverables:**
- [ ] TTS core library with Kokoro-82M
- [ ] Real-time audio streaming
- [ ] Speed/pitch control
- [ ] Sentence tokenization for highlighting

### Phase 1B: Chrome Extension (Weeks 3-8)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 1B.1 | WXT project setup | P0 | S | None |
| 1B.2 | Web page text extraction (Readability.js) | P0 | M | 1B.1 |
| 1B.3 | PDF reading (PDF.js) | P0 | L | 1B.1 |
| 1B.4 | Google Docs support | P0 | M | 1B.2 |
| 1B.5 | Floating player UI | P0 | L | 1B.2 |
| 1B.6 | Text highlighting sync | P0 | M | 1B.5, 1A.4 |
| 1B.7 | Voice selection dropdown | P0 | S | 1B.5 |
| 1B.8 | kokoro-js WebGPU integration | P0 | L | 1A.1, 1B.5 |
| 1B.9 | WASM fallback for non-WebGPU browsers | P1 | M | 1B.8 |
| 1B.10 | Desktop relay for WebGPU-limited browsers | P1 | M | 1B.8 |

**Deliverables:**
- [ ] Chrome extension with 100% offline TTS
- [ ] Web page, PDF, and Google Docs reading
- [ ] Floating player with highlighting
- [ ] Voice selection and speed control

### Phase 1C: macOS Desktop App (Weeks 5-12)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 1C.1 | Swift/AppKit project setup | P0 | M | None |
| 1C.2 | Menu bar app shell | P0 | M | 1C.1 |
| 1C.3 | PDF reader view | P0 | L | 1C.2 |
| 1C.4 | EPUB reader view | P0 | L | 1C.2 |
| 1C.5 | Python TTS server (port 8765) | P0 | M | 1A.1 |
| 1C.6 | Kokoro ONNX native integration | P0 | L | 1C.5 |
| 1C.7 | Reading position persistence | P0 | M | 1C.3, 1C.4 |
| 1C.8 | Global keyboard shortcuts | P0 | M | 1C.2 |
| 1C.9 | System-wide text selection reading | P1 | M | 1C.8 |

**Deliverables:**
- [ ] macOS menu bar app
- [ ] PDF/EPUB reader with TTS
- [ ] Keyboard shortcuts
- [ ] Reading position persistence

### Phase 1 Success Criteria

- [ ] Chrome extension published to Chrome Web Store
- [ ] macOS app ready for TestFlight
- [ ] TTS latency < 500ms first audio
- [ ] Quality A/B test vs Speechify (target: indistinguishable)
- [ ] 100% offline operation verified

---

## Phase 2: Platform Expansion (Months 4-6)

**Goal:** Safari + Firefox extensions, iOS app, voice cloning
**Target:** Apple ecosystem users, accessibility community

### Phase 2A: Browser Extension Expansion (Weeks 13-16)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 2A.1 | Safari extension port | P0 | M | Phase 1B |
| 2A.2 | Firefox extension port | P0 | M | Phase 1B |
| 2A.3 | Gmail integration | P1 | M | Phase 1B |
| 2A.4 | Keyboard shortcuts | P1 | S | Phase 1B |
| 2A.5 | Reading history | P1 | M | Phase 1B |

### Phase 2B: iOS App (Weeks 13-20)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 2B.1 | Swift + ONNX Runtime setup | P0 | L | 1A.1 |
| 2B.2 | Background audio (AVAudioSession) | P0 | M | 2B.1 |
| 2B.3 | Lock screen controls | P0 | S | 2B.2 |
| 2B.4 | Share extension | P0 | M | 2B.1 |
| 2B.5 | PDF reader | P0 | L | 2B.1 |
| 2B.6 | CoreML acceleration | P1 | L | 2B.1 |
| 2B.7 | Safari extension for iOS | P1 | M | 2A.1 |
| 2B.8 | Camera OCR (Vision framework) | P1 | M | 2B.1 |
| 2B.9 | EPUB reader | P1 | L | 2B.5 |

### Phase 2C: Voice Cloning (Weeks 17-24)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 2C.1 | F5-TTS integration | P1 | L | 1A.1 |
| 2C.2 | 10-second sample recording | P1 | M | 2C.1 |
| 2C.3 | Voice profile storage | P1 | M | 2C.1 |
| 2C.4 | Voice clone preview | P1 | S | 2C.3 |
| 2C.5 | Qwen3-TTS voice design | P2 | L | 2C.1 |

### Phase 2D: Enhanced Features (Weeks 17-24)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 2D.1 | DOCX support | P1 | M | Phase 1C |
| 2D.2 | Multiple preset voices | P1 | S | 1A.1 |
| 2D.3 | Voice favorites | P1 | S | 2D.2 |
| 2D.4 | Bookmarks | P1 | M | Phase 1C |
| 2D.5 | OCR for images (Tesseract) | P1 | M | Phase 1C |

### Phase 2 Success Criteria

- [ ] Safari + Firefox extensions published
- [ ] iOS app on App Store
- [ ] Voice cloning working with 10s samples
- [ ] iOS background playback stable
- [ ] 5,000+ active users

---

## Phase 3: Cross-Platform Expansion (Months 7-9)

**Goal:** Windows, Linux, Android, optional sync service
**Target:** Linux enthusiasts, enterprise pilot customers

### Phase 3A: Windows/Linux Desktop (Weeks 25-32)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 3A.1 | Tauri 2.0 project setup | P0 | M | None |
| 3A.2 | ONNX Runtime native (DirectML/Vulkan) | P0 | L | 1A.1 |
| 3A.3 | System tray app | P0 | M | 3A.1 |
| 3A.4 | PDF/EPUB/DOCX reader | P0 | L | 3A.1 |
| 3A.5 | Global keyboard shortcuts | P0 | M | 3A.3 |
| 3A.6 | System selection reading | P1 | M | 3A.5 |
| 3A.7 | Linux CLI interface | P1 | M | 3A.2 |
| 3A.8 | Linux package formats (AppImage, Flatpak, deb) | P1 | M | 3A.7 |

### Phase 3B: Android App (Weeks 29-36)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 3B.1 | Kotlin + ONNX Runtime setup | P0 | L | 1A.1 |
| 3B.2 | NNAPI acceleration | P0 | M | 3B.1 |
| 3B.3 | Background playback (ExoPlayer) | P0 | M | 3B.1 |
| 3B.4 | Share intent | P0 | M | 3B.1 |
| 3B.5 | PDF reader | P0 | L | 3B.1 |
| 3B.6 | Accessibility service | P1 | L | 3B.1 |
| 3B.7 | Camera OCR | P1 | M | 3B.1 |
| 3B.8 | EPUB reader | P1 | L | 3B.5 |

### Phase 3C: Sync Service (Optional) (Weeks 33-36)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 3C.1 | Node.js + Express API | P2 | M | None |
| 3C.2 | Reading position sync | P2 | M | 3C.1 |
| 3C.3 | Bookmark sync | P2 | S | 3C.1 |
| 3C.4 | Voice profile sync (E2E encrypted) | P2 | L | 3C.1, 2C.3 |
| 3C.5 | Docker self-hosted deployment | P2 | M | 3C.1 |
| 3C.6 | SQLite local / PostgreSQL cloud | P2 | M | 3C.1 |

### Phase 3 Success Criteria

- [ ] Windows app on Microsoft Store
- [ ] Linux packages published (AppImage, Flatpak)
- [ ] Android app on Play Store
- [ ] Show HN launch
- [ ] r/selfhosted launch
- [ ] 25,000+ active users

---

## Phase 4: Monetization & Enterprise (Months 10-12)

**Goal:** Payment integration, API, team features, enterprise deployment
**Target:** Professional users, small teams, enterprise pilots

### Phase 4A: Payment & Licensing (Weeks 37-40)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 4A.1 | Stripe integration | P0 | M | None |
| 4A.2 | License key system | P0 | M | 4A.1 |
| 4A.3 | Free tier (Piper voices) | P0 | S | 1A.5 |
| 4A.4 | Personal tier ($59/yr, $99 lifetime) | P0 | M | 4A.2 |
| 4A.5 | Professional tier ($129/yr) | P1 | M | 4A.2 |
| 4A.6 | BYOK option (ElevenLabs, OpenAI) | P2 | L | 4A.2 |

### Phase 4B: Developer API (Weeks 37-44)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 4B.1 | REST API design | P1 | M | None |
| 4B.2 | TTS endpoint | P1 | M | 4B.1, 1A.1 |
| 4B.3 | Streaming endpoint | P1 | M | 4B.2 |
| 4B.4 | Voice cloning endpoint | P1 | M | 4B.2, 2C.1 |
| 4B.5 | API key management | P1 | M | 4B.1 |
| 4B.6 | Usage metering | P1 | M | 4B.5 |
| 4B.7 | Self-hosted API option | P2 | L | 4B.1 |

### Phase 4C: Team Features (Weeks 41-48)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 4C.1 | Team dashboard | P2 | L | 4A.2 |
| 4C.2 | Shared voice profiles | P2 | M | 4C.1, 2C.3 |
| 4C.3 | Admin seat management | P2 | M | 4C.1 |
| 4C.4 | SSO (SAML/OIDC) | P2 | L | 4C.1 |
| 4C.5 | Usage analytics | P2 | M | 4C.1 |

### Phase 4D: Premium Features (Weeks 41-48)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 4D.1 | AI summaries (local LLM) | P2 | L | None |
| 4D.2 | Audiobook mode (chapters) | P2 | M | Phase 1C |
| 4D.3 | Multi-voice documents | P2 | L | 2D.2 |
| 4D.4 | Pronunciation dictionary | P2 | M | 1A.1 |
| 4D.5 | Export to MP3/WAV | P2 | M | 1A.2 |

### Phase 4 Success Criteria

- [ ] Payment processing live
- [ ] $10K MRR
- [ ] API documentation published
- [ ] 2+ enterprise pilot customers
- [ ] 100,000+ total users

---

## Phase 5: Interactive Reading - PersonaPlex Integration (Q3 2026)

**Goal:** Voice-controlled reading with natural conversation
**Target:** Hands-free users, accessibility, multi-tasking readers

### Overview

Integrate NVIDIA's PersonaPlex full duplex AI to enable natural, conversational control of the reading experience. Users can interrupt, ask questions, and navigate documents using only their voice.

### What is PersonaPlex?

PersonaPlex is NVIDIA's open-source **full duplex** conversational AI:
- **Full Duplex**: Listens and speaks simultaneously
- **Back-channeling**: Says "uh-huh", "got it" while you speak
- **Near-zero latency**: <500ms response time
- **Open source**: Apache 2.0 license

### Feature: Interactive Reading Mode

**Current Experience:**
```
User presses play → Audio plays → User clicks pause → User scrolls → User clicks play
```

**With PersonaPlex:**
```
User: "Start reading"
ReadForge: "Starting from chapter 3..." [begins reading]
User: "Wait, go back"
ReadForge: "Sure, from where?" [stops, waits]
User: "The part about machine learning"
ReadForge: "Found it. 'Machine learning is a subset of...'" [continues]
User: "What does that mean?"
ReadForge: "Machine learning refers to..." [explains, then resumes]
User: "Skip to the next section"
ReadForge: "Jumping to 'Neural Networks'..." [continues reading]
```

### Phase 5A: PersonaPlex Integration (Weeks 49-52)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 5A.1 | PersonaPlex server deployment | P1 | M | None |
| 5A.2 | Audio stream integration | P1 | L | 5A.1 |
| 5A.3 | Navigation commands | P1 | M | 5A.2 |
| 5A.4 | Content explanation mode | P2 | L | 5A.2 |
| 5A.5 | macOS desktop integration | P1 | M | 5A.2, MAC-* |
| 5A.6 | Browser extension integration | P2 | L | 5A.2, CHR-* |

### Phase 5B: Advanced Voice Features (Weeks 53-56)

| ID | Feature | Priority | Effort | Dependencies |
|----|---------|----------|--------|--------------|
| 5B.1 | "What was that?" replay | P1 | S | 5A.3 |
| 5B.2 | "Define [word]" inline | P1 | M | 5A.4 |
| 5B.3 | "Summarize this section" | P2 | M | 5A.4 |
| 5B.4 | "Slow down" / "Speed up" voice control | P1 | S | 5A.3 |
| 5B.5 | "Bookmark this" voice command | P2 | S | 5A.3 |
| 5B.6 | Natural interruption handling | P0 | M | 5A.2 |

### Supported Voice Commands

| Command | Action |
|---------|--------|
| "Start reading" / "Read this" | Begin reading current document |
| "Stop" / "Pause" | Pause reading |
| "Go back" / "Repeat that" | Replay last sentence/paragraph |
| "Skip ahead" / "Next section" | Jump forward |
| "Slow down" / "Faster" | Adjust speed via voice |
| "What does [word] mean?" | Inline definition |
| "Explain that" | Pause and explain concept |
| "Summarize this section" | Generate summary |
| "Bookmark this" | Save current position |
| "Where am I?" | Announce current position |

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  ReadForge + PersonaPlex                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PersonaPlex Server                       │   │
│  │              (Port 8998, Full Duplex)                 │   │
│  │                                                       │   │
│  │  ┌─────────────┐       ┌─────────────────────────┐   │   │
│  │  │   User      │◄─────►│   Reading Assistant     │   │   │
│  │  │   Voice     │       │   (Navigation Agent)    │   │   │
│  │  └─────────────┘       └─────────────────────────┘   │   │
│  │                                 │                     │   │
│  │                                 ▼                     │   │
│  │  ┌──────────────────────────────────────────────────┐│   │
│  │  │                 ReadForge Core                    ││   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       ││   │
│  │  │  │ Document │  │ Kokoro   │  │ Position │       ││   │
│  │  │  │ Parser   │  │ TTS      │  │ Manager  │       ││   │
│  │  │  └──────────┘  └──────────┘  └──────────┘       ││   │
│  │  └──────────────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| VRAM | 24GB | 32GB+ |
| RAM | 32GB | 64GB |
| GPU | Apple M2 Pro / RTX 3090 | M2 Max / RTX 4090 |

### Phase 5 Success Criteria

- [ ] Voice commands recognized 95%+ accuracy
- [ ] Natural interruption feels seamless
- [ ] <500ms response to voice commands
- [ ] Explanation mode generates helpful content
- [ ] User satisfaction >4/5 for hands-free reading

---

## Post-Launch Roadmap (2026 Q4+)

### Future Features (Backlog)

| Feature | Priority | Notes |
|---------|----------|-------|
| Notion integration | P3 | High demand from productivity users |
| Obsidian plugin | P3 | Developer audience overlap |
| Kindle support | P3 | Legal review required |
| Pocket/Instapaper import | P3 | Reading list integration |
| Real-time translation + TTS | P3 | Read foreign content aloud in English |
| Emotional expression controls | P3 | Beyond neutral Kokoro voices |
| Wake word activation | P3 | "Hey ReadForge, read this" |
| Apple Watch companion | P3 | Playback controls |

### Enterprise Features (Backlog)

| Feature | Priority | Notes |
|---------|----------|-------|
| On-premise deployment | P3 | Air-gapped environments |
| Custom voice training | P3 | Brand voices |
| Compliance reporting | P3 | HIPAA, GDPR audit logs |
| SLA options | P3 | 99.9% uptime guarantee |
| Dedicated support | P3 | Enterprise tier |

---

## Key Metrics & Milestones

### Phase 1 Targets
- Chrome extension users: 1,000
- macOS app downloads: 500
- TTS latency p95: < 500ms

### Phase 2 Targets
- Total active users: 5,000
- iOS app downloads: 2,000
- Voice clones created: 500

### Phase 3 Targets
- Total active users: 25,000
- Linux users: 2,500
- Self-hosted deployments: 100

### Phase 4 Targets
- Total active users: 100,000
- Paid subscribers: 2,500
- MRR: $10,000
- Enterprise pilots: 2+

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WebGPU browser support gaps | Medium | High | WASM fallback + desktop relay |
| iOS memory constraints (30-50MB limit) | High | Medium | Piper fallback, model optimization |
| Speechify adds offline mode | Medium | High | Emphasize open-source, no lock-in, Linux support |
| ElevenLabs releases local SDK | Medium | High | Focus on reading use case, privacy, fair pricing |
| Voice quality perception | Medium | High | A/B testing, continuous model updates |

---

## Resource Requirements

### Engineering
- 1 full-stack developer (browser + web)
- 1 iOS/macOS developer (Swift)
- 1 cross-platform developer (Tauri/Rust)
- 1 ML engineer (TTS optimization)

### Infrastructure
- Model hosting: ~$50/month (initial)
- CI/CD: GitHub Actions (free tier)
- Sync service: ~$20/month (initial)

### Tools
- Apple Developer: $99/year
- Google Play: $25 one-time
- Chrome Web Store: $5 one-time
- Microsoft Store: $19 one-time

---

**Document Version:** 1.0.0
**Created:** January 25, 2026
**Next Review:** February 1, 2026
