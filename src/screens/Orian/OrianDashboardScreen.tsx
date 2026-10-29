import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useGetDocumentsQuery } from '../../api/jarvisApi';
import { ORIAN_ROUTES, OrianTabParamList } from '../../navigation/routes';
import { DocumentType } from '../../types/document';
import { ORIAN } from './theme';
import { useVesselPhoto } from './useVesselPhoto';

type Props = BottomTabScreenProps<OrianTabParamList, typeof ORIAN_ROUTES.OrianDashboard>;

/**
 * The systems IVS is designed around, none of which it can read yet.
 *
 * They are on the page on purpose, labelled as not connected. Showing the shape
 * of the finished system is useful; inventing readings for a real vessel would
 * not be, so no panel here displays a number it does not have.
 */
const SYSTEMS: { name: string; detail: string }[] = [
  { name: 'Engines & IPS', detail: 'Volvo J1939 via gateway' },
  { name: 'Electrical', detail: 'Batteries, shore power' },
  { name: 'CZone', detail: 'Circuits and alarms' },
  { name: 'Tanks', detail: 'Fuel, water, holding' },
  { name: 'Position', detail: 'GPS, AIS, movement' },
  { name: 'Seakeeper', detail: 'Roll and pitch' },
];

const DOC_GROUPS: { label: string; types: DocumentType[] }[] = [
  { label: 'Manuals', types: ['MANUAL'] },
  { label: 'Service history', types: ['SERVICE_RECORD'] },
  { label: 'Invoices & receipts', types: ['INVOICE'] },
  { label: 'Warranty', types: ['WARRANTY'] },
];

export default function OrianDashboardScreen({ navigation }: Props) {
  const [heroWidth, setHeroWidth] = useState(0);
  const { source: vessel, isOwnPhoto } = useVesselPhoto();
  // Her photo runs a touch wider than tall, which is how a boat is shot.
  const heroHeight = Math.max(200, Math.min(heroWidth * 0.42, 420));
  const documents = useGetDocumentsQuery({ area: 'ORIAN', limit: 200 });
  const items = documents.data?.items ?? [];

  const countFor = (types: DocumentType[]) => items.filter((doc) => types.includes(doc.documentType)).length;

  return (
    <ScrollView style={{ backgroundColor: ORIAN.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View className="flex-row items-end justify-between">
        <View>
          <Text style={{ color: ORIAN.accent }} className="text-xs font-bold uppercase tracking-[3px]">
            Orian IVS
          </Text>
          <Text style={{ color: ORIAN.text }} className="mt-1 text-3xl font-bold">
            Orion
          </Text>
          <Text style={{ color: ORIAN.textMuted }} className="mt-0.5 text-base">
            Riviera 6200
          </Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-center">
            <View style={{ backgroundColor: ORIAN.warn }} className="mr-2 h-2 w-2 rounded-full" />
            <Text style={{ color: ORIAN.textMuted }} className="text-sm font-semibold">
              Awaiting sensors
            </Text>
          </View>
          <Text style={{ color: ORIAN.textFaint }} className="mt-0.5 text-xs">
            Vessel Intelligence System
          </Text>
        </View>
      </View>

      <View
        onLayout={(event) => setHeroWidth(event.nativeEvent.layout.width)}
        style={{ backgroundColor: ORIAN.panel, borderColor: ORIAN.border }}
        className="mt-6 overflow-hidden rounded-2xl border"
      >
        <Image source={vessel} style={{ width: '100%', height: heroHeight }} resizeMode="cover" />

        {/* Offered only while the shipped photo is standing in, so the prompt
            disappears the moment a real one of her is filed. */}
        {!isOwnPhoto ? (
          <Pressable
            onPress={() => navigation.navigate(ORIAN_ROUTES.OrianDocuments)}
            style={{ backgroundColor: 'rgba(6,9,16,0.78)', borderColor: ORIAN.accentDim }}
            className="absolute bottom-3 right-3 rounded-full border px-4 py-2"
          >
            <Text style={{ color: ORIAN.accent }} className="text-sm font-semibold">
              Use your own photo
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={() => navigation.navigate(ORIAN_ROUTES.OrianDocuments)}
        style={{ backgroundColor: ORIAN.panel, borderColor: ORIAN.accentDim }}
        className="mt-6 rounded-2xl border p-5"
      >
        <View className="flex-row items-center justify-between">
          <Text style={{ color: ORIAN.accent }} className="text-xs font-bold uppercase tracking-wider">
            Documents
          </Text>
          <Text style={{ color: ORIAN.accent }} className="text-sm font-semibold">
            Open →
          </Text>
        </View>

        <Text style={{ color: ORIAN.text }} className="mt-3 text-4xl font-bold">
          {items.length}
        </Text>
        <Text style={{ color: ORIAN.textMuted }} className="mt-1 text-base">
          {items.length === 1 ? 'file stored' : 'files stored'} for the vessel
        </Text>

        <View className="mt-5 flex-row flex-wrap" style={{ gap: 10 }}>
          {DOC_GROUPS.map((group) => (
            <View
              key={group.label}
              style={{ backgroundColor: ORIAN.inset, borderColor: ORIAN.border }}
              className="flex-1 rounded-xl border px-3 py-3"
            >
              <Text style={{ color: ORIAN.text }} className="text-xl font-bold">
                {countFor(group.types)}
              </Text>
              <Text style={{ color: ORIAN.textFaint }} className="mt-0.5 text-xs" numberOfLines={2}>
                {group.label}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>

      <Text style={{ color: ORIAN.textMuted }} className="mb-3 mt-8 text-xs font-bold uppercase tracking-wider">
        Vessel systems
      </Text>

      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {SYSTEMS.map((system) => (
          <View
            key={system.name}
            style={{ backgroundColor: ORIAN.panel, borderColor: ORIAN.border, minWidth: 150 }}
            className="flex-1 rounded-2xl border p-4"
          >
            <View className="flex-row items-center">
              <View style={{ backgroundColor: ORIAN.textFaint }} className="mr-2 h-1.5 w-1.5 rounded-full" />
              <Text style={{ color: ORIAN.textFaint }} className="text-xs font-semibold uppercase tracking-wider">
                Not connected
              </Text>
            </View>
            <Text style={{ color: ORIAN.text }} className="mt-2 text-base font-semibold">
              {system.name}
            </Text>
            <Text style={{ color: ORIAN.textFaint }} className="mt-0.5 text-sm">
              {system.detail}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{ backgroundColor: ORIAN.panel, borderColor: ORIAN.border }}
        className="mt-6 rounded-2xl border p-5"
      >
        <Text style={{ color: ORIAN.text }} className="text-base font-semibold">
          What comes next
        </Text>
        <Text style={{ color: ORIAN.textMuted }} className="mt-2 text-base leading-6">
          Two paths feed these panels. A read-only NMEA 2000 gateway on board for live data while underway, and the
          Sentinel cloud API for remote monitoring while she sits on the berth. Both write into one store, so the
          panels read the same shape whichever source is live.
        </Text>
      </View>
    </ScrollView>
  );
}
