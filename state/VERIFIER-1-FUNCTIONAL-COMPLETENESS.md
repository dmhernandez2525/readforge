# Verifier-1: Functional Completeness Audit

**Date:** 2026-03-28
**Scope:** browser-extension at `/Users/daniel/Desktop/Projects/readforge/browser-extension/`
**Source:** REQUIREMENTS-INVENTORY.md (REQ-001 through REQ-024)

---

## Requirements Verdicts

### REQ-001: [CHR-001] WXT project scaffolding with TypeScript, React, Tailwind
**Verdict: DONE**
- Evidence: `wxt.config.ts:1-23` (WXT config with React module), `tsconfig.json:1-26` (strict TS), `tailwind.config.js` exists, `postcss.config.js` exists, `package.json` has all deps.

### REQ-002: [CHR-002] Content script injects on web pages and extracts text
**Verdict: DONE**
- Evidence: `src/entrypoints/content.ts:7-8` uses `defineContentScript` with `matches: ['http://*/*', 'https://*/*']`. Built manifest confirms: `content_scripts[0].matches` = `["http://*/*","https://*/*"]`.

### REQ-003: [CHR-003] Readability.js text extraction from articles
**Verdict: DONE**
- Evidence: `src/services/text-extractor.ts:1` imports `@mozilla/readability`, `text-extractor.ts:27-44` implements `extractArticle()` with `Readability` class, `charThreshold: 100`. Falls back to `extractFullPage()` via TreeWalker.

### REQ-004: [CHR-015] Context menu "Read with ReadForge" on right-click
**Verdict: DONE**
- Evidence: `src/entrypoints/background.ts:5-15` creates two context menus: `readforge-read-selection` (contexts: `['selection']`) and `readforge-read-page` (contexts: `['page']`). Handler at `background.ts:38-49` sends appropriate messages.

### REQ-005: [CHR-016] Extension popup UI with playback controls
**Verdict: DONE (all acceptance criteria met)**
- AC-005a Play/pause: `App.tsx:133-147` toggles between play/pause SVG icons based on status. Handler at line 69.
- AC-005b Skip forward/backward: `App.tsx:122-158` with `aria-label="Previous sentence"` and `aria-label="Next sentence"`. Handlers at lines 70-71.
- AC-005c Speed control slider: `App.tsx:161-175`, range input `min={0.5} max={3} step={0.25}`. Handler at lines 72-75.
- AC-005d Progress indicator: `App.tsx:114-119` shows `{currentSentence}/{totalSentences} sentences` and `ProgressBar` component at line 113.
- AC-005e Stop button: `App.tsx:177-182` "Stop Reading" button. Handler at line 68.
- AC-005f Current article title: `App.tsx:109-111` displays `status.title` with truncation.

### REQ-006: [CHR-017] Settings persistence via chrome.storage
**Verdict: PARTIAL**
- AC-006a Voice preference persists: `storage.ts:6-9` defines `ReadForgeSettings` with `voiceId`. `content.ts:32-37` loads settings and applies them. **However, when the user changes rate via the popup slider (SET_RATE), the new rate is NOT saved back to `chrome.storage`.** The `SET_RATE` handler in `content.ts:123-127` calls `engine.setOptions({ rate })` but never calls `saveSettings({ rate })`. Same problem for `SET_VOICE` at `content.ts:130-134`.
- AC-006b Rate/pitch/volume persist: **BROKEN.** Settings load at `startReading()` time (`content.ts:31-37`), but runtime changes via the popup (rate slider, voice picker) are never persisted. Changing speed during playback works for the current session only; reopening the popup or navigating to a new page resets to stored defaults.

### REQ-007: [CHR-018] Keyboard shortcuts
**Verdict: DONE**
- AC-007a Alt+Shift+P: `wxt.config.ts:13-16` defines `toggle-play` command with `Alt+Shift+P`. Background handler at `background.ts:52-58` maps `toggle-play` to `TOGGLE_PLAY` message.
- AC-007b Alt+Shift+R: `wxt.config.ts:17-20` defines `read-selection` command with `Alt+Shift+R`. Background handler maps `read-selection` to `READ_SELECTION`.

### REQ-008: [TTS] Text-to-speech engine
**Verdict: DONE**
- AC-008a Sequential playback: `tts-engine.ts:166-209` implements `speakNext()` chain via `utterance.onend` callback advancing `currentIndex`.
- AC-008b Chrome 15s timeout: `tts-engine.ts:38-59` implements `chunkSentence()` with `MAX_UTTERANCE_LENGTH = 200`, and `tts-engine.ts:135-146` implements watchdog timer.
- AC-008c Voices load: `tts-engine.ts:78-88` handles `voiceschanged` event when voices are empty.

