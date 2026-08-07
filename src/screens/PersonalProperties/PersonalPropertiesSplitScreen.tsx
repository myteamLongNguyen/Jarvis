import { useState } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertiesListPane from '../Properties/PropertiesListPane';
import PropertyDetailPane from '../Properties/PropertyDetailPane';
import { PERSONAL_PROPERTIES_ROUTES, PersonalPropertiesStackParamList } from '../../navigation/routes';

const LIST_PANE_WIDTH = 380;

type Props = NativeStackScreenProps<
  PersonalPropertiesStackParamList,
  typeof PERSONAL_PROPERTIES_ROUTES.PersonalPropertiesList
>;

export default function PersonalPropertiesSplitScreen({ navigation }: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <View className="flex-1 flex-row bg-slate-50">
      <View style={{ width: LIST_PANE_WIDTH }} className="border-r border-slate-200 bg-white">
        <PropertiesListPane
          category="PERSONAL"
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => navigation.navigate(PERSONAL_PROPERTIES_ROUTES.PersonalPropertyForm, {})}
        />
      </View>
      <View className="flex-1">
        {selectedId ? (
          <PropertyDetailPane
            key={selectedId}
            id={selectedId}
            onEdit={() => navigation.navigate(PERSONAL_PROPERTIES_ROUTES.PersonalPropertyForm, { id: selectedId })}
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
