import React from 'react';
import { Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Gradients } from '../theme/colors';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 16, md: 20, lg: 28 };

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ size = 'md' }) => {
  const s = sizeMap[size];
  const iconSize = size === 'sm' ? 8 : size === 'md' ? 10 : 14;

  return (
    <LinearGradient
      colors={[...Gradients.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, { width: s, height: s, borderRadius: s / 2 }]}>
      <Text style={{ fontSize: iconSize, color: '#FFF' }}>👑</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PremiumBadge;
