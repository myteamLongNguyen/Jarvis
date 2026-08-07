import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useGetManagingAgentQuery,
  useCreateManagingAgentMutation,
  useUpdateManagingAgentMutation,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import FormField from '../../components/FormField';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.ManagingAgentForm>;

interface FormValues {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Enter a valid email').optional(),
});

export default function ManagingAgentFormScreen({ route, navigation }: Props) {
  const id = route.params?.id;
  const isEditing = Boolean(id);

  const existing = useGetManagingAgentQuery(id as string, { skip: !id });
  const [createAgent, createState] = useCreateManagingAgentMutation();
  const [updateAgent, updateState] = useUpdateManagingAgentMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const initialValues: FormValues = useMemo(
    () => ({
      name: existing.data?.name ?? '',
      contactName: existing.data?.contactName ?? '',
      email: existing.data?.email ?? '',
      phone: existing.data?.phone ?? '',
      notes: existing.data?.notes ?? '',
    }),
    [existing.data]
  );

  if (isEditing && existing.isLoading) {
    return <QueryState isLoading isError={false}>{null}</QueryState>;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">{isEditing ? 'Edit agent' : 'New managing agent'}</Text>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const body = {
            name: values.name,
            contactName: values.contactName || undefined,
            email: values.email || undefined,
            phone: values.phone || undefined,
            notes: values.notes || undefined,
          };
          if (isEditing && id) {
            await updateAgent({ id, body }).unwrap();
          } else {
            await createAgent(body).unwrap();
          }
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <FormField
              label="Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
              touched={touched.name}
            />
            <FormField label="Contact name (optional)" value={values.contactName} onChangeText={handleChange('contactName')} onBlur={handleBlur('contactName')} />
            <FormField
              label="Email (optional)"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
              touched={touched.email}
            />
            <FormField label="Phone (optional)" value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} keyboardType="phone-pad" />
            <FormField label="Notes (optional)" value={values.notes} onChangeText={handleChange('notes')} onBlur={handleBlur('notes')} multiline numberOfLines={4} />

            <Pressable className="mt-4 items-center rounded-lg bg-slate-900 py-3" disabled={isSubmitting} onPress={() => handleSubmit()}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Create agent'}</Text>}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
