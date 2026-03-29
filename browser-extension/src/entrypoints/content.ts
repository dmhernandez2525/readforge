import { extractArticle, extractFromSelection, extractFullPage } from '@/services/text-extractor';
import { splitSentences } from '@/services/sentence-splitter';
import { TTSEngine, isSpeechSynthesisAvailable, type TTSStatus } from '@/services/tts-engine';
import { loadSettings, saveSettings, saveReadingPosition } from '@/services/storage';
import { type Message, type StatusPayload } from '@/types/messages';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  main() {
    let engine: TTSEngine | null = null;
    let currentTitle = document.title;

    function getEngine(): TTSEngine | null {
      if (!engine) {
        if (!isSpeechSynthesisAvailable()) return null;
        engine = new TTSEngine();
      }
      return engine;
    }

    function getStatusPayload(): StatusPayload {
      const e = engine;
      return {
        status: e?.getStatus() ?? 'idle',
        currentSentence: e?.getCurrentIndex() ?? 0,
        totalSentences: e?.getTotalSentences() ?? 0,
        title: currentTitle,
        rate: e?.getRate() ?? 1.0,
      };
    }

    async function startReading(text?: string): Promise<StatusPayload> {
      const tts = getEngine();
      if (!tts) return getStatusPayload();
      const settings = await loadSettings();
      tts.setOptions({
        voiceId: settings.voiceId,
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
      });

      let content = text;
      if (!content) {
        // "Read This Page" always reads the article/full page, never the selection
        const extracted = extractArticle() ?? extractFullPage();
        if (!extracted.content.trim()) {
          return getStatusPayload();
        }
        content = extracted.content;
        currentTitle = extracted.title;
      }

      const parsed = splitSentences(content);
      const sentences = parsed.map((s) => s.text);

      if (!sentences.length) return getStatusPayload();

      tts.setCallbacks({
        onStatusChange(_status: TTSStatus) {
          chrome.runtime.sendMessage({
            type: 'STATUS_UPDATE',
            payload: getStatusPayload(),
          }).catch(() => {});
        },
        onComplete() {
          saveReadingPosition({
            url: window.location.href,
            title: currentTitle,
            lastPosition: tts.getTotalSentences(),
            totalSentences: tts.getTotalSentences(),
            lastRead: Date.now(),
          }).catch(() => {});
        },
        onError(error: string) {
          console.error('[ReadForge] TTS error:', error);
        },
      });

      await tts.speak(sentences);
      return getStatusPayload();
    }

    function readSelection(): StatusPayload | Promise<StatusPayload> {
      const extracted = extractFromSelection();
      if (!extracted) return getStatusPayload();
      currentTitle = `Selection from ${document.title}`;
      return startReading(extracted.content);
    }

    // Clean up when page unloads
    window.addEventListener('beforeunload', () => {
      engine?.dispose();
    });

    chrome.runtime.onMessage.addListener(
      (message: Message, _sender, sendResponse) => {
        switch (message.type) {
          case 'START_READING':
            startReading().then(sendResponse).catch(() => sendResponse(getStatusPayload()));
            return true;

          case 'READ_SELECTION':
            Promise.resolve(readSelection()).then(sendResponse).catch(() => sendResponse(getStatusPayload()));
            return true;

          case 'STOP_READING':
            engine?.stop();
            sendResponse(getStatusPayload());
            return false;

          case 'TOGGLE_PLAY':
            engine?.togglePlayPause();
            sendResponse(getStatusPayload());
            return false;

          case 'SKIP_FORWARD':
            engine?.skipForward();
            sendResponse(getStatusPayload());
            return false;

          case 'SKIP_BACKWARD':
            engine?.skipBackward();
            sendResponse(getStatusPayload());
            return false;

          case 'SET_RATE': {
            const rate = typeof message.payload === 'number' ? message.payload : 1.0;
            getEngine()?.setOptions({ rate });
            saveSettings({ rate }).catch(() => {});
            sendResponse(getStatusPayload());
            return false;
          }

          case 'SET_VOICE': {
            const voiceId = typeof message.payload === 'string' ? message.payload : '';
            getEngine()?.setOptions({ voiceId });
            saveSettings({ voiceId }).catch(() => {});
            sendResponse(getStatusPayload());
            return false;
          }

          case 'GET_STATUS':
            sendResponse(getStatusPayload());
            return false;

          default:
            return false;
        }
      },
    );
  },
});