### REQ-009: [TTS] Sentence splitting handles abbreviations, decimals, initials, CJK
**Verdict: DONE**
- Evidence: `sentence-splitter.ts:6-12` has abbreviation set, `isDecimalOrNumber` at line 24, `isInitials` at line 28, CJK punctuation handling at lines 52-67. Tests cover all cases: `sentence-splitter.test.ts:110-125`.

### REQ-010: [TTS] Reading position saved on completion
**Verdict: PARTIAL**
- Evidence: `content.ts:62-69` saves reading position via `onComplete` callback. However, it only saves on *completion* (reading the entire article). If the user navigates away mid-read, stops reading, or the extension is interrupted, the position is NOT saved. The `STOP_READING` handler at `content.ts:103-106` calls `engine.stop()` which resets state but never saves position. The `beforeunload` handler at `content.ts:88-90` calls `engine.dispose()` (which calls `stop()`) but also never saves. Mid-reading position is effectively lost on any non-completion exit.

### REQ-011: Build produces valid Chrome MV3 extension
**Verdict: DONE**
- AC-011a Valid MV3: `.output/chrome-mv3/manifest.json` has `"manifest_version":3`. Service worker background, popup action, content scripts all present.
- AC-011b No overly broad permissions: Permissions are `["activeTab","storage","contextMenus"]`. No `host_permissions: <all_urls>`.
- AC-011c Content script limited to http/https: `matches: ["http://*/*","https://*/*"]` in manifest.

### REQ-012: Test coverage >= 80% on all metrics
**Verdict: BROKEN**
- The `vitest.config.ts:18-25` coverage config excludes `background.ts` and `content.ts` entirely from coverage measurement. These are the two most critical orchestration files. The coverage report command itself crashes with `ENOENT` error on `coverage/.tmp/coverage-0.json`, making it impossible to verify actual coverage numbers. The thresholds are configured at 80% (lines 26-31) but the exclusions artificially inflate the metric by removing untested code from the denominator.

### REQ-013: TypeScript strict mode with no type errors
**Verdict: BROKEN**
- `tsconfig.json:10` has `"strict": true`.
- Running `tsc --noEmit` produces 3 errors:
  1. `background.ts(3,16): error TS2304: Cannot find name 'defineBackground'` - WXT auto-import not recognized by standalone `tsc`
  2. `content.ts(7,16): error TS2304: Cannot find name 'defineContentScript'` - Same issue
  3. `tts-engine.ts(70,11): error TS6133: 'voicesLoaded' is declared but its value is never read` - Dead code: `voicesLoaded` is set but never checked anywhere

### REQ-014: No security vulnerabilities
**Verdict: PARTIAL**
- AC-014a No hardcoded secrets: DONE. No secrets found.
- AC-014b URL sanitization: DONE. `storage.ts:53-59` normalizes URLs via `new URL()`.
- AC-014c Payload validation on received messages: PARTIAL. `content.ts:124` checks `typeof message.payload === 'number'` for SET_RATE, and line 131 checks `typeof message.payload === 'string'` for SET_VOICE. But the `Message.payload` type is `unknown` with no schema validation. The relay in `background.ts:62-71` forwards messages without any validation, meaning a malicious page could inject messages with crafted payloads.
- AC-014d Error handling for missing content scripts: DONE. `background.ts:25-30` checks `chrome.runtime.lastError`, and `background.ts:43,47` handle missing content scripts.

### REQ-015: Accessibility
**Verdict: DONE**
- AC-015a Labels: All buttons have `aria-label` attributes (`App.tsx:125,136,152`). Slider has `htmlFor`/`id` pairing and `aria-label` (`App.tsx:162-163,172`).
- AC-015b Focus styles: All interactive elements have `focus:outline-none focus:ring-2 focus:ring-blue-500` classes.
- AC-015c ARIA on decorative: SVG icons have `aria-hidden="true"` (`App.tsx:128,139,143,155`). Progressbar has `role="progressbar"` with `aria-valuenow/min/max` (`App.tsx:11-14`).

### REQ-016: Marketing landing page builds and deploys
**Verdict: OUT OF SCOPE** (website directory exists but this audit covers browser-extension only)

### REQ-017 through REQ-020: Website requirements
**Verdict: OUT OF SCOPE** (website directory)

### REQ-021: CI pipeline runs only valid jobs
**Verdict: DONE**
- `.github/workflows/ci.yml` has two jobs: `browser-extension` and `website`. Both reference correct directories, use Node 20, proper cache paths.

### REQ-022: Dependabot monitors correct directories
**Verdict: DONE**
- `.github/dependabot.yml` monitors `/browser-extension`, `/website` (npm), and `/` (github-actions).

