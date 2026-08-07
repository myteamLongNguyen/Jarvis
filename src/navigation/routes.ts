import type { NavigatorScreenParams } from '@react-navigation/native';

export const AUTH_ROUTES = {
  Login: 'Login',
  SignUp: 'SignUp',
} as const;

export type AuthStackParamList = {
  [AUTH_ROUTES.Login]: undefined;
  [AUTH_ROUTES.SignUp]: undefined;
};

export const PROPERTIES_ROUTES = {
  PropertiesList: 'PropertiesList',
  PropertyDetail: 'PropertyDetail',
  PropertyForm: 'PropertyForm',
  OwningEntitiesList: 'OwningEntitiesList',
  OwningEntityForm: 'OwningEntityForm',
  ManagingAgentsList: 'ManagingAgentsList',
  ManagingAgentForm: 'ManagingAgentForm',
} as const;

export type PropertiesStackParamList = {
  [PROPERTIES_ROUTES.PropertiesList]: undefined;
  [PROPERTIES_ROUTES.PropertyDetail]: { id: string };
  [PROPERTIES_ROUTES.PropertyForm]: { id?: string };
  [PROPERTIES_ROUTES.OwningEntitiesList]: undefined;
  [PROPERTIES_ROUTES.OwningEntityForm]: { id?: string };
  [PROPERTIES_ROUTES.ManagingAgentsList]: undefined;
  [PROPERTIES_ROUTES.ManagingAgentForm]: { id?: string };
};

export const PERSONAL_PROPERTIES_ROUTES = {
  PersonalPropertiesList: 'PersonalPropertiesList',
  PersonalPropertyDetail: 'PersonalPropertyDetail',
  PersonalPropertyForm: 'PersonalPropertyForm',
} as const;

export type PersonalPropertiesStackParamList = {
  [PERSONAL_PROPERTIES_ROUTES.PersonalPropertiesList]: undefined;
  [PERSONAL_PROPERTIES_ROUTES.PersonalPropertyDetail]: { id: string };
  [PERSONAL_PROPERTIES_ROUTES.PersonalPropertyForm]: { id?: string };
};

export const INVOICES_ROUTES = {
  InvoicesList: 'InvoicesList',
  InvoiceForm: 'InvoiceForm',
} as const;

export type InvoicesStackParamList = {
  [INVOICES_ROUTES.InvoicesList]: undefined;
  [INVOICES_ROUTES.InvoiceForm]: undefined;
};

export const MAIN_TAB_ROUTES = {
  Portfolio: 'Portfolio',
  Properties: 'Properties',
  Invoices: 'Invoices',
  Personal: 'Personal',
  Profile: 'Profile',
} as const;

export type MainTabParamList = {
  [MAIN_TAB_ROUTES.Portfolio]: undefined;
  [MAIN_TAB_ROUTES.Properties]: NavigatorScreenParams<PropertiesStackParamList> | undefined;
  [MAIN_TAB_ROUTES.Invoices]: NavigatorScreenParams<InvoicesStackParamList> | undefined;
  [MAIN_TAB_ROUTES.Personal]: NavigatorScreenParams<PersonalPropertiesStackParamList> | undefined;
  [MAIN_TAB_ROUTES.Profile]: undefined;
};

export const ROOT_ROUTES = {
  Auth: 'Auth',
  Main: 'Main',
} as const;

export type RootStackParamList = {
  [ROOT_ROUTES.Auth]: undefined;
  [ROOT_ROUTES.Main]: undefined;
};
