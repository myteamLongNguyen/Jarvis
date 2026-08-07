import { useState } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertiesListPane from './PropertiesListPane';
import PropertyDetailPane from './PropertyDetailPane';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';

const LIST_PANE_WIDTH = 380;

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.PropertiesList>;

export default function PropertiesSplitScreen({ navigation }: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <View className="flex-1 flex-row bg-slate-50">
      <View style={{ width: LIST_PANE_WIDTH }} className="border-r border-slate-200 bg-white">
        <PropertiesListPane
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => navigation.navigate(PROPERTIES_ROUTES.PropertyForm, {})}
          onOpenEntities={() => navigation.navigate(PROPERTIES_ROUTES.OwningEntitiesList)}
          onOpenAgents={() => navigation.navigate(PROPERTIES_ROUTES.ManagingAgentsList)}
        />
      </View>
      <View className="flex-1">
        {selectedId ? (
          <PropertyDetailPane
            key={selectedId}
            id={selectedId}
            onEdit={() => navigation.navigate(PROPERTIES_ROUTES.PropertyForm, { id: selectedId })}
            onDeleted={() => setSelectedId(undefined)}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base font-medium text-slate-400">Select a property to view details</Text>
          </View>
        )}
      </View>
    </View>
  );
}