### REQ-023: Documentation matches implementation
**Verdict: PARTIAL**
- AC-023a No fictional package names: The `FEATURE_BACKLOG.md` references `kokoro-js` (CHR-012) as a TTS engine, but the actual implementation uses `Web Speech API` (`speechSynthesis`). The backlog marks CHR-012 as "Pending" which is accurate, but multiple P0 features in the backlog are marked "Pending" while the extension ships without them (CHR-004 PDF.js, CHR-005 Google Docs, CHR-006 Floating player, CHR-007-011 controls). The FEATURE_BACKLOG marks CHR-007 (Play/pause controls) as "Pending" but it IS implemented in the popup. The status column is inaccurate for several items.
- AC-023b WORK_STATUS.md: Not found. No `WORK_STATUS.md` file exists in the repo.
- AC-023c FEATURE_BACKLOG.md statuses: Inaccurate. CHR-007/008/009/010 are all implemented in the popup but marked "Pending" in the backlog. The backlog lists these as dependent on CHR-006 (Floating player) which doesn't exist, but the functionality is delivered via the popup instead.

### REQ-024: .gitignore covers build artifacts and caches
**Verdict: DONE**
- Root `.gitignore` covers: `node_modules/`, `.output/`, `dist/`, `build/`, `coverage/`, `.cache/`, `.DS_Store`, `.env*`, `*.zip`, IDE files, and more. Comprehensive coverage.

---

## Summary Table

| REQ | Verdict | Notes |
|-----|---------|-------|
| REQ-001 | DONE | WXT + TS + React + Tailwind scaffolding |
| REQ-002 | DONE | Content script on http/https |
| REQ-003 | DONE | Readability.js extraction |
| REQ-004 | DONE | Context menus for selection and page |
| REQ-005 | DONE | All 6 acceptance criteria met |
| REQ-006 | PARTIAL | Settings load but runtime changes never persist |
| REQ-007 | DONE | Both keyboard shortcuts configured |
| REQ-008 | DONE | Sequential TTS with chunking and watchdog |
| REQ-009 | DONE | Abbreviations, decimals, initials, CJK |
| REQ-010 | PARTIAL | Only saves on completion, not mid-read |
| REQ-011 | DONE | Valid MV3, scoped permissions |
| REQ-012 | BROKEN | Coverage crashes; critical files excluded |
| REQ-013 | BROKEN | 3 TypeScript errors (WXT imports, dead code) |
| REQ-014 | PARTIAL | Message relay has no payload schema validation |
| REQ-015 | DONE | Labels, focus styles, ARIA attributes |
| REQ-016-020 | N/A | Website (out of scope for extension audit) |
| REQ-021 | DONE | CI pipeline valid |
| REQ-022 | DONE | Dependabot correct |
| REQ-023 | PARTIAL | Backlog statuses inaccurate, WORK_STATUS.md missing |
| REQ-024 | DONE | Comprehensive .gitignore |

**Totals: 12 DONE, 4 PARTIAL, 2 BROKEN, 5 N/A (website)**

---

## NEW Gaps (Beyond Requirements Inventory)

### GAP-001: Runtime settings changes are fire-and-forget (Severity: A)
**File:** `src/entrypoints/content.ts:123-134`
**Description:** When the user adjusts the speed slider or changes voice in the popup, the `SET_RATE` and `SET_VOICE` message handlers call `engine.setOptions()` but never call `saveSettings()`. This means:
1. User sets speed to 2x
2. User navigates to another page
3. Extension reads at 1x (default) again
This violates REQ-006 (settings persistence). The fix requires adding `saveSettings({ rate })` and `saveSettings({ voiceId })` calls in these handlers.

### GAP-002: `voicesLoaded` field is dead code (Severity: B)
**File:** `src/services/tts-engine.ts:70`
**Description:** The `voicesLoaded` private field is set to `true` in `initVoices()` at lines 81 and 86, but is never read anywhere in the class. TypeScript flags this as error TS6133 under `noUnusedLocals`. This was likely intended to gate voice-dependent operations but was never wired up. If voices haven't loaded yet when `speak()` is called, the engine will proceed with the default voice silently, which may be acceptable but is undocumented behavior.

### GAP-003: Reading position lost on stop/navigate (Severity: A)
**File:** `src/entrypoints/content.ts:103-106` and `content.ts:88-90`
**Description:** The `STOP_READING` handler calls `engine.stop()` without saving position. The `beforeunload` handler calls `engine.dispose()` (which calls `stop()`) without saving. Only the `onComplete` callback (`content.ts:62-69`) saves position. This means:
1. User reads 50 of 100 sentences and clicks Stop -- position lost
2. User reads 50 of 100 sentences and closes the tab -- position lost
3. User reads 50 of 100 sentences and navigates away -- position lost
The `getReadingPosition()` function exists in `storage.ts:74-78` but is never called anywhere in the codebase, confirming that resume-from-position is completely unimplemented.

