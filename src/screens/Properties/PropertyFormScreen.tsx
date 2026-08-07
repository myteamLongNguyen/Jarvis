import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PropertyFormPane from './PropertyFormPane';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.PropertyForm>;

export default function PropertyFormScreen({ route, navigation }: Props) {
  return (
    <PropertyFormPane id={route.params?.id} defaultCategory="INVESTMENT" onSaved={() => navigation.goBack()} />
  );
}
