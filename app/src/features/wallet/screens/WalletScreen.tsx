import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import WalletCard from '../../../components/WalletCard';
import TransactionRow from '../../../components/TransactionRow';
import { useTransactions, useWalletBalance, useCoinPackages, useWalletRealtime, useSettings } from '../../../api/wallet';
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

  // Fetch actual wallet balance from API to sync with context
  useWalletBalance();

  // Realtime Supabase sync for transactions & balance
  useWalletRealtime();

  // Settings (payout rate etc.) — called last, after all original hooks
  const { data: settings = {} } = useSettings();

  const payoutRate = Number(settings.payout_coin_rate) || 0;
  const boyRechargeRate = Number(settings.boy_coin_rate) || 0;
  
  let conversionRate = 1;
  if (role === 'girl') {
    conversionRate = payoutRate > 0 ? (1 / payoutRate) : 1;
  } else {
    conversionRate = boyRechargeRate > 0 ? (1 / boyRechargeRate) : 1;
  }

  const payoutRs = payoutRate > 0 ? (walletBalance / payoutRate).toFixed(2) : null;
  const boyRs = boyRechargeRate > 0 ? (walletBalance / boyRechargeRate).toFixed(2) : null;
  const paginatedTransactions = transactions.slice(0, 10);

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

      {/* Payout rate info — only for girls */}
      {role === 'girl' && payoutRate > 0 && (
        <View style={styles.payoutBanner}>
          <View style={styles.payoutBannerLeft}>
            <Text style={styles.payoutBannerTitle}>💰 Payout Rate</Text>
            <Text style={styles.payoutBannerSub}>1 ₹ = {payoutRate} coins</Text>
          </View>
          <View style={styles.payoutBannerRight}>
            <Text style={styles.payoutBannerLabel}>Your balance equals</Text>
            <Text style={styles.payoutBannerValue}>₹{payoutRs}</Text>
          </View>
        </View>
      )}

      {/* Recharge rate info — only for boys */}
      {role !== 'girl' && boyRechargeRate > 0 && (
        <View style={styles.payoutBanner}>
          <View style={styles.payoutBannerLeft}>
            <Text style={styles.payoutBannerTitle}>💰 Recharge Rate</Text>
            <Text style={styles.payoutBannerSub}>1 ₹ = {boyRechargeRate} coins</Text>
          </View>
          <View style={styles.payoutBannerRight}>
            <Text style={styles.payoutBannerLabel}>Your balance equals</Text>
            <Text style={styles.payoutBannerValue}>₹{boyRs}</Text>
          </View>
        </View>
      )}

      {role !== 'girl' && (
        <View style={styles.rechargeSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>QUICK RECHARGE</Text>
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
  payoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(233,64,87,0.2)',
  },
  payoutBannerLeft: { gap: 2 },
  payoutBannerTitle: { ...Typography.bodyBold, color: Colors.foreground },
  payoutBannerSub: { ...Typography.small, color: Colors.mutedForeground },
  payoutBannerRight: { alignItems: 'flex-end', gap: 2 },
  payoutBannerLabel: { ...Typography.small, color: Colors.mutedForeground },
  payoutBannerValue: { ...Typography.h3, color: Colors.primary },
});

export default WalletScreen;
