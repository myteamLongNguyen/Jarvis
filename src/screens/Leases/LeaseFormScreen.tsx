import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useGetLeaseQuery,
  useCreateLeaseMutation,
  useUpdateLeaseMutation,
  useGetTenantsQuery,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';
import ScanPrefillBanner from '../../components/ScanPrefillBanner';
import { numberField } from '../../utils/formPrefill';
import {
  BOND_TYPES,
  LEASE_STATUSES,
  OUTGOINGS_RECOVERY_TYPES,
  RENT_FREQUENCIES,
  RENT_REVIEW_MECHANISMS,
} from '../../types/lease';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.LeaseForm>;

interface FormValues {
  tenantId: string | undefined;
  status: string;
  commencementDate: string;
  expiryDate: string;
  initialTermMonths: string;
  baseRentAnnual: string;
  rentFrequency: string;
  outgoingsRecoveryType: string;
  rentReviewMechanism: string;
  rentReviewValue: string;
  nextReviewDate: string;
  rentFreePeriodMonths: string;
  bondAmount: string;
  bondType: string;
  notes: string;
}

const dateSchema = Yup.string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .required('Required');

const validationSchema = Yup.object({
  tenantId: Yup.string().required('Tenant is required'),
  status: Yup.string().required('Status is required'),
  commencementDate: dateSchema,
  expiryDate: dateSchema,
  initialTermMonths: Yup.number().typeError('Must be a number').min(0).required('Required'),
  baseRentAnnual: Yup.number().typeError('Must be a number').min(0).required('Required'),
  rentFrequency: Yup.string().required('Required'),
  outgoingsRecoveryType: Yup.string().required('Required'),
  rentReviewMechanism: Yup.string().required('Required'),
  bondAmount: Yup.number().typeError('Must be a number').min(0).required('Required'),
  bondType: Yup.string().required('Required'),
});

