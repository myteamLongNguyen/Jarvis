import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useGetDepreciationScheduleQuery,
  useCreateDepreciationScheduleMutation,
  useUpdateDepreciationScheduleMutation,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';
import { DEPRECIATION_METHODS } from '../../types/depreciation-schedule';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.DepreciationScheduleForm>;

interface FormValues {
  financialYearStart: string;
  financialYearEnd: string;
  method: string;
  division40Amount: string;
  division43Amount: string;
  totalAmount: string;
  notes: string;
}

const dateSchema = Yup.string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .required('Required');

const validationSchema = Yup.object({
  financialYearStart: dateSchema,
  financialYearEnd: dateSchema,
  method: Yup.string().required('Method is required'),
  totalAmount: Yup.number().typeError('Must be a number').min(0).required('Total amount is required'),
});

export default function DepreciationScheduleFormScreen({ route, navigation }: Props) {
  const { id, propertyId } = route.params;
  const isEditing = Boolean(id);

  const existing = useGetDepreciationScheduleQuery(id as string, { skip: !id });
  const [createSchedule, createState] = useCreateDepreciationScheduleMutation();
  const [updateSchedule, updateState] = useUpdateDepreciationScheduleMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const initialValues: FormValues = useMemo(() => {
    const d = existing.data;
    return {
      financialYearStart: d?.financialYearStart ?? '',
      financialYearEnd: d?.financialYearEnd ?? '',
      method: d?.method ?? '',
      division40Amount: d?.division40Amount !== undefined ? String(d.division40Amount) : '',
      division43Amount: d?.division43Amount !== undefined ? String(d.division43Amount) : '',
      totalAmount: d?.totalAmount !== undefined ? String(d.totalAmount) : '',
      notes: d?.notes ?? '',
    };
  }, [existing.data]);

  if (isEditing && existing.isLoading) {
    return <QueryState isLoading isError={false}>{null}</QueryState>;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">
        {isEditing ? 'Edit depreciation entry' : 'New depreciation entry'}
      </Text>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const body = {
            propertyId,
            financialYearStart: values.financialYearStart,
            financialYearEnd: values.financialYearEnd,
            method: values.method as (typeof DEPRECIATION_METHODS)[number],
            division40Amount: values.division40Amount ? Number(values.division40Amount) : undefined,
            division43Amount: values.division43Amount ? Number(values.division43Amount) : undefined,
            totalAmount: Number(values.totalAmount),
            notes: values.notes || undefined,
          };
          if (isEditing && id) {
            await updateSchedule({ id, body }).unwrap();
          } else {
            await createSchedule(body).unwrap();
          }
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View>
            <FormField
              label="Financial year start (YYYY-MM-DD)"
              value={values.financialYearStart}
              onChangeText={handleChange('financialYearStart')}
              onBlur={handleBlur('financialYearStart')}
              placeholder="2025-07-01"
              error={errors.financialYearStart}
              touched={touched.financialYearStart}
            />
            <FormField
              label="Financial year end (YYYY-MM-DD)"
              value={values.financialYearEnd}
              onChangeText={handleChange('financialYearEnd')}
              onBlur={handleBlur('financialYearEnd')}
              placeholder="2026-06-30"
              error={errors.financialYearEnd}
              touched={touched.financialYearEnd}
            />
            <ChipPicker
              label="Method"
              options={DEPRECIATION_METHODS.map((m) => ({ value: m, label: m }))}
              value={values.method || undefined}
              onChange={(v) => setFieldValue('method', v ?? '')}
              error={touched.method ? errors.method : undefined}
            />
            <FormField
              label="Division 40 amount (plant & equipment, optional)"
              value={values.division40Amount}
              onChangeText={handleChange('division40Amount')}
              onBlur={handleBlur('division40Amount')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="Division 43 amount (capital works, optional)"
              value={values.division43Amount}
              onChangeText={handleChange('division43Amount')}
              onBlur={handleBlur('division43Amount')}
              keyboardType="decimal-pad"
            />
            <FormField
              label="Total amount"
              value={values.totalAmount}
              onChangeText={handleChange('totalAmount')}
              onBlur={handleBlur('totalAmount')}
              keyboardType="decimal-pad"
              error={errors.totalAmount}
              touched={touched.totalAmount}
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
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Create entry'}</Text>}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
