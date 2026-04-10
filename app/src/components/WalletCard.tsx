import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Gradients } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import { useUser } from '../context/UserContext';

interface WalletCardProps {
  onRecharge?: () => void;
  onWithdraw?: () => void;
}

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
          <Text style={styles.walletIcon}>💰</Text>
          <Text style={styles.label}>Wallet Balance</Text>
        </View>
        <Text style={styles.balance}>₹{walletBalance.toLocaleString()}</Text>

        {role === 'girl' && (
          <View style={styles.earningRow}>
            <Text style={styles.earningText}>📈 ₹2,450 earned this month</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          {role === 'boy' ? (
            <TouchableOpacity onPress={onRecharge} style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>↙ Recharge</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onWithdraw} style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>↗ Withdraw</Text>
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
