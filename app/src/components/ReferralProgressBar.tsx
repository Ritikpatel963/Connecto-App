import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import LinearGradient from 'react-native-linear-gradient';
import { Gradients } from '../theme/colors';

interface ReferralProgressBarProps {
  current: number;
  target: number;
  reward: number;
  reached: boolean;
}

const ReferralProgressBar: React.FC<ReferralProgressBarProps> = ({
  current,
  target,
  reward,
  reached,
}) => {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {reached ? '✅' : '🎯'} {target} Referrals
        </Text>
        <Text style={[styles.reward, { color: reached ? Colors.accent : Colors.secondary }]}>
          ₹{reward}
        </Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={reached ? [...Gradients.success] : [...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${progress}%` }]}
        />
      </View>
      <Text style={styles.count}>
        {Math.min(current, target)}/{target} referred
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.foreground,
  },
  reward: {
    ...Typography.bodyBold,
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.muted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  count: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
});

export default ReferralProgressBar;
