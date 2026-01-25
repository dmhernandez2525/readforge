# ReadForge Coding Standards

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## General Principles

1. **Clarity over cleverness** - Write code that's easy to understand
2. **Consistency** - Follow existing patterns in the codebase
3. **Test coverage** - All new code must have tests
4. **No magic** - Avoid implicit behavior, be explicit
5. **Fail fast** - Validate inputs early, fail with clear errors

---

## TypeScript/JavaScript

### Forbidden Patterns

```typescript
// NEVER use these
any                    // Use specific types or unknown
@ts-ignore            // Fix the type error instead
eslint-disable        // Follow lint rules
console.log           // Use logger service
console.error         // Use logger service
alert()               // Use notification system
// TODO:              // Create GitHub issue instead
debugger              // Remove before commit
```

### Required Patterns

```typescript
// Logging - ALWAYS use the logger service
import { logger } from '@/services/logger';

logger.log('tts.synthesize', 'Starting synthesis', { text: text.slice(0, 50) });
logger.error('tts.synthesize', 'Synthesis failed', { error });
logger.debug('tts.synthesize', 'Audio chunk generated', { chunkSize });

// Class names - ALWAYS use cn() utility
import { cn } from '@/lib/utils';

const className = cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-variant'
);

// Error handling - ALWAYS use try/catch with proper error types
try {
  await synthesize(text);
} catch (error) {
  if (error instanceof TTSError) {
    // Handle known error
    logger.error('tts', error.message, { code: error.code });
  } else {
    // Handle unknown error
    logger.error('tts', 'Unexpected error', { error });
    throw new AppError('TTS_UNKNOWN_ERROR', 'An unexpected error occurred');
  }
}
```

### TypeScript Specific

```typescript
// Use explicit return types for public functions
function calculateDuration(text: string): number {
  return text.length * AVERAGE_CHAR_DURATION;
}

// Use type guards for runtime checks
function isVoice(value: unknown): value is Voice {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

// Use readonly for immutable data
interface Config {
  readonly apiUrl: string;
  readonly voices: readonly Voice[];
}

// Use discriminated unions for state
type PlaybackState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'playing'; progress: number }
  | { status: 'paused'; progress: number }
  | { status: 'error'; message: string };
```

### Naming Conventions

```typescript
// Files: kebab-case
text-extractor.ts
floating-player.tsx
use-tts-engine.ts

// Components: PascalCase
export function FloatingPlayer() { }
export class TextExtractor { }

// Functions/variables: camelCase
const extractText = () => { };
let currentSentence = 0;

// Constants: SCREAMING_SNAKE_CASE
const MAX_SPEED = 4.0;
const DEFAULT_VOICE_ID = 'af_heart';

// Types/Interfaces: PascalCase
interface Voice { }
type SynthesisOptions = { };

// Enums: PascalCase with PascalCase members
enum PlaybackStatus {
  Idle = 'idle',
  Playing = 'playing',
  Paused = 'paused',
}
```

---

## Swift

### Forbidden Patterns

```swift
// NEVER use these
print()                    // Use Logger.shared
force unwrap (!)           // Use guard let or if let
try!                       // Use do-catch
fatalError() in production // Return error instead
implicitly unwrapped optionals (except @IBOutlet)
```

### Required Patterns

```swift
// Logging - ALWAYS use Logger service
import OSLog

extension Logger {
    static let shared = Logger(subsystem: "com.readforge.app", category: "general")
    static let tts = Logger(subsystem: "com.readforge.app", category: "tts")
}

Logger.tts.info("Starting synthesis for text: \(text.prefix(50))")
Logger.tts.error("Synthesis failed: \(error.localizedDescription)")

// Optional handling - ALWAYS use guard or if let
guard let document = selectedDocument else {
    Logger.shared.warning("No document selected")
    return
}

// Or for multiple optionals
if let document = selectedDocument,
   let page = document.currentPage {
    displayPage(page)
}

// Error handling - ALWAYS use do-catch
do {
    try await ttsService.synthesize(text)
} catch let error as TTSError {
    Logger.tts.error("TTS error: \(error.localizedDescription)")
    showAlert(message: error.userMessage)
} catch {
    Logger.tts.error("Unexpected error: \(error)")
    showAlert(message: "An unexpected error occurred")
}
```

