import { vi, beforeEach } from 'vitest';

// Mock chrome API globally
const storageMockLocal: Record<string, unknown> = {};
const storageMockSync: Record<string, unknown> = {};

function createStorageArea(backing: Record<string, unknown>) {
  return {
    get: vi.fn(async (keys?: string | string[]) => {
      if (typeof keys === 'string') {
        return { [keys]: backing[keys] };
      }
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        for (const key of keys) result[key] = backing[key];
        return result;
      }
      return { ...backing };
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      Object.assign(backing, items);
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const arr = typeof keys === 'string' ? [keys] : keys;
      for (const key of arr) delete backing[key];
    }),
    clear: vi.fn(async () => {
      for (const key of Object.keys(backing)) delete backing[key];
    }),
  };
}

const chromeMock = {
  runtime: {
    id: 'test-extension-id',
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    lastError: null as chrome.runtime.LastError | null,
  },
  storage: {
    local: createStorageArea(storageMockLocal),
    sync: createStorageArea(storageMockSync),
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
    },
  },
  commands: {
    onCommand: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn((_query: unknown, callback: (tabs: chrome.tabs.Tab[]) => void) => {
      callback([{ id: 1, url: 'https://example.com' } as chrome.tabs.Tab]);
    }),
    sendMessage: vi.fn((_tabId: number, _message: unknown, callback?: (response: unknown) => void) => {
      callback?.({});
    }),
  },
};

vi.stubGlobal('chrome', chromeMock);

// Mock SpeechSynthesisUtterance (not available in happy-dom)
class MockSpeechSynthesisUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  lang = '';
  onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((ev: SpeechSynthesisErrorEvent) => void) | null = null;
  onstart: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onpause: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onresume: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onboundary: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onmark: ((ev: SpeechSynthesisEvent) => void) | null = null;

  constructor(text = '') {
    this.text = text;
  }
}

vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);

// Reset storage between tests
beforeEach(() => {
  for (const key of Object.keys(storageMockLocal)) delete storageMockLocal[key];
  for (const key of Object.keys(storageMockSync)) delete storageMockSync[key];
  chromeMock.runtime.lastError = null;
  vi.clearAllMocks();
  // Re-set the default tabs.query behavior after clearAllMocks
  chromeMock.tabs.query.mockImplementation((_query: unknown, callback: (tabs: chrome.tabs.Tab[]) => void) => {
    callback([{ id: 1, url: 'https://example.com' } as chrome.tabs.Tab]);
  });
  chromeMock.tabs.sendMessage.mockImplementation((_tabId: number, _message: unknown, callback?: (response: unknown) => void) => {
    callback?.({});
  });
});
