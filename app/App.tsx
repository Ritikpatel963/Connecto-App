import React from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider, useUser } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

const BootGate = () => {
  const { hasHydrated, currentUser, setCurrentUser, setWalletBalance } = useUser();

  React.useEffect(() => {
    if (hasHydrated && currentUser?.id) {
      const headers = { 'apikey': 'sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ', 'Authorization': 'Bearer sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ' };
      // Ponytail: Lazily sync verified status and wallet balance on boot so admin approvals kick in
      Promise.all([
        fetch(`https://whypwqhdfxtjjenkhkwt.supabase.co/rest/v1/users?id=eq.${currentUser.id}&select=is_id_verified,is_active`, { headers }).then(r => r.json()),
        fetch(`https://whypwqhdfxtjjenkhkwt.supabase.co/rest/v1/wallets?user_id=eq.${currentUser.id}&select=balance`, { headers }).then(r => r.json())
      ]).then(([users, wallets]) => {
        if (users?.[0]) {
          setCurrentUser({ ...currentUser, isVerified: users[0].is_id_verified && users[0].is_active });
        }
        if (wallets?.[0]?.balance !== undefined) {
          setWalletBalance(Number(wallets[0].balance));
        } else {
          setWalletBalance(0);
        }
      }).catch(() => {});
    }
  }, [hasHydrated, currentUser?.id]);

  if (!hasHydrated) {
    return (
      <View style={styles.bootContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
};

const App = () => (
  <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0F0F11" />
        <BootGate />
      </UserProvider>
    </QueryClientProvider>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