### Swift Specific

```swift
// Use SwiftUI property wrappers correctly
struct PlayerView: View {
    @State private var isPlaying = false           // Local state
    @Binding var speed: Double                     // Parent state
    @EnvironmentObject var appState: AppState     // Global state
    @StateObject private var viewModel = PlayerViewModel()  // Owned object
    @ObservedObject var document: Document        // External object
}

// Use async/await for all async code
func loadDocument(at url: URL) async throws -> Document {
    let data = try await URLSession.shared.data(from: url)
    return try Document(data: data.0)
}

// Use MainActor for UI updates
@MainActor
func updateProgress(_ progress: Double) {
    self.progress = progress
}

// Use Codable for serialization
struct ReadingPosition: Codable {
    let documentId: String
    let pageNumber: Int
    let offset: Int
    let timestamp: Date
}
```

### Naming Conventions

```swift
// Files: PascalCase matching type name
TTSService.swift
FloatingPlayerView.swift
Document.swift

// Types: PascalCase
class TTSService { }
struct Voice { }
enum PlaybackStatus { }
protocol DocumentReader { }

// Functions/properties: camelCase
func synthesize(text: String) { }
var currentVoice: Voice

// Constants: camelCase or static let
let maxSpeed = 4.0
static let defaultVoiceId = "af_heart"
```

---

## Rust

### Forbidden Patterns

```rust
// NEVER use these
.unwrap()              // Use ? or handle error
.expect()              // Use ? with context
panic!()               // Return Result instead
unreachable!()         // Use proper error handling
unsafe { }             // Only with explicit approval and documentation
```

### Required Patterns

```rust
// Error handling - ALWAYS use Result with ?
use anyhow::{Context, Result};

fn load_model(path: &Path) -> Result<Model> {
    let data = std::fs::read(path)
        .context("Failed to read model file")?;

    let model = Model::from_bytes(&data)
        .context("Failed to parse model")?;

    Ok(model)
}

// Logging - Use tracing crate
use tracing::{info, error, debug, warn};

info!(text_length = text.len(), "Starting synthesis");
error!(error = %e, "Synthesis failed");

// Option handling - Use map, and_then, or match
let voice = voices.iter()
    .find(|v| v.id == voice_id)
    .ok_or_else(|| AppError::VoiceNotFound(voice_id.to_string()))?;

// Or use if let for simpler cases
if let Some(voice) = selected_voice {
    synthesize_with_voice(text, voice)?;
}
```

### Rust Specific

```rust
// Use derive macros liberally
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Voice {
    pub id: String,
    pub name: String,
    pub language: String,
}

// Use impl blocks for methods
impl Voice {
    pub fn new(id: impl Into<String>, name: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            language: "en".to_string(),
        }
    }
}

// Use traits for abstraction
pub trait TTSEngine: Send + Sync {
    fn synthesize(&self, text: &str, options: &SynthesisOptions) -> Result<AudioBuffer>;
    fn voices(&self) -> &[Voice];
}

// Use async properly with tokio
#[tokio::main]
async fn main() -> Result<()> {
    let engine = KokoroEngine::new().await?;
    engine.synthesize("Hello").await?;
    Ok(())
}
```

### Naming Conventions

```rust
// Files: snake_case
tts_engine.rs
audio_buffer.rs

// Types: PascalCase
struct AudioBuffer { }
enum PlaybackState { }
trait TTSEngine { }

// Functions/variables: snake_case
fn synthesize_text() { }
let current_voice = ...;

// Constants: SCREAMING_SNAKE_CASE
const MAX_SPEED: f32 = 4.0;
const DEFAULT_SAMPLE_RATE: u32 = 24000;

// Modules: snake_case
mod audio_player;
mod text_processor;
```

---

## Git Conventions

### Commit Messages

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `test` - Adding tests
- `docs` - Documentation
- `style` - Formatting, no code change
- `perf` - Performance improvement
- `chore` - Build, tooling, dependencies

