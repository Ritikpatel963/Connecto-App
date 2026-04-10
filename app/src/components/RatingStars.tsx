import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;

        const star = (
          <Text
            key={i}
            style={{
              fontSize: size,
              color: filled
                ? Colors.secondary
                : partial
                ? Colors.secondary
                : Colors.mutedForeground,
              opacity: partial ? 0.5 : filled ? 1 : 0.3,
            }}>
            ★
          </Text>
        );

        if (interactive) {
          return (
            <TouchableOpacity key={i} onPress={() => onChange?.(i + 1)}>
              {star}
            </TouchableOpacity>
          );
        }
        return star;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

export default RatingStars;
