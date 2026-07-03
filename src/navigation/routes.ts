export const AUTH_ROUTES = {
  Login: 'Login',
} as const;

export type AuthStackParamList = {
  [AUTH_ROUTES.Login]: undefined;
};

export const MAIN_TAB_ROUTES = {
  Home: 'Home',
  Profile: 'Profile',
} as const;

export type MainTabParamList = {
  [MAIN_TAB_ROUTES.Home]: undefined;
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
