import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertyDetailPane from '../Properties/PropertyDetailPane';
import { PERSONAL_PROPERTIES_ROUTES, PersonalPropertiesStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<
  PersonalPropertiesStackParamList,
  typeof PERSONAL_PROPERTIES_ROUTES.PersonalPropertyDetail
>;

export default function PersonalPropertyDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;

  return (
    <PropertyDetailPane
      id={id}
      onEdit={() => navigation.navigate(PERSONAL_PROPERTIES_ROUTES.PersonalPropertyForm, { id })}
      onDeleted={() => navigation.goBack()}
    />
  );
}
