import { describe, it, expect } from 'vitest';
import {
  loadSettings,
  saveSettings,
  resetSettings,
  saveReadingPosition,
  getReadingPosition,
  DEFAULT_SETTINGS,
  type ReadingHistoryEntry,
} from './storage';

describe('Settings', () => {
  describe('loadSettings', () => {
    it('returns defaults when no settings stored', async () => {
      const settings = await loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('returns stored settings merged with defaults', async () => {
      await chrome.storage.local.set({ settings: { rate: 2.0 } });
      const settings = await loadSettings();
      expect(settings.rate).toBe(2.0);
      expect(settings.volume).toBe(DEFAULT_SETTINGS.volume);
    });

    it('handles corrupted data gracefully', async () => {
      await chrome.storage.local.set({ settings: 'not-an-object' });
      const settings = await loadSettings();
      // Spread of string over object merges character indices; defaults still present
      expect(typeof settings.rate).toBe('number');
    });
  });

  describe('saveSettings', () => {
    it('merges partial settings with current', async () => {
      const result = await saveSettings({ rate: 1.5 });
      expect(result.rate).toBe(1.5);
      expect(result.volume).toBe(DEFAULT_SETTINGS.volume);
    });

    it('persists to storage', async () => {
      await saveSettings({ rate: 2.0, pitch: 0.8 });
      const loaded = await loadSettings();
      expect(loaded.rate).toBe(2.0);
      expect(loaded.pitch).toBe(0.8);
    });

    it('returns full settings object', async () => {
      const result = await saveSettings({ voiceId: 'test-voice' });
      expect(result).toHaveProperty('rate');
      expect(result).toHaveProperty('pitch');
      expect(result).toHaveProperty('volume');
      expect(result.voiceId).toBe('test-voice');
    });

    it('handles empty update without changes', async () => {
      await saveSettings({ rate: 1.5 });
      const result = await saveSettings({});
      expect(result.rate).toBe(1.5);
    });
  });

  describe('resetSettings', () => {
    it('resets to defaults', async () => {
      await saveSettings({ rate: 3.0, volume: 0.5 });
      const result = await resetSettings();
      expect(result).toEqual(DEFAULT_SETTINGS);
    });

    it('persists reset', async () => {
      await saveSettings({ rate: 3.0 });
      await resetSettings();
      const loaded = await loadSettings();
      expect(loaded).toEqual(DEFAULT_SETTINGS);
    });
  });
});

describe('Reading History', () => {
  const entry: ReadingHistoryEntry = {
    url: 'https://example.com/article',
    title: 'Test Article',
    lastPosition: 5,
    totalSentences: 20,
    lastRead: Date.now(),
  };

  describe('saveReadingPosition', () => {
    it('saves a reading position', async () => {
      await saveReadingPosition(entry);
      const result = await getReadingPosition(entry.url);
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Test Article');
    });

    it('overwrites existing entry for same URL', async () => {
      await saveReadingPosition(entry);
      const updated = { ...entry, lastPosition: 10 };
      await saveReadingPosition(updated);
      const result = await getReadingPosition(entry.url);
      expect(result?.lastPosition).toBe(10);
    });

    it('normalizes URLs by stripping query params', async () => {
      const withQuery = { ...entry, url: 'https://example.com/article?session=abc123' };
      await saveReadingPosition(withQuery);
      // Should be findable without query params
      const result = await getReadingPosition('https://example.com/article');
      expect(result).not.toBeNull();
    });

    it('handles malformed URLs without crashing', async () => {
      const badUrl = { ...entry, url: 'not-a-valid-url' };
      await saveReadingPosition(badUrl);
      const result = await getReadingPosition('not-a-valid-url');
      expect(result).not.toBeNull();
    });

    it('limits history to 100 entries', async () => {
      for (let i = 0; i < 105; i++) {
        await saveReadingPosition({
          ...entry,
          url: `https://example.com/${i}`,
          lastRead: Date.now() + i,
        });
      }
      const stored = await chrome.storage.local.get('history');
      const history = stored.history as Record<string, ReadingHistoryEntry>;
      expect(Object.keys(history)).toHaveLength(100);
    });

    it('keeps newest entries when trimming', async () => {
      for (let i = 0; i < 105; i++) {
        await saveReadingPosition({
          ...entry,
          url: `https://example.com/${i}`,
          lastRead: i, // oldest = 0, newest = 104
        });
      }
      // The newest entry (104) should still be there
      const result = await getReadingPosition('https://example.com/104');
      expect(result).not.toBeNull();
      // The oldest entry (0) should be trimmed
      const oldest = await getReadingPosition('https://example.com/0');
      expect(oldest).toBeNull();
    });
  });

  describe('getReadingPosition', () => {
    it('returns null for unknown URL', async () => {
      const result = await getReadingPosition('https://unknown.com');
      expect(result).toBeNull();
    });

    it('normalizes URL before lookup', async () => {
      await saveReadingPosition(entry);
      // Look up with query params
      const result = await getReadingPosition('https://example.com/article?foo=bar');
      expect(result).not.toBeNull();
    });
  });
});