### GAP-004: Coverage report generation crashes (Severity: B)
**File:** `vitest.config.ts:14-16` and coverage infrastructure
**Description:** Running `npm run test:coverage` crashes with `ENOENT: no such file or directory, open 'coverage/.tmp/coverage-0.json'`. This means CI will fail on the coverage upload step, and developers cannot verify coverage thresholds locally. The 121 tests all pass, but coverage metrics are unverifiable. This may be a vitest/v8 version incompatibility.

### GAP-005: Popup does not expose voice selection UI (Severity: B)
**File:** `src/entrypoints/popup/App.tsx` (entire file)
**Description:** The extension supports `SET_VOICE` messages (`content.ts:130-134`, `background.ts:66`) and has voice listing via `tts-engine.ts:90-97 getVoices()`, but the popup UI has no voice selection dropdown or any way for users to choose a voice. The only exposed control is the speed slider. The `saveSettings()` function supports `voiceId` persistence, but there is no UI to set it. Users are stuck with whatever voice Chrome picks as default.

### GAP-006: No loading state shown during article extraction (Severity: C)
**File:** `src/entrypoints/popup/App.tsx:67,96-102`
**Description:** When the user clicks "Read This Page", the popup sends `START_READING` and waits for a response. During this time (which can be significant for large pages due to Readability parsing and DOM cloning), there is no loading indicator. The `StatusPayload` type includes a `'loading'` status, but it's never set anywhere in `content.ts`. The `startReading()` function goes directly from idle to speaking without a loading intermediate.

### GAP-007: `extractContent()` function is exported but never used (Severity: C)
**File:** `src/services/text-extractor.ts:85-88`
**Description:** The `extractContent()` convenience function (which chains selection > article > full-page) is defined and tested but never imported anywhere. The `content.ts` file imports `extractArticle`, `extractFromSelection`, and `extractFullPage` individually and implements its own priority logic at lines 41-48 and 81-84. This is not a bug but indicates either dead code or a missed refactoring opportunity.

### GAP-008: Popup STATUS_UPDATE listener receives messages meant for content script (Severity: B)
**File:** `src/entrypoints/popup/App.tsx:58-64`
**Description:** The popup registers a `chrome.runtime.onMessage` listener for `STATUS_UPDATE` messages. But the background script at `background.ts:62-71` also has a `chrome.runtime.onMessage` listener that relays messages to the active tab. When the content script sends a `STATUS_UPDATE` via `chrome.runtime.sendMessage` (`content.ts:57-60`), this message goes to ALL extension contexts (background AND popup). The background `relayTypes` set does not include `STATUS_UPDATE`, so it won't relay it, but the message architecture means the popup receives status updates sent by the content script AND any status updates that might be sent by other extension pages. There is no sender verification.

### GAP-009: `chunkSentence('')` returns `['']` instead of `[]` (Severity: C)
**File:** `src/services/tts-engine.ts:42`
**Description:** When `chunkSentence` receives an empty string, it returns `['']` because the length check `text.length <= maxLen` passes (0 <= 200). The `speak()` method at line 149 checks `if (!sentences.length)` but a chunked empty string produces `['']` which has length 1. The engine will attempt to speak an empty utterance. This is tested at `tts-engine.test.ts:71-73` but the test asserts the current (arguably wrong) behavior.

### GAP-010: No rate clamping or validation (Severity: B)
**File:** `src/entrypoints/content.ts:124` and `src/services/tts-engine.ts:115-117`
**Description:** The SET_RATE handler accepts any number and passes it directly to `setOptions()`. The Web Speech API `SpeechSynthesisUtterance.rate` accepts 0.1-10, but values outside Chrome's supported range (typically 0.1-10, with quality degradation above 3x) can cause silent failures or errors. The popup slider is clamped to 0.5-3, but a crafted message could set rate to 0 or negative, causing undefined behavior. The `setOptions()` method performs no validation.

---

## Risk Summary

| Severity | Count | Description |
|----------|-------|-------------|
| A (Breaking) | 2 | Settings not persisted (GAP-001), reading position lost (GAP-003) |
| B (Significant) | 5 | Dead code TS error (GAP-002), coverage crash (GAP-004), no voice UI (GAP-005), message trust (GAP-008), no rate validation (GAP-010) |
| C (Minor) | 3 | No loading state (GAP-006), dead export (GAP-007), empty chunk behavior (GAP-009) |

**Top 3 fixes needed before this can be considered production-ready:**
1. Fix settings persistence (GAP-001) -- call `saveSettings()` when rate/voice changes
2. Save reading position on stop/navigate (GAP-003) -- save in STOP_READING handler and beforeunload
3. Fix coverage infrastructure (GAP-004) -- either fix the v8 coverage crash or update vitest/v8-coverage versions
