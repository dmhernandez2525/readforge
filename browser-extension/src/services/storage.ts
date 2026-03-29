/**
 * Typed wrapper around chrome.storage for extension settings.
 */

export interface ReadForgeSettings {
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
}

export const DEFAULT_SETTINGS: ReadForgeSettings = {
  voiceId: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

function getStorage(): chrome.storage.StorageArea {
  return chrome.storage.local;
}

export async function loadSettings(): Promise<ReadForgeSettings> {
  const stored = await getStorage().get('settings');
  if (!stored.settings) return { ...DEFAULT_SETTINGS };

  return { ...DEFAULT_SETTINGS, ...stored.settings };
}

export async function saveSettings(
  settings: Partial<ReadForgeSettings>,
): Promise<ReadForgeSettings> {
  const current = await loadSettings();
  const merged = { ...current, ...settings };
  await getStorage().set({ settings: merged });
  return merged;
}

export async function resetSettings(): Promise<ReadForgeSettings> {
  const defaults = { ...DEFAULT_SETTINGS };
  await getStorage().set({ settings: defaults });
  return defaults;
}

export interface ReadingHistoryEntry {
  url: string;
  title: string;
  lastPosition: number;
  totalSentences: number;
  lastRead: number;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export async function saveReadingPosition(entry: ReadingHistoryEntry): Promise<void> {
  const stored = await getStorage().get('history');
  const history: Record<string, ReadingHistoryEntry> = stored.history ?? {};
  const key = normalizeUrl(entry.url);
  history[key] = { ...entry, url: key };

  // Keep only last 100 entries
  const entries = Object.entries(history).sort(([, a], [, b]) => b.lastRead - a.lastRead);
  const trimmed = Object.fromEntries(entries.slice(0, 100));
  await getStorage().set({ history: trimmed });
}

export async function getReadingPosition(url: string): Promise<ReadingHistoryEntry | null> {
  const stored = await getStorage().get('history');
  const history: Record<string, ReadingHistoryEntry> = stored.history ?? {};
  return history[normalizeUrl(url)] ?? null;
}
