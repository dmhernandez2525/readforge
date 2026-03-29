import { describe, it, expect } from 'vitest';
import { createMessage, type MessageType } from './messages';

describe('createMessage', () => {
  it('creates a message with type only', () => {
    const msg = createMessage('GET_STATUS');
    expect(msg).toEqual({ type: 'GET_STATUS', payload: undefined });
  });

  it('creates a message with number payload', () => {
    const msg = createMessage('SET_RATE', 1.5);
    expect(msg.type).toBe('SET_RATE');
    expect(msg.payload).toBe(1.5);
  });

  it('creates a message with string payload', () => {
    const msg = createMessage('SET_VOICE', 'voice-1');
    expect(msg.type).toBe('SET_VOICE');
    expect(msg.payload).toBe('voice-1');
  });

  it('creates a message with object payload', () => {
    const payload = { status: 'idle', currentSentence: 0 };
    const msg = createMessage('STATUS_UPDATE', payload);
    expect(msg.type).toBe('STATUS_UPDATE');
    expect(msg.payload).toEqual(payload);
  });

  it('creates a message with null payload', () => {
    const msg = createMessage('ERROR', null);
    expect(msg.type).toBe('ERROR');
    expect(msg.payload).toBeNull();
  });

  it('supports all defined message types', () => {
    const types: MessageType[] = [
      'START_READING', 'STOP_READING', 'TOGGLE_PLAY',
      'SKIP_FORWARD', 'SKIP_BACKWARD', 'SET_RATE', 'SET_VOICE',
      'GET_STATUS', 'STATUS_UPDATE', 'READ_SELECTION', 'ERROR',
    ];
    for (const type of types) {
      const msg = createMessage(type);
      expect(msg.type).toBe(type);
    }
  });
});