**Examples:**
```
feat(tts): add speed control support

Implements WSOLA algorithm for time-stretching audio
without affecting pitch.

Closes #123
```

```
fix(chrome): correct PDF text extraction order

PDF.js was returning text items in visual order rather
than reading order. Added sorting by position.
```

### Branch Naming

```
feature/TTS-001-kokoro-integration
fix/CHR-015-pdf-extraction-order
refactor/MAC-003-menu-bar-cleanup
```

### Pull Request Template

```markdown
## Summary
[1-3 bullet points describing the change]

## Changes
- [Detailed list of changes]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
[If UI changes]

## Checklist
- [ ] Code follows coding standards
- [ ] Tests pass locally
- [ ] Documentation updated
```

---

## Testing Standards

### Test File Location

```
src/
  services/
    tts-engine.ts
    tts-engine.test.ts       # Unit tests next to source
  __tests__/
    integration/
      tts-flow.test.ts       # Integration tests
    e2e/
      read-page.test.ts      # E2E tests
```

### Test Structure

```typescript
describe('TTSEngine', () => {
  describe('synthesize', () => {
    it('produces audio for valid text', async () => {
      // Arrange
      const engine = new TTSEngine();
      await engine.initialize();

      // Act
      const chunks: AudioChunk[] = [];
      for await (const chunk of engine.synthesize('Hello')) {
        chunks.push(chunk);
      }

      // Assert
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].samples.length).toBeGreaterThan(0);
    });

    it('throws for empty text', async () => {
      const engine = new TTSEngine();
      await engine.initialize();

      await expect(
        async () => { for await (const _ of engine.synthesize('')) { } }
      ).rejects.toThrow(TTSError);
    });
  });
});
```

### Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |
| Statements | 80% |

---

## Documentation Standards

### Code Comments

```typescript
// Good: Explains WHY
// We split sentences here rather than in the TTS engine because
// sentence boundaries affect highlighting synchronization
const sentences = splitSentences(text);

// Bad: Explains WHAT (the code already shows this)
// Split the text into sentences
const sentences = splitSentences(text);
```

### JSDoc for Public APIs

```typescript
/**
 * Synthesizes text to audio using the Kokoro TTS engine.
 *
 * @param text - The text to synthesize (max 10,000 characters)
 * @param options - Synthesis options including speed and voice
 * @returns An async generator yielding audio chunks
 * @throws {TTSError} If synthesis fails
 *
 * @example
 * ```typescript
 * const engine = new TTSEngine();
 * for await (const chunk of engine.synthesize('Hello world')) {
 *   playChunk(chunk);
 * }
 * ```
 */
async *synthesize(
  text: string,
  options?: SynthesisOptions
): AsyncGenerator<AudioChunk> {
  // ...
}
```

---

## Security Standards

### Input Validation

```typescript
// ALWAYS validate user input
function sanitizeText(input: string): string {
  // Remove control characters
  const sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > MAX_TEXT_LENGTH) {
    throw new AppError('TEXT_TOO_LONG', `Text exceeds ${MAX_TEXT_LENGTH} characters`);
  }

  return sanitized;
}
```

### Sensitive Data

```typescript
// NEVER log sensitive data
logger.log('auth', 'User authenticated', { userId: user.id });  // Good
logger.log('auth', 'User authenticated', { token: user.token }); // BAD!

// NEVER store secrets in code
const apiKey = process.env.API_KEY;  // Good
const apiKey = 'sk-abc123...';       // BAD!
```

---

## Performance Guidelines

### Async Operations

```typescript
// ALWAYS use async/await for I/O
const data = await fetch(url);

// NEVER block the main thread
// Bad:
while (audioPlayer.isPlaying) { /* spin */ }

// Good:
await new Promise(resolve => {
  audioPlayer.onEnded = resolve;
});
```

### Memory Management

```typescript
// ALWAYS clean up resources
class TTSEngine {
  dispose(): void {
    this.audioContext?.close();
    this.model?.dispose();
    this.audioBuffers = [];
  }
}

// Use WeakMap for caches keyed by objects
const cache = new WeakMap<Document, ExtractedContent>();
```

---

**Document Version:** 1.0.0
**Created:** January 25, 2026
