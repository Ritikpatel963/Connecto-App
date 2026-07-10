import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { SplashScreen, OnboardingScreen, NotificationsScreen } from '../features/system/screens';
import { LoginScreen, RoleSelectScreen, ProfileSetupScreen, WaitApprovalScreen } from '../features/auth/screens';
import { ProfileScreen, PrivacySecurityScreen, VerificationScreen, ContentScreen } from '../features/profile/screens';
import { CallScreen, ConversationScreen } from '../features/chat/screens';
import { ReferralScreen, RechargeScreen, WithdrawScreen } from '../features/wallet/screens';
import AppTabs from './AppTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="WaitApproval" component={WaitApprovalScreen} />
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Call" component={CallScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="Recharge" component={RechargeScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="Content" component={ContentScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
