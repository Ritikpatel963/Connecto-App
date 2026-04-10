import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      ]),
      Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Onboarding'), 2500);
    return () => clearTimeout(timer);
  }, [dotsOpacity, navigation, opacity, scale, subtitleOpacity, titleY]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      {/* Background glow */}
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />

      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBox}>
          <Text style={styles.phoneIcon}>📞</Text>
        </LinearGradient>

        <Animated.Text style={[styles.title, { transform: [{ translateY: titleY }] }]}>
          Connecto
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Connect through voice
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.dots, { opacity: dotsOpacity }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={styles.dot} />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowPrimary: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(255,92,92,0.15)',
  },
  glowSecondary: {
    position: 'absolute',
    bottom: '25%',
    left: '20%',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(245,166,35,0.1)',
  },
  center: {
    alignItems: 'center',
    zIndex: 10,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Elevation.glow,
  },
  phoneIcon: {
    fontSize: 36,
  },
  title: {
    ...Typography.h1,
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.mutedForeground,
    marginTop: 8,
  },
  dots: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
});

export default SplashScreen;
