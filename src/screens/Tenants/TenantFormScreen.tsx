import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGetTenantQuery, useCreateTenantMutation, useUpdateTenantMutation } from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';
import { TENANT_ENTITY_TYPES } from '../../types/tenant';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.TenantForm>;

interface FormValues {
  name: string;
  entityType: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  entityType: Yup.string().required('Entity type is required'),
  email: Yup.string().email('Enter a valid email'),
});

export default function TenantFormScreen({ route, navigation }: Props) {
  const id = route.params?.id;
  const isEditing = Boolean(id);

  const existing = useGetTenantQuery(id as string, { skip: !id });
  const [createTenant, createState] = useCreateTenantMutation();
  const [updateTenant, updateState] = useUpdateTenantMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const initialValues: FormValues = useMemo(
    () => ({
      name: existing.data?.name ?? route.params?.name ?? '',
      entityType: existing.data?.entityType ?? '',
      abn: existing.data?.abn ?? '',
      contactName: existing.data?.contactName ?? '',
      email: existing.data?.email ?? '',
      phone: existing.data?.phone ?? '',
      notes: existing.data?.notes ?? '',
    }),
    [existing.data, route.params?.name]
  );

  if (isEditing && existing.isLoading) {
    return <QueryState isLoading isError={false}>{null}</QueryState>;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">{isEditing ? 'Edit tenant' : 'New tenant'}</Text>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const body = {
            name: values.name,
            entityType: values.entityType as (typeof TENANT_ENTITY_TYPES)[number],
            abn: values.abn || undefined,
            contactName: values.contactName || undefined,
            email: values.email || undefined,
            phone: values.phone || undefined,
            notes: values.notes || undefined,
          };
          if (isEditing && id) {
            await updateTenant({ id, body }).unwrap();
          } else {
            await createTenant(body).unwrap();
          }
          navigation.goBack();
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
            <ChipPicker
              label="Entity type"
              options={TENANT_ENTITY_TYPES.map((t) => ({ value: t, label: t }))}
              value={values.entityType || undefined}
              onChange={(v) => setFieldValue('entityType', v ?? '')}
              error={touched.entityType ? errors.entityType : undefined}
            />
            <FormField label="ABN (optional)" value={values.abn} onChangeText={handleChange('abn')} onBlur={handleBlur('abn')} keyboardType="number-pad" />
            <FormField label="Contact name (optional)" value={values.contactName} onChangeText={handleChange('contactName')} onBlur={handleBlur('contactName')} />
            <FormField
              label="Email (optional)"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              touched={touched.email}
            />
            <FormField label="Phone (optional)" value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} keyboardType="phone-pad" />
            <FormField label="Notes (optional)" value={values.notes} onChangeText={handleChange('notes')} onBlur={handleBlur('notes')} multiline numberOfLines={4} />

            <Pressable className="mt-4 items-center rounded-lg bg-slate-900 py-3" disabled={isSubmitting} onPress={() => handleSubmit()}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Create tenant'}</Text>}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
