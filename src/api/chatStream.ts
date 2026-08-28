import { fetch as expoFetch } from 'expo/fetch';
import { supabase } from '../lib/supabase';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

type ChatStreamEvent = { type: 'text'; text: string } | { type: 'done' } | { type: 'error'; message: string };

interface StreamChatOptions {
  message: string;
  history?: ChatHistoryMessage[];
  onText: (text: string) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

/**
 * Streams a reply from the in-app AI assistant (POST /chat/stream, Server-Sent Events).
 * Uses `expo/fetch` rather than axios because it exposes a real streaming response body —
 * axios/XHR in React Native buffers the whole response before resolving.
 */
export async function streamChat({ message, history = [], onText, onError, signal }: StreamChatOptions): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await expoFetch(`${process.env.EXPO_PUBLIC_API_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok || !response.body) {
    onError(`Request failed (${response.status})`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line; each frame's payload line starts with "data: ".
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      let event: ChatStreamEvent;
      try {
        event = JSON.parse(line.slice('data: '.length));
      } catch {
        continue;
      }
      if (event.type === 'text') onText(event.text);
      else if (event.type === 'error') onError(event.message);
    }
  }
}
