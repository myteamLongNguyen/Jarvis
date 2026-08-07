import { useCallback, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface Props {
  fromColor: string;
  toColor: string;
  height?: number;
  borderRadius?: number;
  children: React.ReactNode;
}

/** A gradient panel with abstract white motion-line streaks swept across it — the backdrop for a screen's hero copy. */
export default function GradientHero({ fromColor, toColor, height = 150, borderRadius = 20, children }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width), []);
  const gradientId = `hero-gradient-${fromColor.replace('#', '')}-${toColor.replace('#', '')}`;

  return (
    <View style={{ borderRadius, overflow: 'hidden', minHeight: height }} onLayout={onLayout}>
      {width > 0 ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={fromColor} />
              <Stop offset="1" stopColor={toColor} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={100} height={100} fill={`url(#${gradientId})`} />
          <Path d="M-10,66 C22,58 52,30 118,2" stroke="#fff" strokeOpacity={0.22} strokeWidth={6} strokeLinecap="round" fill="none" />
          <Path d="M-6,86 C28,74 58,46 112,20" stroke="#fff" strokeOpacity={0.16} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <Path d="M18,104 C46,92 70,68 104,42" stroke="#fff" strokeOpacity={0.26} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </Svg>
      ) : null}
      <View style={{ minHeight: height, justifyContent: 'center', padding: 20 }}>{children}</View>
    </View>
  );
}
