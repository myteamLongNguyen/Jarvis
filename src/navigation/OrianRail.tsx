import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useCompactLayout } from '../hooks/useCompactLayout';
import { ORIAN } from '../screens/Orian/theme';
import { useVesselPhoto } from '../screens/Orian/useVesselPhoto';

/**
 * The sections IVS will grow into, listed beside the two that work.
 *
 * They are shown dimmed and do nothing when pressed. Leaving them out would
 * hide where the app is going; letting them open an empty screen would waste
 * the reader's time. Dimmed and inert says both things at once.
 */
const PLANNED = [
  'Vessel status',
  'Engines & IPS',
  'Fuel & efficiency',
  'Electrical',
  'CZone',
  'Seakeeper',
  'Maintenance',
  'Alerts',
  'Reports',
];

export default function OrianRail(props: BottomTabBarProps) {
  return useCompactLayout() ? <BottomBar {...props} /> : <SideRail {...props} />;
}

function BottomBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{ backgroundColor: ORIAN.panel, borderTopColor: ORIAN.border }}
      className="flex-row border-t"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            onPress={() => !focused && navigation.navigate(route.name)}
            className="flex-1 items-center py-3"
          >
            <Text
              style={{ color: focused ? ORIAN.accent : ORIAN.textMuted }}
              className="text-sm font-semibold"
            >
              {descriptors[route.key].options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SideRail({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { source: photo } = useVesselPhoto();

  return (
    <View
      style={{ width: 232, backgroundColor: ORIAN.panel, borderRightColor: ORIAN.border, paddingTop: insets.top + 16 }}
      className="border-r"
    >
      <View className="px-5 pb-5">
        <Text style={{ color: ORIAN.accent }} className="text-base font-bold tracking-[3px]">
          ORIAN
        </Text>
        <Text style={{ color: ORIAN.textFaint }} className="mt-0.5 text-xs tracking-[2px]">
          IVS
        </Text>

        <View
          style={{ backgroundColor: ORIAN.inset, borderColor: ORIAN.border }}
          className="mt-4 h-24 items-center justify-center overflow-hidden rounded-xl border"
        >
          <Image source={photo} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>

        <Text style={{ color: ORIAN.text }} className="mt-3 text-lg font-bold">
          Orion
        </Text>
        <Text style={{ color: ORIAN.textFaint }} className="text-sm">
          Riviera 6200
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              onPress={() => !focused && navigation.navigate(route.name)}
              style={{ backgroundColor: focused ? ORIAN.inset : 'transparent' }}
              className="mx-3 mb-1 flex-row items-center rounded-xl px-3 py-3"
            >
              <View
                style={{ backgroundColor: focused ? ORIAN.accent : 'transparent' }}
                className="mr-3 h-5 w-[3px] rounded-full"
              />
              <Text
                style={{ color: focused ? ORIAN.text : ORIAN.textMuted }}
                className="text-base font-semibold"
              >
                {descriptors[route.key].options.title ?? route.name}
              </Text>
            </Pressable>
          );
        })}

        <View style={{ backgroundColor: ORIAN.border }} className="mx-6 my-4 h-[1px]" />

        {PLANNED.map((name) => (
          <View key={name} className="mx-3 mb-1 flex-row items-center rounded-xl px-3 py-3">
            <View className="mr-3 h-5 w-[3px]" />
            <Text style={{ color: ORIAN.textFaint }} className="text-base">
              {name}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ borderTopColor: ORIAN.border }} className="border-t px-5 py-4">
        <View className="flex-row items-center">
          <View style={{ backgroundColor: ORIAN.warn }} className="mr-2 h-2 w-2 rounded-full" />
          <Text style={{ color: ORIAN.textMuted }} className="text-xs font-semibold">
            Awaiting sensors
          </Text>
        </View>
        <Text style={{ color: ORIAN.textFaint }} className="mt-1 text-xs">
          Documents online
        </Text>
      </View>
    </View>
  );
}
