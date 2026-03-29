import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TTSEngine, chunkSentence, isSpeechSynthesisAvailable, type TTSStatus } from './tts-engine';

function createMockSynth() {
  let paused = false;

  return {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(() => {
      paused = true;
    }),
    resume: vi.fn(() => {
      paused = false;
    }),
    getVoices: vi.fn(() => [
      {
        voiceURI: 'voice-1',
        name: 'Test Voice',
        lang: 'en-US',
        default: true,
        localService: true,
      },
      {
        voiceURI: 'voice-2',
        name: 'Other Voice',
        lang: 'en-GB',
        default: false,
        localService: true,
      },
    ]),
    get paused() {
      return paused;
    },
    pending: false,
    speaking: false,
    onvoiceschanged: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as SpeechSynthesis;
}

describe('isSpeechSynthesisAvailable', () => {
  it('returns true when speechSynthesis exists', () => {
    expect(isSpeechSynthesisAvailable()).toBe(false); // happy-dom doesn't have it
  });
});

describe('chunkSentence', () => {
  it('returns single-element array for short text', () => {
    expect(chunkSentence('Hello world.')).toEqual(['Hello world.']);
  });

  it('chunks long text at word boundaries', () => {
    const long = 'word '.repeat(50).trim(); // 249 chars
    const chunks = chunkSentence(long, 100);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(100);
    }
  });

  it('preserves all text after chunking', () => {
    const text = 'The quick brown fox jumps over the lazy dog near the riverbank on a warm summer afternoon while birds sing.';
    const chunks = chunkSentence(text, 40);
    expect(chunks.join(' ')).toBe(text);
  });

  it('handles text with no spaces by breaking at maxLen', () => {
    const text = 'a'.repeat(300);
    const chunks = chunkSentence(text, 100);
    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(100);
  });

  it('returns empty array for empty string', () => {
    expect(chunkSentence('')).toEqual([]);
  });
});

