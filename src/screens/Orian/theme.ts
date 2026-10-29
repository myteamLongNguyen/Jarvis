/**
 * Orian IVS runs dark while the rest of Jarvis runs light.
 *
 * That is deliberate rather than decorative: this app is read on a flybridge
 * in the dark and beside instrument screens that are all dark, so a white page
 * would blind the person reading it. Keeping the palette in one place means
 * the screens cannot drift apart from each other.
 */
export const ORIAN = {
  /** Page behind everything. */
  bg: '#060910',
  /** A panel sitting on the page. */
  panel: '#0F1724',
  /** A row or tile inside a panel. */
  inset: '#151E2E',
  border: '#1F2B3E',
  /** The system accent, used for anything live or actionable. */
  accent: '#22D3EE',
  accentDim: '#0E7490',
  text: '#E8EEF7',
  textMuted: '#8396AE',
  textFaint: '#5A6B82',
  good: '#34D399',
  warn: '#FBBF24',
  bad: '#F87171',
} as const;
