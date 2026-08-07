import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertyFormPane from '../Properties/PropertyFormPane';
import { PERSONAL_PROPERTIES_ROUTES, PersonalPropertiesStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<
  PersonalPropertiesStackParamList,
  typeof PERSONAL_PROPERTIES_ROUTES.PersonalPropertyForm
>;

export default function PersonalPropertyFormScreen({ route, navigation }: Props) {
  return (
    <PropertyFormPane id={route.params?.id} defaultCategory="PERSONAL" onSaved={() => navigation.goBack()} />
  );
}
