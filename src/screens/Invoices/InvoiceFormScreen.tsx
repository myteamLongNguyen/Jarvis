import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCreateInvoiceMutation, useGetPropertiesQuery } from '../../api/jarvisApi';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { INVOICES_ROUTES, InvoicesStackParamList } from '../../navigation/routes';
import { INVOICE_DIRECTIONS, INVOICE_TYPES, InvoiceDirection, InvoiceType } from '../../types/invoice';

type Props = NativeStackScreenProps<InvoicesStackParamList, typeof INVOICES_ROUTES.InvoiceForm>;

interface FormValues {
  direction: string;
  invoiceType: string;
  issuerName: string;
  issuerAbn: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  gstAmount: string;
  totalAmount: string;
  currency: string;
  propertyId: string | undefined;
  notes: string;
}

const validationSchema = Yup.object({
  direction: Yup.string().required('Direction is required'),
  invoiceType: Yup.string().required('Invoice type is required'),
  issuerName: Yup.string().required('Issuer name is required'),
  issueDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .required('Issue date is required'),
  dueDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
  subtotal: Yup.number().typeError('Must be a number').min(0).required('Subtotal is required'),
  gstAmount: Yup.number().typeError('Must be a number').min(0).required('GST amount is required'),
  totalAmount: Yup.number().typeError('Must be a number').min(0).required('Total amount is required'),
  currency: Yup.string().required('Currency is required'),
});

export default function InvoiceFormScreen({ navigation }: Props) {
  const properties = useGetPropertiesQuery({ limit: 200 });
  const [createInvoice, createState] = useCreateInvoiceMutation();

  const initialValues: FormValues = useMemo(
    () => ({
      direction: 'INCOMING',
      invoiceType: '',
      issuerName: '',
      issuerAbn: '',
      issueDate: '',
      dueDate: '',
      subtotal: '',
      gstAmount: '',
      totalAmount: '',
      currency: 'AUD',
      propertyId: undefined,
      notes: '',
    }),
    [],
  );

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">New invoice</Text>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          await createInvoice({
            direction: values.direction as InvoiceDirection,
            invoiceType: values.invoiceType as InvoiceType,
            issuerName: values.issuerName,
            issuerAbn: values.issuerAbn || undefined,
            issueDate: values.issueDate,
            dueDate: values.dueDate || undefined,
            subtotal: Number(values.subtotal),
            gstAmount: Number(values.gstAmount),
            totalAmount: Number(values.totalAmount),
            currency: values.currency,
            propertyId: values.propertyId,
            notes: values.notes || undefined,
          }).unwrap();
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View>
            <ChipPicker
              label="Direction"
              options={INVOICE_DIRECTIONS.map((d) => ({ value: d, label: d }))}
              value={values.direction || undefined}
              onChange={(v) => setFieldValue('direction', v ?? '')}
              error={touched.direction ? errors.direction : undefined}
            />
            <ChipPicker
              label="Invoice type"
              options={INVOICE_TYPES.map((t) => ({ value: t, label: t }))}
              value={values.invoiceType || undefined}
              onChange={(v) => setFieldValue('invoiceType', v ?? '')}
              error={touched.invoiceType ? errors.invoiceType : undefined}
            />
            <FormField
              label="Issuer name"
              value={values.issuerName}
              onChangeText={handleChange('issuerName')}
              onBlur={handleBlur('issuerName')}
              error={errors.issuerName}
              touched={touched.issuerName}
            />
            <FormField
              label="Issuer ABN (optional)"
              value={values.issuerAbn}
              onChangeText={handleChange('issuerAbn')}
              onBlur={handleBlur('issuerAbn')}
            />
            <FormField
              label="Issue date (YYYY-MM-DD)"
              value={values.issueDate}
              onChangeText={handleChange('issueDate')}
              onBlur={handleBlur('issueDate')}
              placeholder="2026-07-31"
              error={errors.issueDate}
              touched={touched.issueDate}
            />
            <FormField
              label="Due date (optional, YYYY-MM-DD)"
              value={values.dueDate}
              onChangeText={handleChange('dueDate')}
              onBlur={handleBlur('dueDate')}
              placeholder="2026-08-14"
              error={errors.dueDate}
              touched={touched.dueDate}
            />
            <FormField
              label="Subtotal"
              value={values.subtotal}
              onChangeText={handleChange('subtotal')}
              onBlur={handleBlur('subtotal')}
              keyboardType="decimal-pad"
              error={errors.subtotal}
              touched={touched.subtotal}
            />
            <FormField
              label="GST amount"
              value={values.gstAmount}
              onChangeText={handleChange('gstAmount')}
              onBlur={handleBlur('gstAmount')}
              keyboardType="decimal-pad"
              error={errors.gstAmount}
              touched={touched.gstAmount}
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
              label="Currency"
              value={values.currency}
              onChangeText={handleChange('currency')}
              onBlur={handleBlur('currency')}
              autoCapitalize="characters"
              error={errors.currency}
              touched={touched.currency}
            />

            <ChipPicker
              label="Property (optional — leave blank to sort later)"
              allowClear
              options={(properties.data?.items ?? []).map((p) => ({ value: p.id, label: p.name }))}
              value={values.propertyId}
              onChange={(v) => setFieldValue('propertyId', v)}
            />

            <FormField
              label="Notes (optional)"
              value={values.notes}
              onChangeText={handleChange('notes')}
              onBlur={handleBlur('notes')}
              multiline
              numberOfLines={4}
            />

            <Pressable
              className="mt-4 items-center rounded-lg bg-slate-900 py-3"
              disabled={createState.isLoading}
              onPress={() => handleSubmit()}
            >
              {createState.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-semibold text-white">Create invoice</Text>
              )}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
