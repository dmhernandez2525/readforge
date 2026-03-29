export type MessageType =
  | 'START_READING'
  | 'STOP_READING'
  | 'TOGGLE_PLAY'
  | 'SKIP_FORWARD'
  | 'SKIP_BACKWARD'
  | 'SET_RATE'
  | 'SET_VOICE'
  | 'GET_STATUS'
  | 'STATUS_UPDATE'
  | 'READ_SELECTION'
  | 'ERROR';

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface StatusPayload {
  status: 'idle' | 'loading' | 'speaking' | 'paused';
  currentSentence: number;
  totalSentences: number;
  title: string;
  rate: number;
}

export function createMessage(type: MessageType, payload?: unknown): Message {
  return { type, payload };
}
