import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useCheckInvoiceDuplicateMutation,
  useCreateInvoiceMutation,
  useGetPropertiesQuery,
  useScanInvoiceDocumentMutation,
  useUploadDocumentMutation,
} from '../../api/jarvisApi';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { INVOICES_ROUTES, InvoicesStackParamList } from '../../navigation/routes';
import ScanPrefillBanner from '../../components/ScanPrefillBanner';
import { numberField } from '../../utils/formPrefill';
import {
  DuplicateMatch,
  INVOICE_DIRECTIONS,
  INVOICE_TYPES,
  InvoiceDirection,
  InvoiceScanResult,
  InvoiceType,
} from '../../types/invoice';

type Props = NativeStackScreenProps<InvoicesStackParamList, typeof INVOICES_ROUTES.InvoiceForm>;

interface PendingFile {
  uri: string;
  name: string;
  type: string;
}

interface FormValues {
  direction: string;
  invoiceType: string;
  invoiceNumber: string;
  issuerName: string;
  issuerAbn: string;
  issueDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
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
  periodStart: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
  periodEnd: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
  subtotal: Yup.number().typeError('Must be a number').min(0).required('Subtotal is required'),
  gstAmount: Yup.number().typeError('Must be a number').min(0).required('GST amount is required'),
  totalAmount: Yup.number().typeError('Must be a number').min(0).required('Total amount is required'),
  currency: Yup.string().required('Currency is required'),
});

/**
 * Copies whatever the scan came back with into the form. Fields the scan
 * couldn't find are left alone rather than blanked, so re-scanning a second
 * file never wipes something the user already typed.
 */
