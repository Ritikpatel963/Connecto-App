import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import WalletCard from '../../../components/WalletCard';
import TransactionRow from '../../../components/TransactionRow';
import { mockTransactions } from '../../../shared/data/mockData';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Wallet'>,
  NativeStackScreenProps<RootStackParamList>
>;

const rechargeAmounts = [100, 200, 500, 1000];

const WalletScreen: React.FC<Props> = () => {
  const insets = useSafeAreaInsets();
  const { role, walletBalance, setWalletBalance } = useUser();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 92 },
      ]}>
      <Text style={styles.title}>Wallet</Text>
      <WalletCard />

      {role === 'boy' && (
        <View style={styles.rechargeSection}>
          <Text style={styles.sectionLabel}>QUICK RECHARGE</Text>
          <View style={styles.rechargeGrid}>
            {rechargeAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => setWalletBalance(walletBalance + amt)}
                style={styles.rechargeBtn}
                activeOpacity={0.7}>
                <Text style={styles.rechargeAmount}>₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.txSection}>
        <Text style={styles.sectionLabel}>TRANSACTIONS</Text>
        {mockTransactions.map(tx => (
          <View key={tx.id} style={styles.txRow}>
            <TransactionRow tx={tx} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  title: {
    ...Typography.h3,
    color: Colors.foreground,
    marginBottom: 16,
  },
  rechargeSection: {
    marginTop: 16,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.mutedForeground,
    marginBottom: 12,
  },
  rechargeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  rechargeBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rechargeAmount: {
    ...Typography.bodyBold,
    color: Colors.foreground,
  },
  txSection: {
    marginTop: 24,
  },
  txRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});

export default WalletScreen;
