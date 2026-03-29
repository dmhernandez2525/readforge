import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'ReadForge',
    description:
      '100% local text-to-speech for web pages, PDFs, and documents. Your text never leaves your device.',
    version: '1.0.0',
    permissions: ['activeTab', 'storage', 'contextMenus'],
    commands: {
      'toggle-play': {
        suggested_key: { default: 'Alt+Shift+P' },
        description: 'Play/Pause reading',
      },
      'read-selection': {
        suggested_key: { default: 'Alt+Shift+R' },
        description: 'Read selected text',
      },
    },
  },
});
