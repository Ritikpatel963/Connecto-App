export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  RoleSelect: undefined;
  ProfileSetup: undefined;
  WaitApproval: undefined;
  MainTabs: undefined;
  Profile: { id: string; profile?: any };
  Call: { id: string };
  Conversation: { id: string; profile?: any };
  Notifications: undefined;
  Referral: undefined;
  PrivacySecurity: undefined;
  Recharge: undefined;
};

export type TabParamList = {
  Discover: undefined;
  Chats: undefined;
  Wallet: undefined;
  Favorites: undefined;
  Settings: undefined;
};