function applyScanSuggestion(
  suggestion: InvoiceScanResult,
  setFieldValue: (field: string, value: unknown) => void,
) {
  const setText = (field: keyof FormValues, value: string | undefined) => {
    if (value) setFieldValue(field, value);
  };
  const setNumber = (field: keyof FormValues, value: number | undefined) => {
    if (value !== undefined) setFieldValue(field, String(value));
  };

  if (suggestion.propertyId) setFieldValue('propertyId', suggestion.propertyId);
  setText('direction', suggestion.direction);
  setText('invoiceType', suggestion.invoiceType);
  setText('invoiceNumber', suggestion.invoiceNumber);
  setText('issuerName', suggestion.issuerName);
  setText('issuerAbn', suggestion.issuerAbn);
  setText('issueDate', suggestion.issueDate);
  setText('dueDate', suggestion.dueDate);
  setText('periodStart', suggestion.periodStart);
  setText('periodEnd', suggestion.periodEnd);
  setText('currency', suggestion.currency);
  setNumber('subtotal', suggestion.subtotal);
  setNumber('gstAmount', suggestion.gstAmount);
  setNumber('totalAmount', suggestion.totalAmount);
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

/** Money as Andrew reads it on a statement. */
const money = (value: number) =>
  `$${value.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Shows what the invoice looks like a repeat of and waits for an answer.
 *
 * Saving is never blocked, because two identical bills on one day do happen.
 * What the person cannot do is notice on their own, so the check reports and
 * they decide.
 */
function confirmDespiteDuplicates(matches: DuplicateMatch[]): Promise<boolean> {
  const [first] = matches;
  const others = matches.length > 1 ? `\n\nThere are ${matches.length - 1} more like it.` : '';
  const detail = [
    first.reason,
    '',
    `${first.issuerName}${first.invoiceNumber ? ` · invoice ${first.invoiceNumber}` : ''}`,
    `${money(first.totalAmount)} · ${first.issueDate} · ${first.status}`,
  ].join('\n');

  return new Promise((resolve) => {
    Alert.alert('You may already have this one', detail + others, [
      { text: 'Go back', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Save anyway', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function InvoiceFormScreen({ route, navigation }: Props) {
  // Set when Smart Scan sent the user here. By then the document is already
  // uploaded and filed, so this screen only has to show the values and take a confirm.
  const prefill = route.params?.prefill;
  const properties = useGetPropertiesQuery({ limit: 200 });
  const [createInvoice, createState] = useCreateInvoiceMutation();
  const [checkDuplicate] = useCheckInvoiceDuplicateMutation();
  const [scanInvoiceDocument, scanState] = useScanInvoiceDocumentMutation();
  const [uploadDocument, uploadState] = useUploadDocumentMutation();

  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [scanResult, setScanResult] = useState<InvoiceScanResult | null>(null);

  const isSubmitting = createState.isLoading || uploadState.isLoading;

  const scanWarnings = useMemo(() => {
    const warnings = [...(prefill?.warnings ?? [])];
    const lineItemCount = prefill?.values.lineItems?.length ?? 0;
    if (lineItemCount > 0) {
      warnings.push(
        lineItemCount +
          ' line items were read off this invoice, but this form saves a single total — add them after saving.',
      );
    }
    return warnings;
  }, [prefill]);

  const initialValues: FormValues = useMemo(() => {
    const p = prefill?.values;
    return {
      direction: p?.direction ?? 'INCOMING',
      invoiceType: p?.invoiceType ?? '',
      invoiceNumber: p?.invoiceNumber ?? '',
      issuerName: p?.issuerName ?? '',
      issuerAbn: p?.issuerAbn ?? '',
      issueDate: p?.issueDate ?? '',
      dueDate: p?.dueDate ?? '',
      periodStart: p?.periodStart ?? '',
      periodEnd: p?.periodEnd ?? '',
      subtotal: numberField(p?.subtotal),
      gstAmount: numberField(p?.gstAmount),
      totalAmount: numberField(p?.totalAmount),
      currency: p?.currency ?? 'AUD',
      propertyId: p?.propertyId,
      notes: '',
    };
  }, [prefill]);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">New invoice</Text>
      <ScanPrefillBanner visible={Boolean(prefill)} warnings={scanWarnings} />

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          let sourceDocumentId: string | undefined;

          if (pendingFile) {
            try {
              const document = await uploadDocument({
                propertyId: values.propertyId,
                documentType: 'INVOICE',
                title: values.issuerName || pendingFile.name,
                documentDate: values.issueDate,
                file: pendingFile,
              }).unwrap();
              sourceDocumentId = document.id;
            } catch {
              Alert.alert('Upload failed', "Couldn't upload the invoice file. Saving the invoice without it.");
            }
          }

          // Asked after the upload, because the file's checksum is the one
          // duplicate signal that cannot be wrong and it only exists once the
          // document is stored.
          const matches = await checkDuplicate({
            propertyId: values.propertyId,
            invoiceType: values.invoiceType,
            invoiceNumber: values.invoiceNumber || undefined,
            issuerName: values.issuerName,
            issuerAbn: values.issuerAbn || undefined,
            issueDate: values.issueDate,
            periodStart: values.periodStart || undefined,
            periodEnd: values.periodEnd || undefined,
            totalAmount: Number(values.totalAmount),
            sourceDocumentId: sourceDocumentId ?? prefill?.sourceDocumentId,
          })
            .unwrap()
            // A check that cannot run must not stop the invoice being saved.
            .catch(() => [] as DuplicateMatch[]);

          if (matches.length > 0 && !(await confirmDespiteDuplicates(matches))) {
            return;
          }

          await createInvoice({
            direction: values.direction as InvoiceDirection,
            invoiceType: values.invoiceType as InvoiceType,
            invoiceNumber: values.invoiceNumber || undefined,
            issuerName: values.issuerName,
            issuerAbn: values.issuerAbn || undefined,
            issueDate: values.issueDate,
            dueDate: values.dueDate || undefined,
            periodStart: values.periodStart || undefined,
            periodEnd: values.periodEnd || undefined,
            subtotal: Number(values.subtotal),
            gstAmount: Number(values.gstAmount),
            totalAmount: Number(values.totalAmount),
            currency: values.currency,
            propertyId: values.propertyId,
            sourceDocumentId: sourceDocumentId ?? prefill?.sourceDocumentId,
            notes: values.notes || undefined,
          }).unwrap();
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => {
          const handlePickInvoiceFile = async () => {
            const result = await DocumentPicker.getDocumentAsync({
              type: ['application/pdf', 'image/*'],
              copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets[0]) return;

            const asset = result.assets[0];
            const file: PendingFile = { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' };
            setPendingFile(file);
            setScanResult(null);

            try {
              const suggestion = await scanInvoiceDocument(file).unwrap();
              applyScanSuggestion(suggestion, setFieldValue);
              setScanResult(suggestion);
            } catch {
              // The scan is best-effort — leave the form as-is and let the user type.
            }
          };

          return (
            <View>
              {prefill ? null : (
                <View className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <Text className="mb-1 text-sm font-semibold text-slate-900">Scan invoice file (optional)</Text>
                  <Text className="mb-3 text-xs text-slate-500">
                    Attach the invoice PDF/photo and AI will read it to fill in the fields below. It can misread a
                    document, so always check the values before saving.
                  </Text>
                  <Pressable
                    className="items-center rounded-lg border border-slate-300 bg-white py-2.5"
                    onPress={handlePickInvoiceFile}
                    disabled={scanState.isLoading}
                  >
                    {scanState.isLoading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text className="text-sm font-semibold text-slate-700">
                        {pendingFile ? 'Replace file' : 'Attach invoice file'}
                      </Text>
                    )}
                  </Pressable>
                  {pendingFile ? (
                    <View className="mt-2">
                      <Text className="text-xs text-slate-600" numberOfLines={1}>
                        {pendingFile.name}
                      </Text>
                      {scanResult ? (
                        <Text className="mt-1 text-xs text-slate-600">
                          {scanResult.extractedBy === 'AI'
                            ? 'Read by AI'
                            : 'Filename match only — AI could not read this file'}
                          {scanResult.propertyMatchConfidence
                            ? ` · property match: ${scanResult.propertyMatchConfidence.toLowerCase()} confidence`
                            : ''}
                          {scanResult.lineItems?.length
                            ? ` · ${scanResult.lineItems.length} line items found (add them after saving)`
                            : ''}
                        </Text>
                      ) : null}
                      {scanResult?.notes ? (
                        <Text className="mt-1 text-xs text-amber-700">{scanResult.notes}</Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              )}

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
                label="Invoice number (optional)"
                value={values.invoiceNumber}
                onChangeText={handleChange('invoiceNumber')}
                onBlur={handleBlur('invoiceNumber')}
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
                label="Period start (optional, YYYY-MM-DD)"
                value={values.periodStart}
                onChangeText={handleChange('periodStart')}
                onBlur={handleBlur('periodStart')}
                placeholder="2026-07-01"
                error={errors.periodStart}
                touched={touched.periodStart}
              />
              <FormField
                label="Period end (optional, YYYY-MM-DD)"
                value={values.periodEnd}
                onChangeText={handleChange('periodEnd')}
                onBlur={handleBlur('periodEnd')}
                placeholder="2026-07-31"
                error={errors.periodEnd}
                touched={touched.periodEnd}
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

              {pendingFile ? (
                <Text className="mt-4 text-xs text-slate-500">
                  Attaching a file marks this invoice PAID immediately (today, for the full total) — the invoice document
                  itself is treated as proof of payment for now.
                </Text>
              ) : null}

              <Pressable
                className="mt-4 items-center rounded-lg bg-slate-900 py-3"
                disabled={isSubmitting}
                onPress={() => handleSubmit()}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">Create invoice</Text>}
              </Pressable>
            </View>
          );
        }}
      </Formik>
    </ScrollView>
  );
}
