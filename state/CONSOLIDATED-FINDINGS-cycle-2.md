# Consolidated Findings - Cycle 2

## Tier A (Critical)

- [x] GAP-A04: `_voicesLoaded` field causes `tsc --noEmit` failure (2/4 verifiers: V1, V4)
  - Fixed: Removed the field entirely. `initVoices()` still listens for `voiceschanged` but no longer tracks state. tsc now passes clean. Cycle 2.

## Tier B (Important)

- [x] GAP-B06: Watchdog timer not restarted on resume() after pause (1/4: V2, verified)
  - Fixed: `resume()` now calls `this.startWatchdog(15000)` after resuming speech. Chrome's 15s timeout still applies after resume. Cycle 2.

## Not Fixing (verified not real or acceptable for MVP)

- SDD-002 still lists aspirational files/deps (V3): Already has implementation note at top. SDDs are design docs for future state. Acceptable.
- Coverage exclusions for background.ts/content.ts (V4): Thin WXT glue, framework globals. All called logic is tested.
- Error test doesn't check message text (V4): Low impact. getByRole('alert') confirms error display works.
- toBeTruthy on getByText (V4): Style issue. getByText throws if not found, so existence is verified.
- No user feedback on empty page (V2): UX nicety, not a bug. Silent idle return is acceptable MVP behavior.
- Pitch/volume never asserted in tests (V4): Low risk. Properties are set on the same line as rate, which IS tested.
- chunkSentence boundary tests (V4): Low risk. The <= check is straightforward.
