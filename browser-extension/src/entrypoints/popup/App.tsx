import { useState, useEffect, useCallback } from 'react';
import type { MessageType, StatusPayload } from '@/types/messages';
import { createMessage } from '@/types/messages';

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
      <div
        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      />
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState<StatusPayload>({
    status: 'idle',
    currentSentence: 0,
    totalSentences: 0,
    title: '',
    rate: 1.0,
  });
  const [rate, setRate] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  const isIdle = status.status === 'idle';

  const sendMessage = useCallback(
    async (type: MessageType, payload?: unknown): Promise<StatusPayload | undefined> => {
      try {
        setError(null);
        const response = await chrome.runtime.sendMessage(createMessage(type, payload));
        if (response?.type === 'ERROR') {
          setError(response.payload?.message ?? 'Something went wrong');
          return undefined;
        }
        if (response?.status) {
          setStatus(response);
          if (typeof response.rate === 'number') setRate(response.rate);
        }
        return response;
      } catch {
        return undefined;
      }
    },
    [],
  );

  useEffect(() => {
    sendMessage('GET_STATUS');

    const listener = (message: { type: string; payload?: StatusPayload }) => {
      if (message.type === 'STATUS_UPDATE' && message.payload) {
        setStatus(message.payload);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [sendMessage]);

  const handleStartReading = () => sendMessage('START_READING');
  const handleStop = () => sendMessage('STOP_READING');
  const handleToggle = () => sendMessage('TOGGLE_PLAY');
  const handleSkipBack = () => sendMessage('SKIP_BACKWARD');
  const handleSkipForward = () => sendMessage('SKIP_FORWARD');
  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    sendMessage('SET_RATE', newRate);
  };

  return (
    <div className="w-72 p-4 bg-white text-gray-900 font-sans">
      <header className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">RF</span>
        </div>
        <h1 className="text-sm font-semibold">ReadForge</h1>
      </header>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded" role="alert">
          {error}
        </div>
      )}

      {isIdle ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Read any web page aloud using local text-to-speech. Your text never leaves your device.
          </p>
          <button
            onClick={handleStartReading}
            className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            Read This Page
          </button>
          <div className="text-xs text-gray-400 text-center">
            Or select text and right-click for "Read with ReadForge"
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-gray-600 truncate" title={status.title}>
            {status.title || 'Reading...'}
          </div>

          <ProgressBar current={status.currentSentence} total={status.totalSentences} />

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {status.currentSentence}/{status.totalSentences} sentences
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSkipBack}
              className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Previous sentence"
              title="Previous sentence"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={handleToggle}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
              aria-label={status.status === 'paused' ? 'Resume' : 'Pause'}
            >
              {status.status === 'paused' ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Next sentence"
              title="Next sentence"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="speed-slider" className="text-xs text-gray-500 shrink-0">Speed</label>
            <input
              id="speed-slider"
              type="range"
              min={0.5}
              max={3}
              step={0.25}
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-blue-600"
              aria-label="Playback speed"
            />
            <span className="text-xs text-gray-500 w-8 text-right">{rate}x</span>
          </div>

          <button
            onClick={handleStop}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors rounded"
          >
            Stop Reading
          </button>
        </div>
      )}
    </div>
  );
}
