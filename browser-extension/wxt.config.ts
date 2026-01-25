import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@anthropic-ai/wxt-react'],
  srcDir: 'src',
  manifest: {
    name: 'ReadForge',
    description: '100% local text-to-speech for web pages, PDFs, and documents. Your text never leaves your device.',
    version: '1.0.0',
    permissions: [
      'activeTab',
      'storage',
      'contextMenus',
    ],
    host_permissions: [
      '<all_urls>',
    ],
    commands: {
      'toggle-play': {
        suggested_key: {
          default: 'Alt+Shift+P',
          mac: 'Alt+Shift+P',
        },
        description: 'Play/Pause reading',
      },
      'read-selection': {
        suggested_key: {
          default: 'Alt+Shift+R',
          mac: 'Alt+Shift+R',
        },
        description: 'Read selected text',
      },
    },
    web_accessible_resources: [
      {
        resources: ['models/*', 'player/*'],
        matches: ['<all_urls>'],
      },
    ],
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
  runner: {
    startUrls: ['https://en.wikipedia.org/wiki/Text-to-speech'],
  },
});
