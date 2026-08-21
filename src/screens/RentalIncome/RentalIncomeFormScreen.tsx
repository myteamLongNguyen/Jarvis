import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useGetRentalIncomeQuery,
  useCreateRentalIncomeMutation,
  useUpdateRentalIncomeMutation,
  useGetLeasesQuery,
  useGetTenantsQuery,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';
import { RENTAL_INCOME_STATUSES } from '../../types/rental-income';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.RentalIncomeForm>;

interface FormValues {
  leaseId: string | undefined;
  periodStart: string;
  periodEnd: string;
  grossAmount: string;
  outgoingsReimbursed: string;
  gstAmount: string;
  agentCommission: string;
  otherDeductions: string;
  amountReceived: string;
  receivedDate: string;
  status: string;
  notes: string;
}

const validationSchema = Yup.object({
  periodStart: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .required('Required'),
  periodEnd: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .required('Required'),
  grossAmount: Yup.number().typeError('Must be a number').min(0).required('Required'),
  status: Yup.string().required('Required'),
});

export default function RentalIncomeFormScreen({ route, navigation }: Props) {
  const { id, propertyId } = route.params;
  const isEditing = Boolean(id);

  const existing = useGetRentalIncomeQuery(id as string, { skip: !id });
  const leases = useGetLeasesQuery({ propertyId, limit: 50 });
  const tenants = useGetTenantsQuery({ limit: 100 });
  const [createRentalIncome, createState] = useCreateRentalIncomeMutation();
  const [updateRentalIncome, updateState] = useUpdateRentalIncomeMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    (tenants.data?.items ?? []).forEach((t) => map.set(t.id, t.name));
    return map;
  }, [tenants.data]);

  const initialValues: FormValues = useMemo(() => {
    const r = existing.data;
    return {
      leaseId: r?.leaseId,
      periodStart: r?.periodStart ?? '',
      periodEnd: r?.periodEnd ?? '',
      grossAmount: r?.grossAmount !== undefined ? String(r.grossAmount) : '',
      outgoingsReimbursed: r?.outgoingsReimbursed !== undefined ? String(r.outgoingsReimbursed) : '',
      gstAmount: r?.gstAmount !== undefined ? String(r.gstAmount) : '',
      agentCommission: r?.agentCommission !== undefined ? String(r.agentCommission) : '',
      otherDeductions: r?.otherDeductions !== undefined ? String(r.otherDeductions) : '',
      amountReceived: r?.amountReceived !== undefined ? String(r.amountReceived) : '',
      receivedDate: r?.receivedDate ?? '',
      status: r?.status ?? 'EXPECTED',
      notes: r?.notes ?? '',
    };
  }, [existing.data]);

  if (isEditing && existing.isLoading) {
    return <QueryState isLoading isError={false}>{null}</QueryState>;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">{isEditing ? 'Edit rental income' : 'Record rental income'}</Text>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const body = {
            propertyId,
            leaseId: values.leaseId,
            periodStart: values.periodStart,
            periodEnd: values.periodEnd,
            grossAmount: Number(values.grossAmount),
            outgoingsReimbursed: values.outgoingsReimbursed ? Number(values.outgoingsReimbursed) : undefined,
            gstAmount: values.gstAmount ? Number(values.gstAmount) : undefined,
            agentCommission: values.agentCommission ? Number(values.agentCommission) : undefined,
            otherDeductions: values.otherDeductions ? Number(values.otherDeductions) : undefined,
            amountReceived: values.amountReceived ? Number(values.amountReceived) : undefined,
            receivedDate: values.receivedDate || undefined,
            status: values.status as (typeof RENTAL_INCOME_STATUSES)[number],
            notes: values.notes || undefined,
          };
          if (isEditing && id) {
            await updateRentalIncome({ id, body }).unwrap();
          } else {
            await createRentalIncome(body).unwrap();
          }
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View>
            <ChipPicker
              label="Lease (optional)"
              allowClear
              options={(leases.data?.items ?? []).map((l) => ({
                value: l.id,
                label: tenantNameById.get(l.tenantId) ?? l.tenantId,
              }))}
              value={values.leaseId}
              onChange={(v) => setFieldValue('leaseId', v)}
            />
            <FormField
              label="Period start (YYYY-MM-DD)"
              value={values.periodStart}
              onChangeText={handleChange('periodStart')}
              onBlur={handleBlur('periodStart')}
              placeholder="2026-07-01"
              error={errors.periodStart}
              touched={touched.periodStart}
            />
            <FormField
              label="Period end (YYYY-MM-DD)"
              value={values.periodEnd}
              onChangeText={handleChange('periodEnd')}
              onBlur={handleBlur('periodEnd')}
              placeholder="2026-07-31"
              error={errors.periodEnd}
              touched={touched.periodEnd}
            />
            <FormField
              label="Gross amount"
              value={values.grossAmount}
              onChangeText={handleChange('grossAmount')}
              onBlur={handleBlur('grossAmount')}
              keyboardType="decimal-pad"
              error={errors.grossAmount}
              touched={touched.grossAmount}
            />
            <FormField
              label="Outgoings reimbursed (optional)"
              value={values.outgoingsReimbursed}
              onChangeText={handleChange('outgoingsReimbursed')}
              onBlur={handleBlur('outgoingsReimbursed')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="GST amount (optional)"
              value={values.gstAmount}
              onChangeText={handleChange('gstAmount')}
              onBlur={handleBlur('gstAmount')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="Agent commission (optional)"
              value={values.agentCommission}
              onChangeText={handleChange('agentCommission')}
              onBlur={handleBlur('agentCommission')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="Other deductions (optional)"
              value={values.otherDeductions}
              onChangeText={handleChange('otherDeductions')}
              onBlur={handleBlur('otherDeductions')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="Amount received (optional)"
              value={values.amountReceived}
              onChangeText={handleChange('amountReceived')}
              onBlur={handleBlur('amountReceived')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="Received date (YYYY-MM-DD, optional)"
              value={values.receivedDate}
              onChangeText={handleChange('receivedDate')}
              onBlur={handleBlur('receivedDate')}
              placeholder="2026-07-09"
            />
            <ChipPicker
              label="Status"
              options={RENTAL_INCOME_STATUSES.map((s) => ({ value: s, label: s }))}
              value={values.status || undefined}
              onChange={(v) => setFieldValue('status', v ?? '')}
              error={touched.status ? errors.status : undefined}
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
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Record income'}</Text>}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
