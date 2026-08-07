import { useCallback, useState, Children } from 'react';
import { View, LayoutChangeEvent } from 'react-native';

const GAP = 12;

interface Props {
  children: React.ReactNode;
  minItemWidth?: number;
}

export default function StatCardGrid({ children, minItemWidth = 210 }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width), []);

  const columns = width > 0 ? Math.max(1, Math.min(6, Math.floor(width / minItemWidth))) : 2;
  const itemWidth = width > 0 ? (width - GAP * (columns - 1)) / columns : undefined;

  return (
    <View className="flex-row flex-wrap gap-3" onLayout={onLayout}>
      {Children.map(children, (child) => (
        <View style={itemWidth ? { width: itemWidth } : { flexGrow: 1, minWidth: 160 }}>{child}</View>
      ))}
    </View>
  );
}
