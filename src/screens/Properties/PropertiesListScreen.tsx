import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertiesListPane from './PropertiesListPane';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.PropertiesList>;

export default function PropertiesListScreen({ navigation }: Props) {
  return (
    <PropertiesListPane
      onSelect={(id) => navigation.navigate(PROPERTIES_ROUTES.PropertyDetail, { id })}
      onCreate={() => navigation.navigate(PROPERTIES_ROUTES.PropertyForm, {})}
      onOpenEntities={() => navigation.navigate(PROPERTIES_ROUTES.OwningEntitiesList)}
      onOpenAgents={() => navigation.navigate(PROPERTIES_ROUTES.ManagingAgentsList)}
      onOpenTenants={() => navigation.navigate(PROPERTIES_ROUTES.TenantsList)}
    />
  );
}
