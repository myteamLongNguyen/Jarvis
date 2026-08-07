import { Pressable, View } from 'react-native';
import type { IconProps } from './icons';

// Flat tech-style tile: a solid color, softly rounded square with a single-color
// line icon centered on it — no gradients, no gloss.
const CORNER_RATIO = 0.24;

interface Props {
  Icon: (props: IconProps) => React.ReactElement;
  color: string;
  size?: number;
  onPress?: () => void;
}

export default function AppIcon({ Icon, color, size = 64, onPress }: Props) {
  const radius = size * CORNER_RATIO;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Icon size={size * 0.44} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}
