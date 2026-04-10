import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 10, md: 12, lg: 16 };

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ isOnline, size = 'md' }) => {
  const s = sizeMap[size];
  return (
    <View
      style={[
        styles.dot,
        {
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: isOnline ? Colors.accent : Colors.mutedForeground,
          borderWidth: size === 'sm' ? 1 : 2,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    borderColor: Colors.card,
  },
});

export default OnlineIndicator;
