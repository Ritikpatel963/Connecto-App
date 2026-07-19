import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import BackArrowIcon from '../../../components/BackArrowIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { useCoinPackages } from '../../../api/wallet';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionDetails'>;

const TransactionDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { tx } = route.params;

  const isCredit = tx.type === 'recharge' || tx.type === 'earning' || tx.type === 'call_credit' || tx.type === 'referral_bonus';
  const prefix = isCredit ? '+' : '';
  const signColor = isCredit ? '#10B981' : '#EF4444';

  const { data: coinPackages = [] } = useCoinPackages();
  const baseRule = coinPackages[0];
  const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
  const pkg = coinPackages.find(p => p.price === Math.abs(tx.amount));
  const defaultCoins = Math.floor(Math.abs(tx.amount) / conversionRate);
  const coins = (tx.type === 'recharge' && pkg) ? pkg.coins : (tx.type === 'recharge' ? defaultCoins : Math.abs(tx.amount));

  const date = new Date(tx.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrowIcon color={Colors.foreground} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={[styles.amountValue, { color: signColor }]}>
            {prefix}{tx.type === 'recharge' ? `₹${Math.abs(tx.amount)}` : `${coins} Coins`}
          </Text>
          {tx.type === 'recharge' && (
            <Text style={{ ...Typography.bodySemibold, color: Colors.accent, marginBottom: 12 }}>
              +{coins} Coins
            </Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: tx.status === 'completed' ? 'rgba(16,185,129,0.1)' : tx.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }]}>
            <Text style={[styles.statusText, { color: tx.status === 'completed' ? '#10B981' : tx.status === 'failed' ? '#EF4444' : '#F59E0B' }]}>
              {tx.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionLabel}>DETAILS</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{tx.txnId || tx.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{tx.type.replace('_', ' ').toUpperCase()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{formattedTime}</Text>
          </View>

          {tx.paymentGateway && (
            <View style={styles.row}>
              <Text style={styles.label}>Method / Gateway</Text>
              <Text style={styles.value}>{tx.paymentGateway}</Text>
            </View>
          )}

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{tx.description}</Text>
          </View>
        </View>

        {tx.screenshotUrl && tx.screenshotUrl !== 'null' && (
          <View style={styles.screenshotCard}>
            <Text style={styles.sectionLabel}>PAYMENT SCREENSHOT</Text>
            <Image source={{ uri: tx.screenshotUrl }} style={styles.screenshotImage} resizeMode="cover" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.h4, color: Colors.foreground },
  content: { padding: 16, paddingBottom: 100 },
  amountCard: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 24, alignItems: 'center', marginBottom: 16, ...Elevation.sm },
  amountLabel: { ...Typography.small, color: Colors.mutedForeground, marginBottom: 8 },
  amountValue: { ...Typography.h2, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { ...Typography.caption, fontWeight: '700' },
  detailsCard: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 16, marginBottom: 16 },
  sectionLabel: { ...Typography.label, color: Colors.mutedForeground, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { ...Typography.body, color: Colors.mutedForeground },
  value: { ...Typography.bodySemibold, color: Colors.foreground, flex: 1, textAlign: 'right', marginLeft: 16 },
  screenshotCard: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 16 },
  screenshotImage: { width: '100%', height: 300, borderRadius: Radius.lg, marginTop: 8 },
});

export default TransactionDetailsScreen;
