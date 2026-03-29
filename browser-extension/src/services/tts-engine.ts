/**
 * TTS engine using the Web Speech API (speechSynthesis).
 * Includes a watchdog timer to work around Chrome's ~15-second utterance timeout.
 * Designed for easy future replacement with kokoro-js for premium voices.
 */

export interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  isDefault: boolean;
}

export type TTSStatus = 'idle' | 'loading' | 'speaking' | 'paused';

export interface TTSCallbacks {
  onSentenceStart?: (index: number, text: string) => void;
  onSentenceEnd?: (index: number) => void;
  onStatusChange?: (status: TTSStatus) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export interface TTSOptions {
  voiceId?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const DEFAULT_OPTIONS: Required<TTSOptions> = {
  voiceId: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

// Chrome kills utterances after ~15s. We chunk to stay under that limit.
const MAX_UTTERANCE_LENGTH = 200;

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function chunkSentence(text: string, maxLen = MAX_UTTERANCE_LENGTH): string[] {
  if (!text) return [];
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Try to break at a natural boundary
    let breakIdx = remaining.lastIndexOf(' ', maxLen);
    if (breakIdx <= 0) breakIdx = remaining.lastIndexOf(',', maxLen);
    if (breakIdx <= 0) breakIdx = maxLen;

    chunks.push(remaining.slice(0, breakIdx).trim());
    remaining = remaining.slice(breakIdx).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export class TTSEngine {
  private synth: SpeechSynthesis;
  private sentences: string[] = [];
  private currentIndex = 0;
  private status: TTSStatus = 'idle';
  private callbacks: TTSCallbacks = {};
  private options: Required<TTSOptions>;
  private skipping = false;
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(synth?: SpeechSynthesis) {
    if (!synth && !isSpeechSynthesisAvailable()) {
      throw new Error('Speech synthesis is not available in this environment');
    }
    this.synth = synth ?? window.speechSynthesis;
    this.options = { ...DEFAULT_OPTIONS };
    this.initVoices();
  }

  private initVoices(): void {
    if (this.synth.getVoices().length > 0) return;
    // Chrome loads voices async; listen for the voiceschanged event
    this.synth.addEventListener?.('voiceschanged', () => {}, { once: true });
  }

  getVoices(): TTSVoice[] {
    return this.synth.getVoices().map((v) => ({
      id: v.voiceURI,
      name: v.name,
      lang: v.lang,
      isDefault: v.default,
    }));
  }

  getStatus(): TTSStatus {
    return this.status;
  }

  getRate(): number {
    return this.options.rate;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalSentences(): number {
    return this.sentences.length;
  }

  setOptions(opts: TTSOptions): void {
    this.options = { ...this.options, ...opts };
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  private setStatus(status: TTSStatus): void {
    this.status = status;
    this.callbacks.onStatusChange?.(status);
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private startWatchdog(expectedDurationMs: number): void {
    this.clearWatchdog();
    // Give 2x expected time + 5s buffer
    const timeout = expectedDurationMs * 2 + 5000;
    this.watchdogTimer = setTimeout(() => {
      if (this.status === 'speaking') {
        // Chrome silently killed the utterance; re-queue current sentence
        this.synth.cancel();
        this.speakNext();
      }
    }, timeout);
  }

  async speak(sentences: string[]): Promise<void> {
    if (!sentences.length) return;

    this.stop();

    // Chunk long sentences to avoid Chrome's 15s timeout
    const chunked: string[] = [];
    for (const s of sentences) {
      chunked.push(...chunkSentence(s));
    }

    this.sentences = chunked;
    this.currentIndex = 0;

    this.setStatus('speaking');
    this.speakNext();
  }

  private speakNext(): void {
    if (this.currentIndex >= this.sentences.length) {
      this.clearWatchdog();
      this.setStatus('idle');
      this.callbacks.onComplete?.();
      return;
    }

    const text = this.sentences[this.currentIndex];
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = this.options.rate;
    utterance.pitch = this.options.pitch;
    utterance.volume = this.options.volume;

    if (this.options.voiceId) {
      const voice = this.synth.getVoices().find((v) => v.voiceURI === this.options.voiceId);
      if (voice) utterance.voice = voice;
    }

    this.callbacks.onSentenceStart?.(this.currentIndex, text);

    // Estimate duration: ~150 words/min at rate 1.0
    const wordCount = text.split(/\s+/).length;
    const estimatedMs = (wordCount / (150 * this.options.rate)) * 60 * 1000;
    this.startWatchdog(estimatedMs);

    utterance.onend = () => {
      if (this.skipping) return;
      this.clearWatchdog();
      this.callbacks.onSentenceEnd?.(this.currentIndex);
      this.currentIndex++;
      this.speakNext();
    };

    utterance.onerror = (event) => {
      this.clearWatchdog();
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      this.callbacks.onError?.(event.error);
      this.setStatus('idle');
    };

    this.synth.speak(utterance);
  }

  pause(): void {
    if (this.status === 'speaking') {
      this.clearWatchdog();
      this.synth.pause();
      this.setStatus('paused');
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.synth.resume();
      this.setStatus('speaking');
      // Restart watchdog since Chrome's 15s timeout still applies after resume
      this.startWatchdog(15000);
    }
  }

  togglePlayPause(): void {
    if (this.status === 'speaking') {
      this.pause();
    } else if (this.status === 'paused') {
      this.resume();
    }
  }

  stop(): void {
    this.clearWatchdog();
    this.skipping = true;
    this.synth.cancel();
    this.skipping = false;
    this.sentences = [];
    this.currentIndex = 0;
    this.setStatus('idle');
  }

  skipForward(): void {
    if (this.currentIndex < this.sentences.length - 1) {
      this.clearWatchdog();
      this.skipping = true;
      this.synth.cancel();
      this.skipping = false;
      this.currentIndex++;
      this.speakNext();
    }
  }

  skipBackward(): void {
    if (this.currentIndex > 0) {
      this.clearWatchdog();
      this.skipping = true;
      this.synth.cancel();
      this.skipping = false;
      this.currentIndex--;
      this.speakNext();
    }
  }

  dispose(): void {
    this.stop();
  }
}
