import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useGetOwningEntityQuery,
  useCreateOwningEntityMutation,
  useUpdateOwningEntityMutation,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import FormField from '../../components/FormField';
import ChipPicker from '../../components/ChipPicker';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';
import { ENTITY_TYPES } from '../../types/owning-entity';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.OwningEntityForm>;

interface FormValues {
  legalName: string;
  entityType: string;
  abn: string;
  acn: string;
  notes: string;
}

const validationSchema = Yup.object({
  legalName: Yup.string().required('Legal name is required'),
  entityType: Yup.string().required('Entity type is required'),
});

export default function OwningEntityFormScreen({ route, navigation }: Props) {
  const id = route.params?.id;
  const isEditing = Boolean(id);

  const existing = useGetOwningEntityQuery(id as string, { skip: !id });
  const [createEntity, createState] = useCreateOwningEntityMutation();
  const [updateEntity, updateState] = useUpdateOwningEntityMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const initialValues: FormValues = useMemo(
    () => ({
      legalName: existing.data?.legalName ?? '',
      entityType: existing.data?.entityType ?? '',
      abn: existing.data?.abn ?? '',
      acn: existing.data?.acn ?? '',
      notes: existing.data?.notes ?? '',
    }),
    [existing.data]
  );

  if (isEditing && existing.isLoading) {
    return <QueryState isLoading isError={false}>{null}</QueryState>;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold text-slate-900">{isEditing ? 'Edit entity' : 'New owning entity'}</Text>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const body = {
            legalName: values.legalName,
            entityType: values.entityType as (typeof ENTITY_TYPES)[number],
            abn: values.abn || undefined,
            acn: values.acn || undefined,
            notes: values.notes || undefined,
          };
          if (isEditing && id) {
            await updateEntity({ id, body }).unwrap();
          } else {
            await createEntity(body).unwrap();
          }
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View>
            <FormField
              label="Legal name"
              value={values.legalName}
              onChangeText={handleChange('legalName')}
              onBlur={handleBlur('legalName')}
              error={errors.legalName}
              touched={touched.legalName}
            />
            <ChipPicker
              label="Entity type"
              options={ENTITY_TYPES.map((t) => ({ value: t, label: t }))}
              value={values.entityType || undefined}
              onChange={(v) => setFieldValue('entityType', v ?? '')}
              error={touched.entityType ? errors.entityType : undefined}
            />
            <FormField label="ABN (optional)" value={values.abn} onChangeText={handleChange('abn')} onBlur={handleBlur('abn')} keyboardType="number-pad" />
            <FormField label="ACN (optional)" value={values.acn} onChangeText={handleChange('acn')} onBlur={handleBlur('acn')} keyboardType="number-pad" />
            <FormField label="Notes (optional)" value={values.notes} onChangeText={handleChange('notes')} onBlur={handleBlur('notes')} multiline numberOfLines={4} />

            <Pressable className="mt-4 items-center rounded-lg bg-slate-900 py-3" disabled={isSubmitting} onPress={() => handleSubmit()}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">{isEditing ? 'Save changes' : 'Create entity'}</Text>}
            </Pressable>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}
