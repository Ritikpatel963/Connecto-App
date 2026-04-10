import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import type { Transaction } from '../shared/types/app';

const iconMap: Record<string, string> = {
  recharge: '↙',
  call_debit: '📞',
  call_credit: '📞',
  withdrawal: '↗',
  referral_bonus: '🎁',
};

const colorMap: Record<string, { bg: string; fg: string }> = {
  recharge: { bg: 'rgba(45,212,168,0.1)', fg: Colors.accent },
  call_debit: { bg: 'rgba(255,92,92,0.1)', fg: Colors.primary },
  call_credit: { bg: 'rgba(45,212,168,0.1)', fg: Colors.accent },
  withdrawal: { bg: 'rgba(245,166,35,0.1)', fg: Colors.secondary },
  referral_bonus: { bg: 'rgba(245,166,35,0.1)', fg: Colors.secondary },
};

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const date = new Date(tx.timestamp);
  const isPositive = tx.amount > 0;
  const colors = colorMap[tx.type] || colorMap.recharge;

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
        <Text style={[styles.icon, { color: colors.fg }]}>
          {iconMap[tx.type] || '💰'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{tx.description}</Text>
        <Text style={styles.date}>
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: isPositive ? Colors.accent : Colors.primary }]}>
          {isPositive ? '+' : ''}₹{Math.abs(tx.amount)}
        </Text>
        <Text style={[styles.status, tx.status === 'pending' && { color: Colors.secondary }]}>
          {tx.status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.foreground,
  },
  date: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amount: {
    ...Typography.bodyBold,
  },
  status: {
    ...Typography.caption,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
});

export default TransactionRow;
