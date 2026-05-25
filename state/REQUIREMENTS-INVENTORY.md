# Requirements Inventory

> Scope: Phase 1B Chrome Extension MVP + Website + Project Infrastructure
> Source: docs/sdd/phase-1/SDD-002-CHROME-EXTENSION.md, docs/FEATURE_BACKLOG.md, README.md

## Chrome Extension: Core Features

- REQ-001: [CHR-001] WXT project scaffolding with TypeScript, React, Tailwind (source: SDD-002)
- REQ-002: [CHR-002] Content script injects on web pages and extracts text (source: SDD-002)
- REQ-003: [CHR-003] Readability.js text extraction from articles (source: SDD-002)
- REQ-004: [CHR-015] Context menu "Read with ReadForge" on right-click (source: SDD-002)
- REQ-005: [CHR-016] Extension popup UI with playback controls (source: SDD-002)
  - AC-005a: Play/pause button
  - AC-005b: Skip forward/backward buttons
  - AC-005c: Speed control slider (0.5x-3x)
  - AC-005d: Progress indicator (sentence count)
  - AC-005e: Stop button
  - AC-005f: Current article title display
- REQ-006: [CHR-017] Settings persistence via chrome.storage (source: SDD-002)
  - AC-006a: Voice preference persists across sessions
  - AC-006b: Rate/pitch/volume persist
- REQ-007: [CHR-018] Keyboard shortcuts (source: SDD-002)
  - AC-007a: Alt+Shift+P toggles play/pause
  - AC-007b: Alt+Shift+R reads selected text

## Chrome Extension: TTS Engine

- REQ-008: [TTS] Text-to-speech engine plays extracted text aloud (source: SDD-001, SDD-002)
  - AC-008a: Sentences are played sequentially
  - AC-008b: Handles long sentences without Chrome 15s timeout
  - AC-008c: Voices load correctly (voiceschanged event)
- REQ-009: [TTS] Sentence splitting handles abbreviations, decimals, initials, CJK (source: SDD-001)
- REQ-010: [TTS] Reading position saved on completion (source: SDD-002)

## Chrome Extension: Quality

- REQ-011: Build produces valid Chrome MV3 extension (source: inferred)
  - AC-011a: manifest.json is valid MV3
  - AC-011b: No overly broad permissions (no host_permissions: <all_urls>)
  - AC-011c: Content script limited to http/https
- REQ-012: Test coverage >= 80% on all metrics (source: CLAUDE.md)
- REQ-013: TypeScript strict mode with no type errors (source: tsconfig.json)
- REQ-014: No security vulnerabilities (source: inferred)
  - AC-014a: No hardcoded secrets
  - AC-014b: URL sanitization in stored data
  - AC-014c: Payload validation on received messages
  - AC-014d: Error handling for missing content scripts
- REQ-015: Accessibility (source: inferred)
  - AC-015a: All interactive elements have labels
  - AC-015b: Focus styles visible
  - AC-015c: ARIA attributes on decorative elements

## Website

- REQ-016: Marketing landing page builds and deploys (source: render.yaml)
- REQ-017: No dead links or broken anchors (source: inferred)
- REQ-018: Platform availability claims are accurate (source: inferred)
- REQ-019: Pricing section has appropriate disclaimers (source: inferred)
- REQ-020: SEO basics: favicon, OG tags, viewport (source: inferred)

## Project Infrastructure

- REQ-021: CI pipeline runs only valid jobs (source: .github/workflows/ci.yml)
- REQ-022: Dependabot monitors correct directories (source: .github/dependabot.yml)
- REQ-023: Documentation matches implementation (source: docs/)
  - AC-023a: No fictional package names in SDDs
  - AC-023b: WORK_STATUS.md reflects reality
  - AC-023c: FEATURE_BACKLOG.md statuses accurate
- REQ-024: .gitignore covers build artifacts and caches (source: .gitignore)
