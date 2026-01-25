# ReadForge Architecture Patterns

**Version:** 1.0.0
**Last Updated:** January 25, 2026

---

## System Overview

ReadForge follows a modular, platform-adaptive architecture where the core TTS engine is shared across all platforms, with platform-specific UI and integration layers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User Interfaces                                 │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│   Browser    │    macOS     │ Windows/Linux│     iOS      │    Android     │
│  Extensions  │   Desktop    │   Desktop    │     App      │      App       │
│    (WXT)     │   (Swift)    │   (Tauri)    │   (Swift)    │   (Kotlin)     │
├──────────────┴──────────────┴──────────────┴──────────────┴────────────────┤
│                           Platform Adapters                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Audio Output  │  Text Extraction  │  File System  │  Notifications  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Core Services                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │ TTS Engine │  │  Document  │  │  Reading   │  │  Voice Management  │   │
│  │            │  │   Parser   │  │  Position  │  │                    │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                              ML Runtime                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │   ONNX Runtime (Native)  │  kokoro-js (WebGPU/WASM)  │  CoreML/NNAPI │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                Models                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐   │
│  │   Kokoro-82M   │  │   Piper TTS    │  │  F5-TTS (Voice Cloning)   │   │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Design Patterns

### 1. Adapter Pattern for Platform Abstraction

Each platform implements a common interface but with platform-specific details.

```typescript
// Common interface
interface AudioPlayer {
  play(buffer: AudioBuffer): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  setVolume(volume: number): void;
  onComplete: () => void;
}

// Browser implementation
class WebAudioPlayer implements AudioPlayer {
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;

  async play(buffer: AudioBuffer): Promise<void> {
    this.context = new AudioContext();
    const audioBuffer = await this.context.decodeAudioData(buffer);
    this.source = this.context.createBufferSource();
    this.source.buffer = audioBuffer;
    this.source.connect(this.context.destination);
    this.source.onended = () => this.onComplete();
    this.source.start();
  }

  // ... other methods
}

// macOS implementation (Swift)
class AVAudioPlayer: AudioPlayer {
  private var player: AVAudioPlayerNode
  private var engine: AVAudioEngine

  func play(buffer: AudioBuffer) async {
    // Use AVAudioEngine for playback
  }
}
```

### 2. Strategy Pattern for TTS Engines

Multiple TTS engines with a common interface, selected based on context.

```typescript
interface TTSEngine {
  synthesize(text: string, options: TTSOptions): AsyncGenerator<AudioChunk>;
  getVoices(): Voice[];
  isAvailable(): boolean;
}

class KokoroEngine implements TTSEngine {
  async *synthesize(text: string, options: TTSOptions): AsyncGenerator<AudioChunk> {
    // Kokoro-specific implementation
  }
}

class PiperEngine implements TTSEngine {
  async *synthesize(text: string, options: TTSOptions): AsyncGenerator<AudioChunk> {
    // Piper-specific implementation
  }
}

class TTSEngineManager {
  private engines: TTSEngine[] = [
    new KokoroEngine(),
    new PiperEngine(),
  ];

  getEngine(requirements: EngineRequirements): TTSEngine {
    // Select best available engine based on:
    // - Language support
    // - Hardware capabilities
    // - Quality requirements
    return this.engines.find(e => e.isAvailable() && meetsRequirements(e, requirements))
      ?? this.engines[this.engines.length - 1]; // Fallback
  }
}
```

### 3. Observer Pattern for State Management

Reactive state updates across components.

```typescript
// State store
class AppState {
  private listeners = new Set<(state: State) => void>();
  private state: State = initialState;

  subscribe(listener: (state: State) => void): () => void {
    this.listeners.add(listener);
    listener(this.state); // Immediate notification
    return () => this.listeners.delete(listener);
  }

  update(partial: Partial<State>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.state));
  }
}

// Usage in React
function useAppState<T>(selector: (state: State) => T): T {
  const [value, setValue] = useState<T>(() => selector(appState.getState()));

  useEffect(() => {
    return appState.subscribe(state => setValue(selector(state)));
  }, [selector]);

  return value;
}
```

### 4. Factory Pattern for Document Parsers

Create appropriate parser based on file type.

