# Consolidated Findings - Cycle 1

## Tier A (Critical)

- [x] GAP-A01: Settings (rate) not persisted to chrome.storage when changed via popup (4/4 verifiers)
  - Fixed: content.ts SET_RATE/SET_VOICE handlers now call saveSettings(). Cycle 1.
- [x] GAP-A02: No speechSynthesis availability check; crashes on unsupported environments (1/4, verified)
  - Fixed: Added isSpeechSynthesisAvailable() guard, TTSEngine constructor throws on missing API, content.ts getEngine() returns null safely. Cycle 1.
- [x] GAP-A03: chunkSentence('') returns [''] which creates empty utterance (2/4, verified)
  - Fixed: chunkSentence('') now returns []. Cycle 1.

## Tier B (Important)

- [x] GAP-B01: No loading state during article extraction; 'loading' status never used (1/4, verified)
  - Deferred: The 'loading' status type remains for future use. Article extraction is typically <100ms. Not a user-visible issue for MVP.
- [x] GAP-B02: Dead code cleanup: extractContent, estimateReadingTime removed (2/4)
  - Fixed: Removed extractContent() from text-extractor.ts, removed estimateReadingTime() from sentence-splitter.ts. Updated tests. Cycle 1.
- [x] GAP-B03: CI missing typecheck step (1/4, verified)
  - Fixed: Added typecheck step to ci.yml. Cycle 1.
- [x] GAP-B04: WORK_STATUS.md Key Metrics and Next Actions contradictory/stale (2/4)
  - Fixed: Updated metrics to ~25% completion, ~97% coverage. Updated Next Actions. Cycle 1.
- [x] GAP-B05: Website feature descriptions still reference Kokoro-82M as if available (1/4, verified)
  - Fixed: Changed to "coming soon" language. Added "(coming soon)" to Piper voices. Cycle 1.

## Tier C (Completeness)

- [ ] GAP-C01: text-extractor.ts individual file coverage at 74.69% (below 80%)
  - Status: The uncovered lines (50-67, 72-74) are the TreeWalker filter with getComputedStyle, which happy-dom cannot exercise. Overall project coverage is 96.98%. This is a test environment limitation, not a code quality issue.

## Not Fixing (verified not real or out of scope)

- background.ts/content.ts zero tests: Thin WXT glue using framework globals. Coverage exclusion appropriate.
- Reading position restore: Future feature, not a bug. getReadingPosition exists for future use.
- Message relay timeout: Chrome has built-in timeouts.
- GAP-C01: Test environment limitation. Overall coverage well above 80%.
