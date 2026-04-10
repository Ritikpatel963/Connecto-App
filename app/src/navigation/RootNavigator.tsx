import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { SplashScreen, OnboardingScreen, NotificationsScreen } from '../features/system/screens';
import { LoginScreen, RoleSelectScreen, ProfileSetupScreen } from '../features/auth/screens';
import { ProfileScreen } from '../features/profile/screens';
import { CallScreen, ConversationScreen } from '../features/chat/screens';
import { ReferralScreen } from '../features/wallet/screens';
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
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Call" component={CallScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
