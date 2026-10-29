import { useWindowDimensions } from 'react-native';

/**
 * Phone-width layouts. The app was laid out for a tablet — a permanent left rail,
 * generous padding — which leaves a phone almost no room for content. Anything
 * gated on this hook must leave the tablet layout exactly as it was.
 *
 * 768 is the narrow side of the smallest iPad in portrait, so every iPad stays on
 * the wide layout and every phone (largest is ~440pt wide) gets the compact one.
 */
const COMPACT_MAX_WIDTH = 768;

export function useCompactLayout(): boolean {
  const { width } = useWindowDimensions();
  return width < COMPACT_MAX_WIDTH;
}
