import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signUp, selectAuthError, selectAuthStatus } from '../../store/slices/auth-slice';
import { AUTH_ROUTES, AuthStackParamList } from '../../navigation/routes';
import JarvisLogo from '../../components/JarvisLogo';

const signUpSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(8, 'Must be at least 8 characters').required('Password is required'),
});

interface SignUpFormValues {
  email: string;
  password: string;
}

const initialValues: SignUpFormValues = { email: '', password: '' };

type Props = NativeStackScreenProps<AuthStackParamList, typeof AUTH_ROUTES.SignUp>;

export default function SignUpScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isSubmitting = status === 'loading';
  const [confirmationSent, setConfirmationSent] = useState(false);

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="mb-6 items-center">
        <JarvisLogo size={92} />
      </View>
      <Text className="mb-8 text-center text-2xl font-bold text-slate-900">Create account</Text>

      {confirmationSent ? (
        <Text className="text-center text-base text-slate-700">
          Check your email to confirm your account, then sign in.
        </Text>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={signUpSchema}
          onSubmit={async (values) => {
            const result = await dispatch(signUp(values));
            if (signUp.fulfilled.match(result) && result.payload === null) {
              // No session returned means Supabase requires email confirmation.
              setConfirmationSent(true);
            }
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
                  <Text className="font-semibold text-white">Sign up</Text>
                )}
              </Pressable>
            </View>
          )}
        </Formik>
      )}

      <Pressable className="mt-4 items-center" onPress={() => navigation.navigate(AUTH_ROUTES.Login)}>
        <Text className="text-sm text-slate-600">
          Already have an account? <Text className="font-semibold text-slate-900">Sign in</Text>
        </Text>
      </Pressable>
    </View>
  );
}