```typescript
interface DocumentParser {
  parse(content: ArrayBuffer): Promise<ParsedDocument>;
  getSupportedTypes(): string[];
}

class PDFParser implements DocumentParser {
  async parse(content: ArrayBuffer): Promise<ParsedDocument> {
    // Use PDF.js
  }

  getSupportedTypes(): string[] {
    return ['application/pdf'];
  }
}

class EPUBParser implements DocumentParser {
  async parse(content: ArrayBuffer): Promise<ParsedDocument> {
    // Parse EPUB structure
  }

  getSupportedTypes(): string[] {
    return ['application/epub+zip'];
  }
}

class DocumentParserFactory {
  private parsers: DocumentParser[] = [
    new PDFParser(),
    new EPUBParser(),
    new DOCXParser(),
  ];

  getParser(mimeType: string): DocumentParser | null {
    return this.parsers.find(p => p.getSupportedTypes().includes(mimeType)) ?? null;
  }
}
```

### 5. Command Pattern for User Actions

Encapsulate user actions for undo/redo and logging.

```typescript
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  description: string;
}

class ChangeSpeedCommand implements Command {
  constructor(
    private player: AudioPlayer,
    private newSpeed: number,
    private previousSpeed: number
  ) {}

  description = `Change speed to ${this.newSpeed}x`;

  async execute(): Promise<void> {
    this.player.setSpeed(this.newSpeed);
  }

  async undo(): Promise<void> {
    this.player.setSpeed(this.previousSpeed);
  }
}

class CommandHistory {
  private history: Command[] = [];
  private position = -1;

  async execute(command: Command): Promise<void> {
    await command.execute();
    this.history = this.history.slice(0, this.position + 1);
    this.history.push(command);
    this.position++;
    logger.log('command', command.description);
  }

  async undo(): Promise<void> {
    if (this.position >= 0) {
      await this.history[this.position].undo();
      this.position--;
    }
  }

  async redo(): Promise<void> {
    if (this.position < this.history.length - 1) {
      this.position++;
      await this.history[this.position].execute();
    }
  }
}
```

---

## Data Flow Patterns

### 1. Unidirectional Data Flow

```
User Action → Command → State Update → UI Re-render
                 ↓
            Side Effects (audio, storage, etc.)
```

```typescript
// Example: Play button clicked
function handlePlayClick() {
  // 1. Create command
  const command = new PlayCommand(ttsService, currentDocument);

  // 2. Execute command (updates state)
  commandHistory.execute(command);

  // 3. State change triggers re-render via subscription
  // UI components re-render based on new isPlaying state
}
```

### 2. Async Data Loading Pattern

```typescript
interface AsyncState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

function useAsync<T>(asyncFn: () => Promise<T>, deps: any[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState(prev => ({ ...prev, status: 'loading' }));

    asyncFn()
      .then(data => {
        if (!cancelled) {
          setState({ status: 'success', data, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ status: 'error', data: null, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}

// Usage
function DocumentView({ url }: { url: string }) {
  const doc = useAsync(() => loadDocument(url), [url]);

  if (doc.status === 'loading') return <Spinner />;
  if (doc.status === 'error') return <Error message={doc.error.message} />;
  if (!doc.data) return null;

  return <DocumentReader document={doc.data} />;
}
```

### 3. Streaming Audio Pattern

```typescript
class AudioStreamPlayer {
  private audioContext: AudioContext;
  private scheduledTime: number = 0;
  private bufferAhead: number = 0.5; // seconds

  async playStream(stream: AsyncGenerator<AudioChunk>): Promise<void> {
    this.audioContext = new AudioContext();
    this.scheduledTime = this.audioContext.currentTime;

    const playPromise = this.scheduleChunks(stream);
    const completionPromise = this.waitForCompletion();

    await Promise.all([playPromise, completionPromise]);
  }

  private async scheduleChunks(stream: AsyncGenerator<AudioChunk>): Promise<void> {
    for await (const chunk of stream) {
      await this.scheduleChunk(chunk);
      await this.throttleIfNeeded();
    }
  }

  private async scheduleChunk(chunk: AudioChunk): Promise<void> {
    const buffer = await this.decodeChunk(chunk);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const startTime = Math.max(
      this.scheduledTime,
      this.audioContext.currentTime + 0.05
    );
    source.start(startTime);
    this.scheduledTime = startTime + buffer.duration;
  }

  private async throttleIfNeeded(): Promise<void> {
    const buffered = this.scheduledTime - this.audioContext.currentTime;
    if (buffered > this.bufferAhead * 2) {
      await this.sleep((buffered - this.bufferAhead) * 1000);
    }
  }
}
```

---

## Error Handling Patterns

### 1. Error Boundary Pattern (React)

```typescript
class TTSErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('tts.boundary', 'TTS error caught', {
      error: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Usage
<TTSErrorBoundary fallback={<TTSUnavailableMessage />}>
  <FloatingPlayer />
</TTSErrorBoundary>
```

