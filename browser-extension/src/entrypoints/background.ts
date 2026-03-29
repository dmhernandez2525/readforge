import { type Message } from '@/types/messages';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'readforge-read-selection',
      title: 'Read with ReadForge',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'readforge-read-page',
      title: 'Read this page with ReadForge',
      contexts: ['page'],
    });
  });

  function sendToActiveTab(message: Message, callback?: (response: unknown) => void): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs?.[0]?.id;
      if (!tabId) {
        callback?.({ type: 'ERROR', payload: { message: 'No active tab' } });
        return;
      }
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          callback?.({
            type: 'ERROR',
            payload: { message: 'ReadForge is not available on this page' },
          });
          return;
        }
        callback?.(response);
      });
    });
  }

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;

    if (info.menuItemId === 'readforge-read-selection') {
      chrome.tabs.sendMessage(tab.id, { type: 'READ_SELECTION' } satisfies Message, () => {
        if (chrome.runtime.lastError) { /* tab may not have content script */ }
      });
    } else if (info.menuItemId === 'readforge-read-page') {
      chrome.tabs.sendMessage(tab.id, { type: 'START_READING' } satisfies Message, () => {
        if (chrome.runtime.lastError) { /* tab may not have content script */ }
      });
    }
  });

  chrome.commands.onCommand.addListener((command) => {
    const type = command === 'toggle-play' ? 'TOGGLE_PLAY'
      : command === 'read-selection' ? 'READ_SELECTION'
      : null;
    if (type) {
      sendToActiveTab({ type } as Message);
    }
  });

  // Relay messages between popup and content scripts
  chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
    const relayTypes = new Set([
      'GET_STATUS', 'START_READING', 'STOP_READING', 'TOGGLE_PLAY',
      'SKIP_FORWARD', 'SKIP_BACKWARD', 'SET_RATE', 'SET_VOICE',
    ]);

    if (relayTypes.has(message.type)) {
      sendToActiveTab(message, sendResponse);
      return true;
    }
  });
});
