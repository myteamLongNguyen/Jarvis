import Svg, { Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { ORIAN } from './theme';

/**
 * Side profile of a flybridge cruiser, drawn rather than photographed.
 *
 * A drawing beats a photo here for three reasons: it carries no licence, it
 * stays sharp at any width on any screen, and it takes its colours from the
 * app so it sits in the dark palette instead of punching a bright rectangle
 * through it. The shape is a generic flybridge motor yacht, which is what the
 * Riviera 6200 is, not a traced likeness of one.
 */
interface Props {
  width: number;
  /** Dims everything but the rim light, for use behind text. */
  muted?: boolean;
}

const RATIO = 150 / 340;

export default function VesselProfile({ width, muted = false }: Props) {
  const height = width * RATIO;
  const hullOpacity = muted ? 0.45 : 1;

  return (
    <Svg width={width} height={height} viewBox="0 0 340 150">
      <Defs>
        <LinearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#24334A" />
          <Stop offset="1" stopColor="#0C1420" />
        </LinearGradient>
        <LinearGradient id="deck" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#30425D" />
          <Stop offset="1" stopColor="#16202F" />
        </LinearGradient>
        <LinearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={ORIAN.accent} stopOpacity="0.55" />
          <Stop offset="1" stopColor={ORIAN.accent} stopOpacity="0.12" />
        </LinearGradient>
        <LinearGradient id="wake" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={ORIAN.accent} stopOpacity="0.16" />
          <Stop offset="1" stopColor={ORIAN.accent} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Glow under the waterline, so the hull sits in something rather than floating on the panel. */}
      <Ellipse cx="170" cy="112" rx="150" ry="14" fill="url(#wake)" />

      <G opacity={hullOpacity}>
        {/* Hull: transom at the stern, sheer line rising to a raked bow. */}
        <Path
          d="M 26 70 L 26 92 C 72 105 186 105 268 88 C 288 82 300 70 312 54 C 240 62 118 66 26 70 Z"
          fill="url(#hull)"
        />
        {/* Rim light along the sheer, the line the eye reads as the edge of the deck. */}
        <Path
          d="M 26 70 C 118 66 240 62 312 54"
          stroke={ORIAN.accent}
          strokeWidth="1.6"
          strokeOpacity="0.85"
          fill="none"
          strokeLinecap="round"
        />
        {/* Boot stripe just above the waterline. */}
        <Path
          d="M 27 89 C 74 100 184 100 264 85"
          stroke={ORIAN.accentDim}
          strokeWidth="1.2"
          strokeOpacity="0.6"
          fill="none"
        />

        {/* Saloon, with the windscreen raked forward. */}
        <Path d="M 78 68 L 86 42 L 206 38 L 242 62 Z" fill="url(#deck)" />
        <Path
          d="M 78 68 L 86 42 L 206 38 L 242 62"
          stroke={ORIAN.accent}
          strokeWidth="1.1"
          strokeOpacity="0.5"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Saloon glazing. */}
        <Path d="M 94 46 L 198 43 L 198 56 L 92 59 Z" fill="url(#glass)" />
        <Path d="M 204 43 L 232 60 L 210 61 L 202 48 Z" fill="url(#glass)" />

        {/* Flybridge: hardtop on two supports. */}
        <Rect x="104" y="22" width="3" height="22" fill="#2A3A52" />
        <Rect x="186" y="20" width="3" height="22" fill="#2A3A52" />
        <Path d="M 96 24 L 200 18 L 206 24 L 100 30 Z" fill="url(#deck)" />
        <Path
          d="M 96 24 L 200 18"
          stroke={ORIAN.accent}
          strokeWidth="1.3"
          strokeOpacity="0.7"
          fill="none"
          strokeLinecap="round"
        />

        {/* Mast and radar, the detail that reads as a working vessel. */}
        <Path d="M 150 19 L 152 5" stroke="#3A4C68" strokeWidth="1.6" strokeLinecap="round" />
        <Rect x="143" y="3" width="18" height="2.6" rx="1.3" fill={ORIAN.accent} fillOpacity="0.75" />

        {/* Hull portlights. */}
        <Rect x="70" y="75" width="9" height="3.2" rx="1.6" fill={ORIAN.accent} fillOpacity="0.4" />
        <Rect x="90" y="75" width="9" height="3.2" rx="1.6" fill={ORIAN.accent} fillOpacity="0.4" />
        <Rect x="110" y="74.5" width="9" height="3.2" rx="1.6" fill={ORIAN.accent} fillOpacity="0.4" />
      </G>

      {/* Water, three strokes rather than a wave: enough to sit her in it, quiet enough to ignore. */}
      <Path d="M 18 108 L 118 108" stroke={ORIAN.accent} strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />
      <Path d="M 140 114 L 262 114" stroke={ORIAN.accent} strokeOpacity="0.14" strokeWidth="1.4" strokeLinecap="round" />
      <Path d="M 54 120 L 210 120" stroke={ORIAN.accent} strokeOpacity="0.08" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}
