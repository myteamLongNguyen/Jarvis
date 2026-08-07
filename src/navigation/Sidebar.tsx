import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import JarvisLogo from '../components/JarvisLogo';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 76;
const STORAGE_KEY = '@jarvis/sidebar_collapsed';

export default function Sidebar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const width = useRef(new Animated.Value(EXPANDED_WIDTH)).current;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === '1') setCollapsed(true);
    });
  }, []);

  useEffect(() => {
    Animated.timing(width, {
      toValue: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
      duration: 180,
      useNativeDriver: false,
    }).start();
    AsyncStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <Animated.View
      style={{ width, paddingTop: insets.top + 8 }}
      className="border-r border-slate-200 bg-white"
    >
      <Pressable
        onPress={() => {
          const parent = navigation.getParent();
          if (parent?.canGoBack()) parent.goBack();
        }}
        className={`mx-3 mb-4 flex-row items-center rounded-lg px-2 py-2 ${collapsed ? 'justify-center' : ''}`}
        hitSlop={8}
      >
        <JarvisLogo size={34} />
        {collapsed ? null : (
          <View className="ml-2">
            <Text className="text-base font-bold text-slate-900">Jarvis</Text>
            <Text className="text-xs font-medium text-slate-500">All apps</Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={() => setCollapsed((c) => !c)}
        className="mx-3 mb-4 items-center rounded-lg py-2"
        hitSlop={8}
      >
        <Text className="text-lg text-slate-500">{collapsed ? '»' : '«'}</Text>
      </Pressable>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.title ?? route.name;
        const color = isFocused ? '#0f172a' : '#64748b';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className={`mx-3 mb-1 flex-row items-center rounded-lg px-3 py-3 ${isFocused ? 'bg-slate-100' : ''} ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {options.tabBarIcon?.({ focused: isFocused, color, size: 20 })}
            {collapsed ? null : (
              <Text style={{ color }} className="ml-3 text-base font-medium" numberOfLines={1}>
                {label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}
