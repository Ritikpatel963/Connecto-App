import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Gradients } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import { useUser } from '../context/UserContext';

interface WalletCardProps {
  onRecharge?: () => void;
  onWithdraw?: () => void;
}

type IconProps = {
  color?: string;
  size?: number;
};

const WalletIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16 }) => (
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

const CallIcon: React.FC<IconProps> = ({ color = 'rgba(255,255,255,0.85)', size = 14 }) => (
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

const ArrowDownLeftIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16 }) => (
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

const WalletCard: React.FC<WalletCardProps> = ({ onRecharge, onWithdraw }) => {
  const { walletBalance, role } = useUser();
  const gradientColors = role === 'girl' ? [...Gradients.girl] : [...Gradients.primary];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.content}>
        <View style={styles.labelRow}>
          <WalletIcon />
          <Text style={styles.label}>Wallet Balance</Text>
        </View>
        <Text style={styles.balance}>₹{walletBalance.toLocaleString()}</Text>

        {role === 'girl' && (
          <View style={styles.earningRow}>
            <CallIcon />
            <Text style={styles.earningText}>₹2,450 earned this month</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          {role === 'boy' ? (
            <TouchableOpacity onPress={onRecharge} style={styles.actionBtn} activeOpacity={0.7}>
              <ArrowDownLeftIcon />
              <Text style={styles.actionBtnText}>Recharge</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onWithdraw} style={styles.actionBtn} activeOpacity={0.7}>
              <ArrowDownLeftIcon />
              <Text style={styles.actionBtnText}>Withdraw</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    padding: 20,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -16,
    left: -16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    zIndex: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  walletIcon: {
    fontSize: 16,
  },
  label: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  earningText: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.7)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  actionBtnText: {
    ...Typography.bodySemibold,
    color: '#FFFFFF',
  },
});

export default WalletCard;
