export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  RoleSelect: undefined;
  ProfileSetup: { isEdit?: boolean; referralCode?: string } | undefined;
  WaitApproval: undefined;
  MainTabs: undefined;
  Profile: { id: string; profile?: any };
  Call: { id: string };
  Conversation: { id: string; profile?: any };
  Notifications: undefined;
  Referral: undefined;
  PrivacySecurity: undefined;
  Recharge: { amount?: number } | undefined;
  Withdraw: undefined;
  Verification: undefined;
  Content: { title: string; contentKey: string };
};

export type TabParamList = {
  Discover: undefined;
  Chats: undefined;
  Wallet: undefined;
  Favorites: undefined;
  Settings: undefined;
};