### 2. Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await sleep(delay);

      logger.log('retry', `Retrying (attempt ${attempt + 1})`, {
        error: lastError.message,
        delay,
      });
    }
  }

  throw lastError!;
}

// Usage
const audio = await withRetry(
  () => ttsEngine.synthesize(text),
  {
    maxRetries: 3,
    shouldRetry: (error) => error instanceof NetworkError,
  }
);
```

### 3. Graceful Degradation

```typescript
class TTSService {
  private engines: TTSEngine[];

  async synthesize(text: string, options: TTSOptions): Promise<AudioBuffer> {
    const errors: Error[] = [];

    for (const engine of this.engines) {
      try {
        if (!engine.isAvailable()) continue;

        logger.log('tts', `Trying engine: ${engine.name}`);
        return await engine.synthesize(text, options);
      } catch (error) {
        errors.push(error as Error);
        logger.warn('tts', `Engine ${engine.name} failed`, { error });
        // Continue to next engine
      }
    }

    // All engines failed
    throw new AggregateError(
      errors,
      'All TTS engines failed. Please try again later.'
    );
  }
}
```

---

## Performance Patterns

### 1. Lazy Loading

```typescript
// Lazy load the TTS model only when needed
let ttsEnginePromise: Promise<TTSEngine> | null = null;

function getTTSEngine(): Promise<TTSEngine> {
  if (!ttsEnginePromise) {
    ttsEnginePromise = import('./tts-engine')
      .then(module => module.createEngine());
  }
  return ttsEnginePromise;
}

// Usage - model only loads on first synthesis
async function synthesize(text: string) {
  const engine = await getTTSEngine();
  return engine.synthesize(text);
}
```

### 2. Debouncing User Input

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage - don't update speed on every slider move
function SpeedSlider() {
  const [localSpeed, setLocalSpeed] = useState(1.0);
  const debouncedSpeed = useDebounce(localSpeed, 100);

  useEffect(() => {
    ttsService.setSpeed(debouncedSpeed);
  }, [debouncedSpeed]);

  return <Slider value={localSpeed} onChange={setLocalSpeed} />;
}
```

### 3. Caching

```typescript
class ModelCache {
  private cache = new Map<string, ArrayBuffer>();
  private maxSize = 500 * 1024 * 1024; // 500MB
  private currentSize = 0;

  async get(key: string): Promise<ArrayBuffer | null> {
    const cached = this.cache.get(key);
    if (cached) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }
    return null;
  }

  async set(key: string, value: ArrayBuffer): Promise<void> {
    // Evict if needed
    while (this.currentSize + value.byteLength > this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (!oldest) break;
      this.evict(oldest);
    }

    this.cache.set(key, value);
    this.currentSize += value.byteLength;
  }

  private evict(key: string): void {
    const value = this.cache.get(key);
    if (value) {
      this.currentSize -= value.byteLength;
      this.cache.delete(key);
    }
  }
}
```

---

## Testing Patterns

### 1. Dependency Injection for Testability

```typescript
// Production
class TTSService {
  constructor(
    private engine: TTSEngine = new KokoroEngine(),
    private player: AudioPlayer = new WebAudioPlayer()
  ) {}
}

// Test
describe('TTSService', () => {
  it('plays synthesized audio', async () => {
    const mockEngine = {
      synthesize: jest.fn().mockResolvedValue(mockAudioBuffer),
    };
    const mockPlayer = {
      play: jest.fn().mockResolvedValue(undefined),
    };

    const service = new TTSService(mockEngine as any, mockPlayer as any);
    await service.speak('Hello');

    expect(mockEngine.synthesize).toHaveBeenCalledWith('Hello', expect.anything());
    expect(mockPlayer.play).toHaveBeenCalled();
  });
});
```

### 2. Test Fixtures

```typescript
// fixtures/voices.ts
export const mockVoices: Voice[] = [
  { id: 'test-voice-1', name: 'Test Voice 1', language: 'en', gender: 'female' },
  { id: 'test-voice-2', name: 'Test Voice 2', language: 'en', gender: 'male' },
];

// fixtures/audio.ts
export function createMockAudioBuffer(durationMs: number = 1000): AudioChunk {
  const sampleRate = 24000;
  const samples = new Float32Array(Math.floor(sampleRate * durationMs / 1000));
  // Fill with silence
  return { samples, sampleRate, sentenceIndex: 0, isFinal: true };
}
```

---

**Document Version:** 1.0.0
**Created:** January 25, 2026
