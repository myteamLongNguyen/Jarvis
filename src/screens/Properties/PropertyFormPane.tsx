import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetOwningEntitiesQuery,
  useGetManagingAgentsQuery,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import { numberField } from '../../utils/formPrefill';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { PROPERTY_STATUSES, PROPERTY_TYPES, PropertyCategory } from '../../types/property';

interface Props {
  id?: string;
  defaultCategory?: PropertyCategory;
  onSaved: () => void;
}

interface FormValues {
  name: string;
  addressLine1: string;
  addressLine2: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  propertyType: string;
  status: string;
  purchaseDate: string;
  purchasePrice: string;
  purchaseCosts: string;
  purchaseCurrency: string;
  landAreaSqm: string;
  buildingAreaSqm: string;
  ownedByEntityId: string | undefined;
  managingAgentId: string | undefined;
  notes: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  addressLine1: Yup.string().required('Address is required'),
  suburb: Yup.string().required('Suburb is required'),
  state: Yup.string().required('State is required'),
  postcode: Yup.string().required('Postcode is required'),
  country: Yup.string().required('Country is required'),
  propertyType: Yup.string().required('Property type is required'),
  status: Yup.string().required('Status is required'),
  purchaseDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .required('Purchase date is required'),
  purchasePrice: Yup.number().typeError('Must be a number').min(0).required('Purchase price is required'),
  purchaseCosts: Yup.number().typeError('Must be a number').min(0).required('Purchase costs are required'),
  purchaseCurrency: Yup.string().required('Currency is required'),
  landAreaSqm: Yup.number().typeError('Must be a number').optional(),
  buildingAreaSqm: Yup.number().typeError('Must be a number').optional(),
});

// Hoisted: an inline object is a new identity on every render, which makes the
// ScrollView re-measure and can throw away the scroll position mid-gesture.
const CONTENT_STYLE = { padding: 16 };

