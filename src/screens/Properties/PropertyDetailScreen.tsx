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
      onNewLease={() => navigation.navigate(PROPERTIES_ROUTES.LeaseForm, { propertyId: id })}
      onOpenLease={(leaseId) => navigation.navigate(PROPERTIES_ROUTES.LeaseDetail, { id: leaseId })}
      onNewRentalIncome={() => navigation.navigate(PROPERTIES_ROUTES.RentalIncomeForm, { propertyId: id })}
      onOpenRentalIncome={(rentalIncomeId) => navigation.navigate(PROPERTIES_ROUTES.RentalIncomeForm, { id: rentalIncomeId, propertyId: id })}
      onNewDepreciationSchedule={() => navigation.navigate(PROPERTIES_ROUTES.DepreciationScheduleForm, { propertyId: id })}
      onOpenDepreciationSchedule={(depreciationScheduleId) =>
        navigation.navigate(PROPERTIES_ROUTES.DepreciationScheduleForm, { id: depreciationScheduleId, propertyId: id })
      }
    />
  );
}