export default function LeaseFormScreen({ route, navigation }: Props) {
  const { id, propertyId, prefill } = route.params;
  const isEditing = Boolean(id);

  const existing = useGetLeaseQuery(id as string, { skip: !id });
  const tenants = useGetTenantsQuery({ limit: 100 });
  const [createLease, createState] = useCreateLeaseMutation();
  const [updateLease, updateState] = useUpdateLeaseMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  // The scan gives us the tenant name printed on the lease; the form needs a tenant
  // record. Match on name, and leave the picker empty when there's no match rather
  // than guessing — the banner tells the user to pick one.
  const scannedTenantName = prefill?.values.tenantName;
  const scannedTenantId = useMemo(() => {
    if (!scannedTenantName) return undefined;
    const wanted = scannedTenantName.trim().toLowerCase();
    return (tenants.data?.items ?? []).find((t) => t.name.trim().toLowerCase() === wanted)?.id;
  }, [scannedTenantName, tenants.data]);

  const scanWarnings = useMemo(() => {
    const warnings = [...(prefill?.warnings ?? [])];
    if (scannedTenantName && !scannedTenantId) {
      warnings.push(
        'The lease names ' +
          scannedTenantName +
          ', but no tenant on file has that name. Use the button under the tenant list to add them.',
      );
    }
    return warnings;
  }, [prefill, scannedTenantName, scannedTenantId]);

  const initialValues: FormValues = useMemo(() => {
    const l = existing.data;
    // Editing an existing lease always wins; a scan only ever seeds a new one.
    const p = l ? undefined : prefill?.values;
    return {
      tenantId: l?.tenantId ?? scannedTenantId,
      status: l?.status ?? p?.status ?? 'DRAFT',
      commencementDate: l?.commencementDate ?? p?.commencementDate ?? '',
      expiryDate: l?.expiryDate ?? p?.expiryDate ?? '',
      initialTermMonths: numberField(l?.initialTermMonths ?? p?.initialTermMonths),
      baseRentAnnual: numberField(l?.baseRentAnnual ?? p?.baseRentAnnual),
      rentFrequency: l?.rentFrequency ?? p?.rentFrequency ?? '',
      outgoingsRecoveryType: l?.outgoingsRecoveryType ?? p?.outgoingsRecoveryType ?? '',
      rentReviewMechanism: l?.rentReviewMechanism ?? p?.rentReviewMechanism ?? '',
      rentReviewValue: numberField(l?.rentReviewValue ?? p?.rentReviewValue),
      nextReviewDate: l?.nextReviewDate ?? p?.nextReviewDate ?? '',
      rentFreePeriodMonths: numberField(l?.rentFreePeriodMonths ?? p?.rentFreePeriodMonths),
      bondAmount: numberField(l?.bondAmount ?? p?.bondAmount) || '0',
      bondType: l?.bondType ?? p?.bondType ?? '',
      notes: l?.notes ?? '',
    };
  }, [existing.data, prefill, scannedTenantId]);

  if (isEditing && existing.isLoading) {
    return <QueryState isLoading isError={false}>{null}</QueryState>;
  }

  if (!isEditing && !tenants.isLoading && (tenants.data?.items.length ?? 0) === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-base font-medium text-slate-500">
          No tenants yet — add a tenant first before creating a lease.
        </Text>
        <Pressable
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2"
          onPress={() => navigation.navigate(PROPERTIES_ROUTES.TenantForm, {})}
        >
          <Text className="text-sm font-semibold text-white">+ New tenant</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">{isEditing ? 'Edit lease' : 'New lease'}</Text>
      <ScanPrefillBanner visible={Boolean(prefill) && !isEditing} warnings={scanWarnings} />

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const body = {
            propertyId,
            tenantId: values.tenantId as string,
            status: values.status as (typeof LEASE_STATUSES)[number],
            commencementDate: values.commencementDate,
            expiryDate: values.expiryDate,
            initialTermMonths: Number(values.initialTermMonths),
            baseRentAnnual: Number(values.baseRentAnnual),
            rentFrequency: values.rentFrequency as (typeof RENT_FREQUENCIES)[number],
            outgoingsRecoveryType: values.outgoingsRecoveryType as (typeof OUTGOINGS_RECOVERY_TYPES)[number],
            rentReviewMechanism: values.rentReviewMechanism as (typeof RENT_REVIEW_MECHANISMS)[number],
            rentReviewValue: values.rentReviewValue ? Number(values.rentReviewValue) : undefined,
            nextReviewDate: values.nextReviewDate || undefined,
            rentFreePeriodMonths: values.rentFreePeriodMonths ? Number(values.rentFreePeriodMonths) : undefined,
            bondAmount: Number(values.bondAmount),
            bondType: values.bondType as (typeof BOND_TYPES)[number],
            notes: values.notes || undefined,
          };
          if (isEditing && id) {
            await updateLease({ id, body }).unwrap();
          } else {
            await createLease(body).unwrap();
          }
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View>
            <ChipPicker
              label="Tenant"
              options={(tenants.data?.items ?? []).map((t) => ({ value: t.id, label: t.name }))}
              value={values.tenantId}
              onChange={(v) => setFieldValue('tenantId', v)}
              error={touched.tenantId ? (errors.tenantId as string | undefined) : undefined}
            />
            {/* A lease cannot be saved without a tenant, and the tenant named on
                a scanned lease is usually not on file yet. Without a way out
                from here the form is a dead end: the scan banner says to create
                the tenant, and there is nowhere to do it. */}
            <Pressable
              onPress={() => navigation.navigate(PROPERTIES_ROUTES.TenantForm, { name: scannedTenantName })}
              className="mb-4 self-start rounded-lg border border-slate-300 px-3 py-2"
            >
              <Text className="text-sm font-semibold text-slate-700">
                {scannedTenantName && !scannedTenantId ? `+ Add "${scannedTenantName}"` : '+ New tenant'}
              </Text>
            </Pressable>
            <ChipPicker
              label="Status"
              options={LEASE_STATUSES.map((s) => ({ value: s, label: s }))}
              value={values.status || undefined}
              onChange={(v) => setFieldValue('status', v ?? '')}
              error={touched.status ? errors.status : undefined}
            />

            <FormField
              label="Commencement date (YYYY-MM-DD)"
              value={values.commencementDate}
              onChangeText={handleChange('commencementDate')}
              onBlur={handleBlur('commencementDate')}
              placeholder="2026-01-01"
              error={errors.commencementDate}
              touched={touched.commencementDate}
            />
            <FormField
              label="Expiry date (YYYY-MM-DD)"
              value={values.expiryDate}
              onChangeText={handleChange('expiryDate')}
              onBlur={handleBlur('expiryDate')}
              placeholder="2033-01-01"
              error={errors.expiryDate}
              touched={touched.expiryDate}
            />
            <FormField
              label="Initial term (months)"
              value={values.initialTermMonths}
              onChangeText={handleChange('initialTermMonths')}
              onBlur={handleBlur('initialTermMonths')}
              keyboardType="number-pad"
              error={errors.initialTermMonths}
              touched={touched.initialTermMonths}
            />

            <FormField
              label="Base rent annual (excl. GST)"
              value={values.baseRentAnnual}
              onChangeText={handleChange('baseRentAnnual')}
              onBlur={handleBlur('baseRentAnnual')}
              keyboardType="decimal-pad"
              error={errors.baseRentAnnual}
              touched={touched.baseRentAnnual}
            />
            <ChipPicker
              label="Rent frequency"
              options={RENT_FREQUENCIES.map((f) => ({ value: f, label: f }))}
              value={values.rentFrequency || undefined}
              onChange={(v) => setFieldValue('rentFrequency', v ?? '')}
              error={touched.rentFrequency ? errors.rentFrequency : undefined}
            />
            <ChipPicker
              label="Outgoings recovery"
              options={OUTGOINGS_RECOVERY_TYPES.map((o) => ({ value: o, label: o }))}
              value={values.outgoingsRecoveryType || undefined}
              onChange={(v) => setFieldValue('outgoingsRecoveryType', v ?? '')}
              error={touched.outgoingsRecoveryType ? errors.outgoingsRecoveryType : undefined}
            />

            <ChipPicker
              label="Rent review mechanism"
              options={RENT_REVIEW_MECHANISMS.map((m) => ({ value: m, label: m }))}
              value={values.rentReviewMechanism || undefined}
              onChange={(v) => setFieldValue('rentReviewMechanism', v ?? '')}
              error={touched.rentReviewMechanism ? errors.rentReviewMechanism : undefined}
            />
            <FormField
              label="Rent review value (%, optional)"
              value={values.rentReviewValue}
              onChangeText={handleChange('rentReviewValue')}
              onBlur={handleBlur('rentReviewValue')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="Next review date (YYYY-MM-DD, optional)"
              value={values.nextReviewDate}
              onChangeText={handleChange('nextReviewDate')}
              onBlur={handleBlur('nextReviewDate')}
              placeholder="2027-01-01"
            />
            <FormField
              label="Rent-free period (months, optional)"
              value={values.rentFreePeriodMonths}
              onChangeText={handleChange('rentFreePeriodMonths')}
              onBlur={handleBlur('rentFreePeriodMonths')}
              keyboardType="number-pad"
            />

            <FormField
              label="Bond amount"
              value={values.bondAmount}
              onChangeText={handleChange('bondAmount')}
              onBlur={handleBlur('bondAmount')}
              keyboardType="decimal-pad"
              error={errors.bondAmount}
              touched={touched.bondAmount}
            />
            <ChipPicker
              label="Bond type"
              options={BOND_TYPES.map((b) => ({ value: b, label: b }))}
              value={values.bondType || undefined}
              onChange={(v) => setFieldValue('bondType', v ?? '')}
              error={touched.bondType ? errors.bondType : undefined}
            />

            <FormField
              label="Notes (optional)"
              value={values.notes}
              onChangeText={handleChange('notes')}
              onBlur={handleBlur('notes')}
              multiline
              numberOfLines={4}
            />

            <Pressable className="mt-4 items-center rounded-lg bg-slate-900 py-3" disabled={isSubmitting} onPress={() => handleSubmit()}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Create lease'}</Text>}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
