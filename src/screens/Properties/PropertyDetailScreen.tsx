import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertyDetailPane from './PropertyDetailPane';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.PropertyDetail>;

export default function PropertyDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;

  return (
    <PropertyDetailPane
      id={id}
      onEdit={() => navigation.navigate(PROPERTIES_ROUTES.PropertyForm, { id })}
      onDeleted={() => navigation.goBack()}
    />
  );
}
