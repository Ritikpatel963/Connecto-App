import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import type { Transaction } from '../shared/types/app';

type IconProps = {
  color?: string;
  size?: number;
};

const ArrowDownLeftIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 16 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M17 7 7 17" />
    <Path d="M17 17H7V7" />
  </Svg>
);

const PhoneIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 16 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

const GiftIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Rect x={3} y={8} width={18} height={4} rx={1} />
    <Path d="M12 8v13" />
    <Path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <Path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </Svg>
);

const WalletIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 16 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </Svg>
);

const colorMap: Record<string, { bg: string; fg: string }> = {
  recharge: { bg: 'rgba(45,212,168,0.1)', fg: Colors.accent },
  call_debit: { bg: 'rgba(255,92,92,0.1)', fg: Colors.primary },
  call_credit: { bg: 'rgba(45,212,168,0.1)', fg: Colors.accent },
  withdrawal: { bg: 'rgba(245,166,35,0.1)', fg: Colors.secondary },
  referral_bonus: { bg: 'rgba(245,166,35,0.1)', fg: Colors.secondary },
};

const TransactionRow: React.FC<{ tx: Transaction; conversionRate?: number }> = ({ tx, conversionRate = 1 }) => {
  const date = new Date(tx.timestamp);
  const isPositive = tx.amount > 0;
  const colors = colorMap[tx.type] || colorMap.recharge;
  
  const coins = Math.floor(Math.abs(tx.amount) / conversionRate);

  const renderIcon = () => {
    switch (tx.type) {
      case 'recharge':
      case 'withdrawal':
        return <ArrowDownLeftIcon color={colors.fg} />;
      case 'call_debit':
      case 'call_credit':
        return <PhoneIcon color={colors.fg} />;
      case 'referral_bonus':
        return <GiftIcon color={colors.fg} />;
      default:
        return <WalletIcon color={colors.fg} />;
    }
  };

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
        {renderIcon()}
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{tx.description}</Text>
        <Text style={styles.date}>
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: tx.status === 'pending' ? Colors.secondary : (isPositive ? Colors.accent : Colors.primary) }]}>
          {isPositive ? '+' : ''}₹{Math.abs(tx.amount)}
        </Text>
        {tx.type === 'recharge' && (tx.status === 'completed' || tx.status === 'verified') && (
          <Text style={[styles.status, { color: Colors.accent }]}>
            +{coins} Coins
          </Text>
        )}
        {(tx.type !== 'recharge' || (tx.status !== 'completed' && tx.status !== 'verified')) && (
          <Text style={[styles.status, tx.status === 'pending' && { color: Colors.secondary }]}>
            {tx.status}
          </Text>
        )}
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
