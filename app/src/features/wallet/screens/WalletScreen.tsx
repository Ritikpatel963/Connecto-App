import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import WalletCard from '../../../components/WalletCard';
import TransactionRow from '../../../components/TransactionRow';
import { useTransactions, useWalletBalance, useCoinPackages } from '../../../api/wallet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Wallet'>,
  NativeStackScreenProps<RootStackParamList>
>;

const rechargeAmounts = [100, 200, 500, 1000];

const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { role, walletBalance } = useUser();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: coinPackages = [] } = useCoinPackages();
  
  const baseRule = coinPackages[0];
  const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
  const paginatedTransactions = transactions.slice(0, 10);
  
  // Fetch actual wallet balance from API to sync with context
  useWalletBalance();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 92 },
      ]}>
      <Text style={styles.title}>Wallet</Text>
      <WalletCard 
        onRecharge={() => navigation.navigate('Recharge')} 
        onWithdraw={() => navigation.navigate('Withdraw')}
      />

      {role !== 'girl' && (
        <View style={styles.rechargeSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>QUICK RECHARGE</Text>
            {baseRule && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: 'rgba(245,158,11,0.15)',
                paddingHorizontal: 10, 
                paddingVertical: 4, 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(245,158,11,0.3)'
              }}>
                <Text style={{ ...Typography.smallSemibold, color: '#D97706' }}>
                  💰 {baseRule.coins} Coins = ₹{baseRule.price}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.rechargeGrid}>
            {rechargeAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => navigation.navigate('Recharge', { amount: amt })}
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
        {isLoading ? (
          <Text style={{color: Colors.mutedForeground}}>Loading...</Text>
        ) : paginatedTransactions.length === 0 ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <Text style={{ color: Colors.mutedForeground, ...Typography.body }}>No transactions yet</Text>
          </View>
        ) : (
          paginatedTransactions.map(tx => (
            <TouchableOpacity 
              key={tx.id} 
              style={styles.txRow} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TransactionDetails' as any, { tx })}
            >
              <TransactionRow tx={tx} conversionRate={conversionRate} />
            </TouchableOpacity>
          ))
        )}
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
