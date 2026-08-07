import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { IconProps } from './icons';
import { shadeColor } from '../utils/color';

// Flat rounded tile with a soft diagonal gradient of its own color, and a single-color line icon
// centered on top — no gloss, just a bit of depth so it doesn't read as a flat swatch.
const CORNER_RATIO = 0.24;

interface TileProps {
  Icon: (props: IconProps) => React.ReactElement;
  color: string;
  size?: number;
}

/** Pure visual tile — no press handling, no shadow. Use directly when a parent already owns the touch (e.g. a tab bar row). */
export function AppIconTile({ Icon, color, size = 64 }: TileProps) {
  const radius = size * CORNER_RATIO;
  const gradientId = `tile-gradient-${color.replace('#', '')}`;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }} pointerEvents="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={shadeColor(color, 20)} />
            <Stop offset="1" stopColor={shadeColor(color, -16)} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill={`url(#${gradientId})`} />
      </Svg>
      <Icon size={size * 0.44} color="#fff" />
    </View>
  );
}

interface Props extends TileProps {
  onPress?: () => void;
}

export default function AppIcon({ onPress, ...tileProps }: Props) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <AppIconTile {...tileProps} />
        </View>
      )}
    </Pressable>
  );
}
