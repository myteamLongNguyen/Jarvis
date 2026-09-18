import { fetch as expoFetch } from 'expo/fetch';
import { supabase } from '../lib/supabase';
import type { SmartScanKind, SmartScanSource } from '../types/smart-scan';

export type SmartScanProgress =
  | { type: 'reading'; source: SmartScanSource; characters?: number }
  | {
      type: 'classified';
      documentKind: SmartScanKind;
      confidence: 'HIGH' | 'MEDIUM' | 'LOW';
      title: string;
      propertyName?: string;
    }
  | { type: 'done' };

/** Ids are only ever an in-memory key on the server, so Math.random is plenty. */
export function newScanId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Listens to a scan's progress (GET /smart-scan/progress/:scanId, Server-Sent Events).
 *
 * Progress travels on its own request because the upload has to be multipart, which
 * React Native can only send through XHR (axios), while reading a stream needs
 * `expo/fetch` — no one request can do both. The scan's actual result comes back on
 * the upload, so everything here is decoration: if it fails, the scan is unaffected
 * and the user just sees a plainer wait.
 */
export async function listenToScanProgress(
  scanId: string,
  onProgress: (event: SmartScanProgress) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await expoFetch(`${process.env.EXPO_PUBLIC_API_URL}/smart-scan/progress/${scanId}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal,
    });

    if (!response.ok || !response.body) return;

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
        try {
          onProgress(JSON.parse(line.slice('data: '.length)) as SmartScanProgress);
        } catch {
          // A half-written frame is not worth failing the scan over.
        }
      }
    }
  } catch {
    // Progress is best-effort; the scan itself is unaffected.
  }
}
