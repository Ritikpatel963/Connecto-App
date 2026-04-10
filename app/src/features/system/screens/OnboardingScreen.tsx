import React, { useState } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const slides = [
  {
    icon: '📞',
    title: 'Voice Calls That Connect',
    subtitle: 'Real conversations, real connections',
    features: [
      { icon: '👥', text: 'Discover interesting people near you' },
      { icon: '📞', text: 'HD voice calls with one tap' },
      { icon: '❤️', text: 'Save favorites & chat anytime' },
      { icon: '⭐', text: 'Rate & review your experience' },
    ],
    gradientColors: Gradients.primary,
  },
  {
    icon: '💰',
    title: 'Earn & Spend Seamlessly',
    subtitle: 'Wallet-powered, transparent billing',
    features: [
      { icon: '💰', text: 'Per-minute billing — pay only for what you use' },
      { icon: '⭐', text: 'Girls earn coins for every call received' },
      { icon: '👥', text: 'Refer friends & earn bonus rewards' },
      { icon: '❤️', text: 'Premium badges for top-rated users' },
    ],
    gradientColors: ['#F5A623', 'rgba(245,166,35,0.7)'] as const,
  },
  {
    icon: '🛡️',
    title: 'Your Privacy Matters',
    subtitle: 'Safe, secure & respectful',
    features: [
      { icon: '🛡️', text: 'End-to-end encrypted voice calls' },
      { icon: '👥', text: 'Voice verification for authentic profiles' },
      { icon: '⭐', text: 'Report & block abusive users instantly' },
      { icon: '❤️', text: 'We never share your personal data with third parties' },
    ],
    gradientColors: ['#2DD4A8', 'rgba(45,212,168,0.7)'] as const,
    privacy: true,
  },
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { width } = useWindowDimensions();
  const slideWidth = Math.max(1, width - 48);
  const translateX = React.useRef(new Animated.Value(0)).current;

  const next = () => {
    if (isAnimating) return;

    if (current < slides.length - 1) {
      const nextIndex = current + 1;
      setIsAnimating(true);
      Animated.timing(translateX, {
        toValue: -nextIndex * slideWidth,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setCurrent(nextIndex);
        }
        setIsAnimating(false);
      });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glow} />

      {/* Skip */}
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.sliderTrack,
            {
              width: slideWidth * slides.length,
              transform: [{ translateX }],
            },
          ]}>
          {slides.map((item, index) => (
            <View key={item.title} style={[styles.slide, { width: slideWidth }]}>
              <LinearGradient
                colors={[...item.gradientColors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconBox}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </LinearGradient>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              <View style={styles.featureList}>
                {item.features.map((f, i) => (
                  <View key={`${index}-${i}`} style={styles.featureRow}>
                    <View style={styles.featureIconBox}>
                      <Text style={styles.featureIcon}>{f.icon}</Text>
                    </View>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>

              {item.privacy && (
                <View style={styles.privacyCard}>
                  <Text style={styles.privacyText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.privacyLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.privacyLink}>Privacy Policy</Text>. We collect minimal
                    data to provide our service. Your voice calls are encrypted. You can delete
                    your account and all data at any time from Settings.
                  </Text>
                </View>
              )}
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Bottom: dots + button */}
      <View style={styles.bottom}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === current ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={next} activeOpacity={0.8}>
          <LinearGradient
            colors={[...Gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>
              {current === slides.length - 1 ? 'Get Started →' : 'Next ›'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  glow: {
    position: 'absolute',
    top: 80,
    left: '25%',
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: 'rgba(255,92,92,0.08)',
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
    zIndex: 10,
  },
  skipText: {
    ...Typography.bodyMedium,
    color: Colors.mutedForeground,
  },
  content: {
    flex: 1,
    zIndex: 10,
    overflow: 'hidden',
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
  },
  slide: {
    flex: 1,
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
  iconEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.foreground,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.mutedForeground,
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 18,
  },
  featureText: {
    ...Typography.body,
    color: Colors.white80,
    flex: 1,
    paddingTop: 10,
  },
  privacyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyText: {
    ...Typography.small,
    color: Colors.mutedForeground,
    lineHeight: 18,
  },
  privacyLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    paddingTop: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(128,128,150,0.3)',
  },
  nextBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    ...Elevation.glow,
  },
  nextBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});

export default OnboardingScreen;
