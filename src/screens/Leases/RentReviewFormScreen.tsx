import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGetRentReviewQuery, useCreateRentReviewMutation, useUpdateRentReviewMutation } from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';
import ScanPrefillBanner from '../../components/ScanPrefillBanner';
import { numberField } from '../../utils/formPrefill';
import { RENT_REVIEW_MECHANISMS } from '../../types/lease';
import { RENT_REVIEW_STATUSES } from '../../types/rent-review';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.RentReviewForm>;

interface FormValues {
  reviewDate: string;
  reviewType: string;
  oldRentAnnual: string;
  newRentAnnual: string;
  status: string;
  notes: string;
}

const validationSchema = Yup.object({
  reviewDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .required('Required'),
  reviewType: Yup.string().required('Required'),
  oldRentAnnual: Yup.number().typeError('Must be a number').min(0).required('Required'),
  newRentAnnual: Yup.number().typeError('Must be a number').min(0).required('Required'),
  status: Yup.string().required('Required'),
});

export default function RentReviewFormScreen({ route, navigation }: Props) {
  const { id, leaseId, prefill } = route.params;
  const isEditing = Boolean(id);

  const existing = useGetRentReviewQuery(id as string, { skip: !id });
  const [createRentReview, createState] = useCreateRentReviewMutation();
  const [updateRentReview, updateState] = useUpdateRentReviewMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const initialValues: FormValues = useMemo(() => {
    const r = existing.data;
    // Editing an existing record always wins; a scan only ever seeds a new one.
    const p = r ? undefined : prefill?.values;
    return {
      reviewDate: r?.reviewDate ?? p?.reviewDate ?? '',
      reviewType: r?.reviewType ?? p?.reviewType ?? '',
      oldRentAnnual: numberField(r?.oldRentAnnual ?? p?.oldRentAnnual),
      newRentAnnual: numberField(r?.newRentAnnual ?? p?.newRentAnnual),
      status: r?.status ?? 'COMPLETED',
      notes: r?.notes ?? '',
    };
  }, [existing.data, prefill]);

  if (isEditing && existing.isLoading) {
    return <QueryState isLoading isError={false}>{null}</QueryState>;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">{isEditing ? 'Edit rent review' : 'New rent review'}</Text>
      <ScanPrefillBanner visible={Boolean(prefill) && !isEditing} warnings={prefill?.warnings} />

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const oldRent = Number(values.oldRentAnnual);
          const newRent = Number(values.newRentAnnual);
          const percentChange = oldRent !== 0 ? ((newRent - oldRent) / oldRent) * 100 : 0;
          const body = {
            leaseId,
            reviewDate: values.reviewDate,
            reviewType: values.reviewType as (typeof RENT_REVIEW_MECHANISMS)[number],
            oldRentAnnual: oldRent,
            newRentAnnual: newRent,
            percentChange,
            status: values.status as (typeof RENT_REVIEW_STATUSES)[number],
            sourceDocumentId: prefill?.sourceDocumentId,
            notes: values.notes || undefined,
          };
          if (isEditing && id) {
            await updateRentReview({ id, body }).unwrap();
          } else {
            await createRentReview(body).unwrap();
          }
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View>
            <FormField
              label="Review date (YYYY-MM-DD)"
              value={values.reviewDate}
              onChangeText={handleChange('reviewDate')}
              onBlur={handleBlur('reviewDate')}
              placeholder="2027-06-24"
              error={errors.reviewDate}
              touched={touched.reviewDate}
            />
            <ChipPicker
              label="Review type"
              options={RENT_REVIEW_MECHANISMS.map((m) => ({ value: m, label: m }))}
              value={values.reviewType || undefined}
              onChange={(v) => setFieldValue('reviewType', v ?? '')}
              error={touched.reviewType ? errors.reviewType : undefined}
            />
            <FormField
              label="Old annual rent"
              value={values.oldRentAnnual}
              onChangeText={handleChange('oldRentAnnual')}
              onBlur={handleBlur('oldRentAnnual')}
              keyboardType="decimal-pad"
              error={errors.oldRentAnnual}
              touched={touched.oldRentAnnual}
            />
            <FormField
              label="New annual rent"
              value={values.newRentAnnual}
              onChangeText={handleChange('newRentAnnual')}
              onBlur={handleBlur('newRentAnnual')}
              keyboardType="decimal-pad"
              error={errors.newRentAnnual}
              touched={touched.newRentAnnual}
            />
            {values.oldRentAnnual && values.newRentAnnual && Number(values.oldRentAnnual) !== 0 ? (
              <Text className="mb-3 -mt-2 text-xs text-slate-500">
                {(((Number(values.newRentAnnual) - Number(values.oldRentAnnual)) / Number(values.oldRentAnnual)) * 100).toFixed(2)}% change
              </Text>
            ) : null}
            <ChipPicker
              label="Status"
              options={RENT_REVIEW_STATUSES.map((s) => ({ value: s, label: s }))}
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
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Create review'}</Text>}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
