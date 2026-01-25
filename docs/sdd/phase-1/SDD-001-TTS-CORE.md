# SDD-001: Core TTS Engine

**Feature:** Kokoro-82M TTS Core Engine
**Phase:** 1A
**Priority:** P0
**Status:** Draft

---

## Overview

Implement the core text-to-speech engine using Kokoro-82M as the primary model with Piper TTS as a fallback. This engine will be the foundation for all platforms.

## Goals

1. Achieve < 500ms latency to first audio on modern hardware
2. Support real-time audio streaming for long documents
3. Enable speed control (0.5x - 4x) without quality degradation
4. Provide accurate sentence boundary detection for text highlighting

## Technical Specification

### Model Selection

| Model | Size | Quality | Use Case |
|-------|------|---------|----------|
| Kokoro-82M | ~82MB (ONNX) | #1 TTS Arena | Primary engine |
| Kokoro-82M-Q4 | ~25MB (quantized) | High | Mobile/browser |
| Piper TTS | ~50MB/voice | High | Fallback, 30+ languages |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TTS Core Engine                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Text Input   │───▶│ Preprocessor │───▶│ Sentence Splitter│  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│                                                    │            │
│                                                    ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Audio Output │◀───│ Audio Buffer │◀───│ Model Inference  │  │
│  │ (Streaming)  │    │  (Ring)      │    │ (Kokoro/Piper)   │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Interfaces

```typescript
// TypeScript interface for kokoro-js integration
interface TTSEngine {
  // Initialize with model configuration
  initialize(config: TTSConfig): Promise<void>;

  // Synthesize text to audio stream
  synthesize(text: string, options?: SynthesisOptions): AsyncGenerator<AudioChunk>;

  // Get available voices
  getVoices(): Voice[];

  // Get current voice
  getCurrentVoice(): Voice;

  // Set active voice
  setVoice(voiceId: string): void;

  // Cleanup resources
  dispose(): void;
}

interface TTSConfig {
  modelPath: string;        // Path to ONNX model
  backend: 'webgpu' | 'wasm' | 'onnx-native';
  voiceId?: string;         // Default voice
  sampleRate?: number;      // Default: 24000
}

interface SynthesisOptions {
  speed?: number;           // 0.5 - 4.0, default 1.0
  pitch?: number;           // 0.5 - 2.0, default 1.0
  onSentenceStart?: (index: number, text: string) => void;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;     // Cancellation support
}

interface AudioChunk {
  samples: Float32Array;    // PCM audio samples
  sampleRate: number;
  sentenceIndex: number;    // Which sentence this belongs to
  isFinal: boolean;         // Last chunk?
}

interface Voice {
  id: string;
  name: string;
  language: string;         // ISO 639-1
  gender: 'male' | 'female' | 'neutral';
  style?: string;           // e.g., 'narrative', 'conversational'
  sampleAudioUrl?: string;
}
```

### Sentence Boundary Detection

Use a combination of regex and heuristics for reliable sentence splitting:

```typescript
class SentenceSplitter {
  private abbreviations = new Set([
    'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Sr.', 'Jr.',
    'vs.', 'etc.', 'e.g.', 'i.e.', 'Inc.', 'Ltd.', 'Co.'
  ]);

  split(text: string): Sentence[] {
    const sentences: Sentence[] = [];
    let start = 0;

    // Regex for sentence boundaries
    const pattern = /[.!?]+[\s]+(?=[A-Z])|[.!?]+$/g;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Check if this is an abbreviation
      const beforePunctuation = text.slice(Math.max(0, match.index - 10), match.index + 1);
      const isAbbreviation = Array.from(this.abbreviations).some(
        abbr => beforePunctuation.endsWith(abbr)
      );

      if (!isAbbreviation) {
        sentences.push({
          text: text.slice(start, match.index + match[0].trimEnd().length),
          startOffset: start,
          endOffset: match.index + match[0].trimEnd().length
        });
        start = match.index + match[0].length;
      }
    }

    // Add remaining text as final sentence
    if (start < text.length) {
      sentences.push({
        text: text.slice(start),
        startOffset: start,
        endOffset: text.length
      });
    }

    return sentences;
  }
}

interface Sentence {
  text: string;
  startOffset: number;
  endOffset: number;
}
```

### Speed Control Implementation

Speed adjustment using time-stretching (WSOLA algorithm):