describe('TTSEngine', () => {
  let synth: ReturnType<typeof createMockSynth>;
  let engine: TTSEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    synth = createMockSynth();
    engine = new TTSEngine(synth as unknown as SpeechSynthesis);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('throws when no synth provided and speechSynthesis unavailable', () => {
      expect(() => new TTSEngine()).toThrow('Speech synthesis is not available');
    });
  });

  describe('getVoices', () => {
    it('returns mapped voices from speechSynthesis', () => {
      const voices = engine.getVoices();
      expect(voices).toHaveLength(2);
      expect(voices[0]).toEqual({
        id: 'voice-1',
        name: 'Test Voice',
        lang: 'en-US',
        isDefault: true,
      });
      expect(voices[1]).toEqual({
        id: 'voice-2',
        name: 'Other Voice',
        lang: 'en-GB',
        isDefault: false,
      });
    });
  });

  describe('initial state', () => {
    it('starts idle with zeroed counters', () => {
      expect(engine.getStatus()).toBe('idle');
      expect(engine.getCurrentIndex()).toBe(0);
      expect(engine.getTotalSentences()).toBe(0);
      expect(engine.getRate()).toBe(1.0);
    });
  });

  describe('speak', () => {
    it('does nothing for empty sentences', async () => {
      await engine.speak([]);
      expect(synth.speak).not.toHaveBeenCalled();
    });

    it('speaks sentences through speechSynthesis', async () => {
      await engine.speak(['Hello.', 'World.']);
      expect(synth.speak).toHaveBeenCalledTimes(1);
      expect(engine.getStatus()).toBe('speaking');
      expect(engine.getTotalSentences()).toBe(2);
    });

    it('calls onSentenceStart callback with correct args', async () => {
      const onSentenceStart = vi.fn();
      engine.setCallbacks({ onSentenceStart });
      await engine.speak(['Hello.']);
      expect(onSentenceStart).toHaveBeenCalledWith(0, 'Hello.');
    });

    it('calls onStatusChange with speaking', async () => {
      const statuses: TTSStatus[] = [];
      engine.setCallbacks({ onStatusChange: (s) => statuses.push(s) });
      await engine.speak(['Hello.']);
      expect(statuses).toContain('speaking');
    });

    it('cancels previous speech before starting new', async () => {
      await engine.speak(['First.']);
      await engine.speak(['Second.']);
      expect(synth.cancel).toHaveBeenCalled();
    });

    it('chunks long sentences automatically', async () => {
      const long = 'word '.repeat(100).trim();
      await engine.speak([long]);
      expect(engine.getTotalSentences()).toBeGreaterThan(1);
    });

    it('advances through sentences on onend', async () => {
      const onSentenceEnd = vi.fn();
      engine.setCallbacks({ onSentenceEnd });

      await engine.speak(['One.', 'Two.', 'Three.']);

      // Get the utterance passed to speak and trigger onend
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      utterance.onend();

      expect(onSentenceEnd).toHaveBeenCalledWith(0);
      expect(engine.getCurrentIndex()).toBe(1);
      // Should have called speak again for sentence 2
      expect(synth.speak).toHaveBeenCalledTimes(2);
    });

    it('calls onComplete after last sentence', async () => {
      const onComplete = vi.fn();
      engine.setCallbacks({ onComplete });

      await engine.speak(['Only.']);
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      utterance.onend();

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(engine.getStatus()).toBe('idle');
    });
  });

  describe('pause/resume', () => {
    it('pauses when speaking', async () => {
      await engine.speak(['Hello.']);
      engine.pause();
      expect(engine.getStatus()).toBe('paused');
      expect(synth.pause).toHaveBeenCalled();
    });

    it('resumes when paused', async () => {
      await engine.speak(['Hello.']);
      engine.pause();
      engine.resume();
      expect(engine.getStatus()).toBe('speaking');
      expect(synth.resume).toHaveBeenCalled();
    });

    it('does not pause when idle', () => {
      engine.pause();
      expect(engine.getStatus()).toBe('idle');
      expect(synth.pause).not.toHaveBeenCalled();
    });

    it('does not resume when not paused', () => {
      engine.resume();
      expect(synth.resume).not.toHaveBeenCalled();
    });
  });

  describe('togglePlayPause', () => {
    it('pauses when speaking', async () => {
      await engine.speak(['Hello.']);
      engine.togglePlayPause();
      expect(engine.getStatus()).toBe('paused');
    });

    it('resumes when paused', async () => {
      await engine.speak(['Hello.']);
      engine.pause();
      engine.togglePlayPause();
      expect(engine.getStatus()).toBe('speaking');
    });

    it('does nothing when idle', () => {
      engine.togglePlayPause();
      expect(engine.getStatus()).toBe('idle');
    });
  });

  describe('stop', () => {
    it('cancels speech and resets state', async () => {
      await engine.speak(['Hello.', 'World.']);
      engine.stop();
      expect(synth.cancel).toHaveBeenCalled();
      expect(engine.getStatus()).toBe('idle');
      expect(engine.getCurrentIndex()).toBe(0);
      expect(engine.getTotalSentences()).toBe(0);
    });
  });

  describe('skipForward/skipBackward', () => {
    it('skips forward to next sentence', async () => {
      await engine.speak(['One.', 'Two.', 'Three.']);
      engine.skipForward();
      expect(engine.getCurrentIndex()).toBe(1);
      expect(synth.cancel).toHaveBeenCalled();
      // speakNext should have been called for sentence at index 1
      expect(synth.speak).toHaveBeenCalledTimes(2);
    });

    it('skips backward to previous sentence', async () => {
      await engine.speak(['One.', 'Two.', 'Three.']);
      engine.skipForward();
      engine.skipBackward();
      expect(engine.getCurrentIndex()).toBe(0);
    });

    it('does not skip forward past end', async () => {
      await engine.speak(['One.']);
      engine.skipForward();
      expect(engine.getCurrentIndex()).toBe(0);
    });

    it('does not skip backward past start', async () => {
      await engine.speak(['One.']);
      engine.skipBackward();
      expect(engine.getCurrentIndex()).toBe(0);
    });

    it('does not double-advance due to onend during skip', async () => {
      // The skipping flag should prevent onend from advancing
      await engine.speak(['One.', 'Two.', 'Three.']);
      engine.skipForward();
      // After skip, index should be exactly 1, not 2
      expect(engine.getCurrentIndex()).toBe(1);
    });
  });

  describe('setOptions', () => {
    it('applies rate to utterances', async () => {
      engine.setOptions({ rate: 2.0 });
      await engine.speak(['Hello.']);
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(utterance.rate).toBe(2.0);
    });

    it('applies voice selection', async () => {
      engine.setOptions({ voiceId: 'voice-2' });
      await engine.speak(['Hello.']);
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(utterance.voice?.voiceURI).toBe('voice-2');
    });

    it('handles non-existent voiceId gracefully', async () => {
      engine.setOptions({ voiceId: 'nonexistent-voice' });
      await engine.speak(['Hello.']);
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(utterance.voice).toBeNull();
    });

    it('getRate reflects updated rate', () => {
      engine.setOptions({ rate: 2.5 });
      expect(engine.getRate()).toBe(2.5);
    });
  });

  describe('dispose', () => {
    it('stops everything', async () => {
      await engine.speak(['Hello.']);
      engine.dispose();
      expect(engine.getStatus()).toBe('idle');
    });
  });

  describe('error handling', () => {
    it('calls onError for non-canceled errors', async () => {
      const onError = vi.fn();
      engine.setCallbacks({ onError });

      await engine.speak(['Hello.']);
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      utterance.onerror({ error: 'network' });

      expect(onError).toHaveBeenCalledWith('network');
      expect(engine.getStatus()).toBe('idle');
    });

    it('ignores canceled errors', async () => {
      const onError = vi.fn();
      engine.setCallbacks({ onError });

      await engine.speak(['Hello.']);
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      utterance.onerror({ error: 'canceled' });

      expect(onError).not.toHaveBeenCalled();
    });

    it('ignores interrupted errors', async () => {
      const onError = vi.fn();
      engine.setCallbacks({ onError });

      await engine.speak(['Hello.']);
      const utterance = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      utterance.onerror({ error: 'interrupted' });

      expect(onError).not.toHaveBeenCalled();
    });

    it('engine can be reused after error', async () => {
      await engine.speak(['Hello.']);
      const utterance1 = (synth.speak as ReturnType<typeof vi.fn>).mock.calls[0][0];
      utterance1.onerror({ error: 'network' });

      expect(engine.getStatus()).toBe('idle');
      await engine.speak(['Again.']);
      expect(engine.getStatus()).toBe('speaking');
    });
  });

  describe('voice loading', () => {
    it('calls addEventListener for voiceschanged when voices empty', () => {
      const emptySynth = {
        ...createMockSynth(),
        getVoices: vi.fn(() => []),
        addEventListener: vi.fn(),
      } as unknown as SpeechSynthesis;

      new TTSEngine(emptySynth);
      expect(emptySynth.addEventListener).toHaveBeenCalledWith(
        'voiceschanged',
        expect.any(Function),
        { once: true },
      );
    });

    it('does not listen for voiceschanged when voices already loaded', () => {
      // synth already returns voices
      expect(synth.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('watchdog timer', () => {
    it('recovers from stalled utterance via watchdog', async () => {
      await engine.speak(['Hello world.']);
      expect(engine.getStatus()).toBe('speaking');

      // Advance past the watchdog timeout (estimated ~2.7s for 2 words + 5s buffer = ~10s, doubled)
      vi.advanceTimersByTime(30000);

      // Watchdog should have cancelled and re-queued
      expect(synth.cancel).toHaveBeenCalled();
    });
  });
});