export default function PropertyFormPane({ id, defaultCategory = 'INVESTMENT', onSaved }: Props) {
  const isEditing = Boolean(id);

  const existing = useGetPropertyQuery(id as string, { skip: !id });
  const owningEntities = useGetOwningEntitiesQuery({ limit: 50 });
  const managingAgents = useGetManagingAgentsQuery({ limit: 50 });
  const [createProperty, createState] = useCreatePropertyMutation();
  const [updateProperty, updateState] = useUpdatePropertyMutation();

  const initialValues: FormValues = useMemo(() => {
    const p = existing.data;
    return {
      name: p?.name ?? '',
      addressLine1: p?.addressLine1 ?? '',
      addressLine2: p?.addressLine2 ?? '',
      suburb: p?.suburb ?? '',
      state: p?.state ?? '',
      postcode: p?.postcode ?? '',
      country: p?.country ?? 'Australia',
      propertyType: p?.propertyType ?? '',
      status: p?.status ?? 'ACTIVE',
      purchaseDate: p?.purchaseDate ?? '',
      purchasePrice: numberField(p?.purchasePrice),
      purchaseCosts: numberField(p?.purchaseCosts),
      purchaseCurrency: p?.purchaseCurrency ?? 'AUD',
      landAreaSqm: numberField(p?.landAreaSqm),
      buildingAreaSqm: numberField(p?.buildingAreaSqm),
      ownedByEntityId: p?.ownedByEntityId,
      managingAgentId: p?.managingAgentId,
      notes: p?.notes ?? '',
    };
  }, [existing.data]);

  const isSubmitting = createState.isLoading || updateState.isLoading;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={CONTENT_STYLE}
      keyboardShouldPersistTaps="handled"
    >
      {isEditing && existing.isLoading ? <QueryState isLoading isError={false}>{null}</QueryState> : null}
      <Text className="mb-4 text-2xl font-bold text-slate-900">
        {isEditing
          ? defaultCategory === 'PERSONAL'
            ? 'Edit personal property'
            : 'Edit property'
          : defaultCategory === 'PERSONAL'
            ? 'New personal property'
            : 'New property'}
      </Text>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const body = {
            name: values.name,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2 || undefined,
            suburb: values.suburb,
            state: values.state,
            postcode: values.postcode,
            country: values.country,
            propertyType: values.propertyType as (typeof PROPERTY_TYPES)[number],
            status: values.status as (typeof PROPERTY_STATUSES)[number],
            category: existing.data?.category ?? defaultCategory,
            purchaseDate: values.purchaseDate,
            purchasePrice: Number(values.purchasePrice),
            purchaseCosts: Number(values.purchaseCosts),
            purchaseCurrency: values.purchaseCurrency,
            landAreaSqm: values.landAreaSqm ? Number(values.landAreaSqm) : undefined,
            buildingAreaSqm: values.buildingAreaSqm ? Number(values.buildingAreaSqm) : undefined,
            ownedByEntityId: values.ownedByEntityId,
            managingAgentId: values.managingAgentId,
            notes: values.notes || undefined,
          };

          if (isEditing && id) {
            await updateProperty({ id, body }).unwrap();
          } else {
            await createProperty(body).unwrap();
          }
          onSaved();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View>
            <FormField
              label="Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
              touched={touched.name}
            />
            <FormField
              label="Address line 1"
              value={values.addressLine1}
              onChangeText={handleChange('addressLine1')}
              onBlur={handleBlur('addressLine1')}
              error={errors.addressLine1}
              touched={touched.addressLine1}
            />
            <FormField
              label="Address line 2 (optional)"
              value={values.addressLine2}
              onChangeText={handleChange('addressLine2')}
              onBlur={handleBlur('addressLine2')}
            />
            <FormField
              label="Suburb"
              value={values.suburb}
              onChangeText={handleChange('suburb')}
              onBlur={handleBlur('suburb')}
              error={errors.suburb}
              touched={touched.suburb}
            />
            <FormField
              label="State"
              value={values.state}
              onChangeText={handleChange('state')}
              onBlur={handleBlur('state')}
              error={errors.state}
              touched={touched.state}
            />
            <FormField
              label="Postcode"
              value={values.postcode}
              onChangeText={handleChange('postcode')}
              onBlur={handleBlur('postcode')}
              keyboardType="number-pad"
              error={errors.postcode}
              touched={touched.postcode}
            />
            <FormField
              label="Country"
              value={values.country}
              onChangeText={handleChange('country')}
              onBlur={handleBlur('country')}
              error={errors.country}
              touched={touched.country}
            />

            <ChipPicker
              label="Property type"
              options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
              value={values.propertyType || undefined}
              onChange={(v) => setFieldValue('propertyType', v ?? '')}
              error={touched.propertyType ? errors.propertyType : undefined}
            />
            <ChipPicker
              label="Status"
              options={PROPERTY_STATUSES.map((s) => ({ value: s, label: s }))}
              value={values.status || undefined}
              onChange={(v) => setFieldValue('status', v ?? '')}
              error={touched.status ? errors.status : undefined}
            />

            <FormField
              label="Purchase date (YYYY-MM-DD)"
              value={values.purchaseDate}
              onChangeText={handleChange('purchaseDate')}
              onBlur={handleBlur('purchaseDate')}
              placeholder="2024-01-31"
              error={errors.purchaseDate}
              touched={touched.purchaseDate}
            />
            <FormField
              label="Purchase price"
              value={values.purchasePrice}
              onChangeText={handleChange('purchasePrice')}
              onBlur={handleBlur('purchasePrice')}
              keyboardType="decimal-pad"
              error={errors.purchasePrice}
              touched={touched.purchasePrice}
            />
            <FormField
              label="Purchase costs"
              value={values.purchaseCosts}
              onChangeText={handleChange('purchaseCosts')}
              onBlur={handleBlur('purchaseCosts')}
              keyboardType="decimal-pad"
              error={errors.purchaseCosts}
              touched={touched.purchaseCosts}
            />
            <FormField
              label="Purchase currency"
              value={values.purchaseCurrency}
              onChangeText={handleChange('purchaseCurrency')}
              onBlur={handleBlur('purchaseCurrency')}
              autoCapitalize="characters"
              error={errors.purchaseCurrency}
              touched={touched.purchaseCurrency}
            />
            <FormField
              label="Land area (sqm, optional)"
              value={values.landAreaSqm}
              onChangeText={handleChange('landAreaSqm')}
              onBlur={handleBlur('landAreaSqm')}
              keyboardType="decimal-pad"
              error={errors.landAreaSqm}
              touched={touched.landAreaSqm}
            />
            <FormField
              label="Building area (sqm, optional)"
              value={values.buildingAreaSqm}
              onChangeText={handleChange('buildingAreaSqm')}
              onBlur={handleBlur('buildingAreaSqm')}
              keyboardType="decimal-pad"
              error={errors.buildingAreaSqm}
              touched={touched.buildingAreaSqm}
            />

            <ChipPicker
              label="Owning entity (optional)"
              allowClear
              options={(owningEntities.data?.items ?? []).map((e) => ({ value: e.id, label: e.legalName }))}
              value={values.ownedByEntityId}
              onChange={(v) => setFieldValue('ownedByEntityId', v)}
            />
            <ChipPicker
              label="Managing agent (optional)"
              allowClear
              options={(managingAgents.data?.items ?? []).map((a) => ({ value: a.id, label: a.name }))}
              value={values.managingAgentId}
              onChange={(v) => setFieldValue('managingAgentId', v)}
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
              disabled={isSubmitting}
              onPress={() => handleSubmit()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Create property'}</Text>
              )}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
