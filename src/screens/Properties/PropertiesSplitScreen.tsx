import { useState } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertiesListPane from './PropertiesListPane';
import PropertiesListScreen from './PropertiesListScreen';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import PropertyDetailPane from './PropertyDetailPane';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';

const LIST_PANE_WIDTH = 380;

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.PropertiesList>;

export default function PropertiesSplitScreen(props: Props) {
  // The detail pane lives to the right of a 380pt list. On a phone there is no
  // room for it, so selecting a property pushed a pane that was off screen and
  // nothing appeared to happen. Phones get the list and a real detail screen.
  if (useCompactLayout()) {
    return <PropertiesListScreen {...props} />;
  }
  return <PropertiesSplitView {...props} />;
}

function PropertiesSplitView({ navigation }: Props) {
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
          onOpenTenants={() => navigation.navigate(PROPERTIES_ROUTES.TenantsList)}
        />
      </View>
      <View className="flex-1">
        {selectedId ? (
          <PropertyDetailPane
            key={selectedId}
            id={selectedId}
            onEdit={() => navigation.navigate(PROPERTIES_ROUTES.PropertyForm, { id: selectedId })}
            onDeleted={() => setSelectedId(undefined)}
            onNewLease={() => navigation.navigate(PROPERTIES_ROUTES.LeaseForm, { propertyId: selectedId })}
            onOpenLease={(leaseId) => navigation.navigate(PROPERTIES_ROUTES.LeaseDetail, { id: leaseId })}
            onNewRentalIncome={() => navigation.navigate(PROPERTIES_ROUTES.RentalIncomeForm, { propertyId: selectedId })}
            onOpenRentalIncome={(rentalIncomeId) =>
              navigation.navigate(PROPERTIES_ROUTES.RentalIncomeForm, { id: rentalIncomeId, propertyId: selectedId })
            }
            onNewDepreciationSchedule={() => navigation.navigate(PROPERTIES_ROUTES.DepreciationScheduleForm, { propertyId: selectedId })}
            onOpenDepreciationSchedule={(depreciationScheduleId) =>
              navigation.navigate(PROPERTIES_ROUTES.DepreciationScheduleForm, { id: depreciationScheduleId, propertyId: selectedId })
            }
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
