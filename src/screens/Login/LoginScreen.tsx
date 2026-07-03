import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, selectAuthError, selectAuthStatus } from '../../store/slices/auth-slice';

const loginSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(8, 'Must be at least 8 characters').required('Password is required'),
});

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = { email: '', password: '' };

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isSubmitting = status === 'loading';

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-8 text-center text-2xl font-bold text-slate-900">Sign in</Text>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={(values) => {
          dispatch(login(values));
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <Text className="mb-1 text-sm font-medium text-slate-700">Email</Text>
            <TextInput
              className="mb-1 rounded-lg border border-slate-300 px-4 py-3 text-base"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email ? (
              <Text className="mb-2 text-sm text-red-600">{errors.email}</Text>
            ) : (
              <View className="mb-2" />
            )}

            <Text className="mb-1 text-sm font-medium text-slate-700">Password</Text>
            <TextInput
              className="mb-1 rounded-lg border border-slate-300 px-4 py-3 text-base"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password ? (
              <Text className="mb-2 text-sm text-red-600">{errors.password}</Text>
            ) : (
              <View className="mb-2" />
            )}

            {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}

            <Pressable
              className="mt-4 items-center rounded-lg bg-slate-900 py-3"
              disabled={isSubmitting}
              onPress={() => handleSubmit()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-semibold text-white">Sign in</Text>
              )}
            </Pressable>
          </View>
        )}
      </Formik>
    </View>
  );
}