```typescript
class SpeedController {
  private targetSpeed: number = 1.0;

  setSpeed(speed: number): void {
    // Clamp to valid range
    this.targetSpeed = Math.max(0.5, Math.min(4.0, speed));
  }

  processAudio(input: Float32Array, sampleRate: number): Float32Array {
    if (Math.abs(this.targetSpeed - 1.0) < 0.01) {
      return input; // No processing needed
    }

    // Use WSOLA for quality time-stretching
    return this.wsola(input, sampleRate, this.targetSpeed);
  }

  private wsola(
    input: Float32Array,
    sampleRate: number,
    rate: number
  ): Float32Array {
    // Window size for overlap-add
    const windowSize = Math.floor(sampleRate * 0.025); // 25ms
    const hopSize = Math.floor(windowSize / 4);
    const searchRadius = Math.floor(windowSize / 2);

    // Output length
    const outputLength = Math.floor(input.length / rate);
    const output = new Float32Array(outputLength);

    // WSOLA algorithm implementation
    let inputPos = 0;
    let outputPos = 0;

    while (outputPos < outputLength - windowSize) {
      // Find best overlap position
      const bestOffset = this.findBestOverlap(
        input, inputPos, output, outputPos, windowSize, searchRadius
      );

      // Overlap-add
      for (let i = 0; i < windowSize; i++) {
        const inputIdx = inputPos + bestOffset + i;
        if (inputIdx >= 0 && inputIdx < input.length) {
          const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / windowSize));
          output[outputPos + i] += input[inputIdx] * window;
        }
      }

      inputPos += Math.floor(hopSize * rate);
      outputPos += hopSize;
    }

    return output;
  }

  private findBestOverlap(
    input: Float32Array,
    inputPos: number,
    output: Float32Array,
    outputPos: number,
    windowSize: number,
    searchRadius: number
  ): number {
    let bestOffset = 0;
    let bestCorrelation = -Infinity;

    for (let offset = -searchRadius; offset <= searchRadius; offset++) {
      let correlation = 0;
      for (let i = 0; i < windowSize; i++) {
        const inputIdx = inputPos + offset + i;
        if (inputIdx >= 0 && inputIdx < input.length && outputPos + i < output.length) {
          correlation += input[inputIdx] * output[outputPos + i];
        }
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }

    return bestOffset;
  }
}
```

### Audio Streaming Pipeline

```typescript
class AudioStreamingPipeline {
  private audioContext: AudioContext;
  private scheduledTime: number = 0;
  private bufferDuration: number = 0.1; // 100ms buffer

  async playStream(audioStream: AsyncGenerator<AudioChunk>): Promise<void> {
    this.audioContext = new AudioContext();
    this.scheduledTime = this.audioContext.currentTime;

    for await (const chunk of audioStream) {
      await this.scheduleChunk(chunk);
    }
  }

  private async scheduleChunk(chunk: AudioChunk): Promise<void> {
    const buffer = this.audioContext.createBuffer(
      1, // mono
      chunk.samples.length,
      chunk.sampleRate
    );
    buffer.getChannelData(0).set(chunk.samples);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    // Schedule playback
    const startTime = Math.max(
      this.scheduledTime,
      this.audioContext.currentTime + this.bufferDuration
    );
    source.start(startTime);

    this.scheduledTime = startTime + buffer.duration;

    // Wait if we're getting too far ahead
    const bufferedAhead = this.scheduledTime - this.audioContext.currentTime;
    if (bufferedAhead > 1.0) {
      await this.sleep((bufferedAhead - 0.5) * 1000);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Platform-Specific Implementations

### Browser (kokoro-js)

```typescript
import { KokoroTTS } from 'kokoro-js';

class BrowserTTSEngine implements TTSEngine {
  private kokoro: KokoroTTS | null = null;

  async initialize(config: TTSConfig): Promise<void> {
    this.kokoro = await KokoroTTS.from_pretrained(
      'onnx-community/Kokoro-82M-ONNX',
      {
        dtype: 'fp16',          // Use FP16 for WebGPU
        device: config.backend === 'webgpu' ? 'webgpu' : 'wasm'
      }
    );
  }

  async *synthesize(
    text: string,
    options?: SynthesisOptions
  ): AsyncGenerator<AudioChunk> {
    const splitter = new SentenceSplitter();
    const sentences = splitter.split(text);

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];

      options?.onSentenceStart?.(i, sentence.text);

