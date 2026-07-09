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
  const { hasHydrated } = useUser();

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
