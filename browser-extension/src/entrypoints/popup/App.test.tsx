import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

describe('Popup App', () => {
  beforeEach(() => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'idle',
      currentSentence: 0,
      totalSentences: 0,
      title: '',
      rate: 1.0,
    });
  });

  async function renderAndWait() {
    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<App />);
    });
    return result!;
  }

  it('renders the ReadForge header', async () => {
    await renderAndWait();
    expect(screen.getByText('ReadForge')).toBeTruthy();
  });

  it('shows idle state with Read This Page button', async () => {
    await renderAndWait();
    expect(screen.getByText('Read This Page')).toBeTruthy();
  });

  it('shows description text in idle state', async () => {
    await renderAndWait();
    expect(screen.getByText(/Read any web page aloud/)).toBeTruthy();
  });

  it('sends START_READING on button click', async () => {
    await renderAndWait();
    await act(async () => {
      fireEvent.click(screen.getByText('Read This Page'));
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'START_READING' }),
    );
  });

  it('shows reading state with controls', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 3,
      totalSentences: 10,
      title: 'Test Article',
      rate: 1.0,
    });

    await renderAndWait();

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeTruthy();
      expect(screen.getByText('3/10 sentences')).toBeTruthy();
    });
  });

  it('shows pause button when speaking', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 0,
      totalSentences: 5,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await waitFor(() => {
      expect(screen.getByLabelText('Pause')).toBeTruthy();
    });
  });

  it('shows play button when paused', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'paused',
      currentSentence: 2,
      totalSentences: 5,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await waitFor(() => {
      expect(screen.getByLabelText('Resume')).toBeTruthy();
    });
  });

  it('sends STOP_READING on stop button click', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 0,
      totalSentences: 5,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await act(async () => {
      fireEvent.click(screen.getByText('Stop Reading'));
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'STOP_READING' }),
    );
  });

  it('sends TOGGLE_PLAY on play/pause button click', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 0,
      totalSentences: 5,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Pause'));
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TOGGLE_PLAY' }),
    );
  });

  it('sends skip messages on skip button clicks', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 2,
      totalSentences: 5,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Next sentence'));
      fireEvent.click(screen.getByLabelText('Previous sentence'));
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SKIP_FORWARD' }),
    );
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SKIP_BACKWARD' }),
    );
  });

  it('sends GET_STATUS on mount', async () => {
    await renderAndWait();

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GET_STATUS' }),
    );
  });

  it('registers and cleans up message listener', async () => {
    const { unmount } = await renderAndWait();

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    unmount();
    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalled();
  });

  it('has a progress bar with correct role', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 5,
      totalSentences: 10,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeTruthy();
    });
  });

  it('has a properly labeled speed slider', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 0,
      totalSentences: 5,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await waitFor(() => {
      const slider = screen.getByLabelText('Playback speed');
      expect(slider).toBeTruthy();
    });
  });

  it('sends SET_RATE when speed slider changes', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      status: 'speaking',
      currentSentence: 0,
      totalSentences: 5,
      title: 'Test',
      rate: 1.0,
    });

    await renderAndWait();

    await act(async () => {
      const slider = screen.getByLabelText('Playback speed');
      fireEvent.change(slider, { target: { value: '1.5' } });
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_RATE', payload: 1.5 }),
    );
  });

  it('handles sendMessage rejection gracefully', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockRejectedValue(new Error('disconnected'));
    await renderAndWait();
    // Should not crash, should stay in idle state
    expect(screen.getByText('Read This Page')).toBeTruthy();
  });

  it('displays error when ERROR response received', async () => {
    vi.mocked(chrome.runtime.sendMessage)
      .mockResolvedValueOnce({
        status: 'idle',
        currentSentence: 0,
        totalSentences: 0,
        title: '',
        rate: 1.0,
      })
      .mockResolvedValueOnce({
        type: 'ERROR',
        payload: { message: 'ReadForge is not available on this page' },
      });

    await renderAndWait();

    await act(async () => {
      fireEvent.click(screen.getByText('Read This Page'));
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
  });

  it('updates status when STATUS_UPDATE message received', async () => {
    await renderAndWait();

    // Get the listener that was registered
    const addListenerCall = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls[0];
    const listener = addListenerCall[0] as (message: { type: string; payload?: unknown }) => void;

    await act(async () => {
      listener({
        type: 'STATUS_UPDATE',
        payload: {
          status: 'speaking',
          currentSentence: 3,
          totalSentences: 10,
          title: 'Updated Title',
          rate: 1.5,
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeTruthy();
      expect(screen.getByText('3/10 sentences')).toBeTruthy();
    });
  });
});