      const audio = await this.kokoro!.generate(sentence.text, {
        voice: this.currentVoice.id,
        speed: options?.speed ?? 1.0
      });

      yield {
        samples: audio.audio,
        sampleRate: audio.sampling_rate,
        sentenceIndex: i,
        isFinal: i === sentences.length - 1
      };

      options?.onProgress?.((i + 1) / sentences.length * 100);
    }
  }
}
```

### macOS (Python Server)

```python
# tts-server/server.py
import asyncio
from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
import onnxruntime as ort
import numpy as np

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "af_heart"
    speed: float = 1.0

class KokoroEngine:
    def __init__(self, model_path: str):
        # Use CoreML execution provider on macOS
        providers = ['CoreMLExecutionProvider', 'CPUExecutionProvider']
        self.session = ort.InferenceSession(model_path, providers=providers)

    async def synthesize(self, text: str, voice_id: str, speed: float):
        # Tokenize text
        tokens = self.tokenize(text)

        # Run inference
        outputs = self.session.run(
            ['audio'],
            {
                'input_ids': tokens,
                'voice_id': np.array([voice_id]),
                'speed': np.array([speed], dtype=np.float32)
            }
        )

        return outputs[0]

engine = KokoroEngine("models/kokoro-82m.onnx")

@app.websocket("/ws/synthesize")
async def websocket_synthesize(websocket: WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_json()
        request = TTSRequest(**data)

        # Stream audio chunks
        async for chunk in engine.synthesize_stream(
            request.text,
            request.voice_id,
            request.speed
        ):
            await websocket.send_bytes(chunk.tobytes())

        # Send end marker
        await websocket.send_json({"status": "complete"})
```

## Acceptance Criteria

### Functional
- [ ] Kokoro-82M model loads successfully
- [ ] Text converts to audio stream
- [ ] Speed control works from 0.5x to 4x
- [ ] Sentence boundaries detected accurately (>95%)
- [ ] Piper fallback activates when Kokoro fails

### Performance
- [ ] First audio < 500ms on M1 Mac
- [ ] First audio < 1s in browser (WebGPU)
- [ ] Memory usage < 500MB (desktop)
- [ ] Memory usage < 300MB (browser)

### Quality
- [ ] Audio quality indistinguishable from Speechify in blind test
- [ ] No audio artifacts at 2x speed
- [ ] Consistent voice across sentence boundaries

## Test Plan

### Unit Tests
```typescript
describe('SentenceSplitter', () => {
  it('splits simple sentences', () => {
    const splitter = new SentenceSplitter();
    const result = splitter.split('Hello world. How are you?');
    expect(result).toHaveLength(2);
  });

  it('handles abbreviations', () => {
    const splitter = new SentenceSplitter();
    const result = splitter.split('Dr. Smith is here. Please wait.');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Dr. Smith is here.');
  });
});

describe('SpeedController', () => {
  it('returns unchanged audio at 1x', () => {
    const controller = new SpeedController();
    controller.setSpeed(1.0);
    const input = new Float32Array(1000).fill(0.5);
    const output = controller.processAudio(input, 24000);
    expect(output.length).toBe(input.length);
  });

  it('shortens audio at 2x', () => {
    const controller = new SpeedController();
    controller.setSpeed(2.0);
    const input = new Float32Array(1000).fill(0.5);
    const output = controller.processAudio(input, 24000);
    expect(output.length).toBeLessThan(input.length);
  });
});
```

### Integration Tests
```typescript
describe('TTSEngine', () => {
  it('synthesizes text end-to-end', async () => {
    const engine = new BrowserTTSEngine();
    await engine.initialize({
      modelPath: 'test-model.onnx',
      backend: 'wasm'
    });

    const chunks: AudioChunk[] = [];
    for await (const chunk of engine.synthesize('Hello world')) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[chunks.length - 1].isFinal).toBe(true);
  });
});
```

## Dependencies

- kokoro-js: ^1.0.0 (browser)
- onnxruntime-web: ^1.17.0 (browser)
- onnxruntime: ^1.17.0 (Python)
- @anthropic-ai/tokenizer: ^0.1.0 (sentence splitting)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| WebGPU not available | WASM fallback, desktop relay |
| Model too large for mobile | Use quantized Q4 variant |
| Memory pressure in browser | Aggressive chunk cleanup |
| Pronunciation errors | Custom dictionary, user feedback |

---

**Author:** ReadForge Team
**Created:** January 25, 2026
**Last Updated:** January 25, 2026
