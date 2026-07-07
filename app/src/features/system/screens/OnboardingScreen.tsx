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
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

type IconProps = {
  color?: string;
  size?: number;
};

type FeatureIconProps = {
  color?: string;
  size?: number;
};

const SLIDE_ICON_SIZE = 36;
const FEATURE_ICON_SIZE = 18;

const PhoneIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = SLIDE_ICON_SIZE }) => (
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

const WalletIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = SLIDE_ICON_SIZE }) => (
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

const ShieldIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = SLIDE_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

const UsersIcon: React.FC<FeatureIconProps> = ({ color = '#FFFFFF', size = FEATURE_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx={9} cy={7} r={4} />
    <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const HeartIcon: React.FC<FeatureIconProps> = ({ color = '#FFFFFF', size = FEATURE_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

const StarIcon: React.FC<FeatureIconProps> = ({ color = '#FFFFFF', size = FEATURE_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </Svg>
);

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const slides = [
  {
    icon: PhoneIcon,
    title: 'Voice Calls & Chats That Connect',
    subtitle: 'Real conversations, real connections',
    features: [
      { icon: UsersIcon, text: 'Discover interesting people near you' },
      { icon: HeartIcon, text: 'Chat With Your Loved Ones' },
      { icon: PhoneIcon, text: 'HD voice calls with one tap' },
      { icon: StarIcon, text: 'Rate & review your experience' },
    ],
    gradientColors: Gradients.primary,
  },
  {
    icon: WalletIcon,
    title: 'Earn & Spend Seamlessly',
    subtitle: 'Wallet-powered, transparent billing',
    features: [
      { icon: WalletIcon, text: 'Per-minute billing — pay only for what you use' },
      { icon: StarIcon, text: 'Girls earn coins for every call received' },
      { icon: UsersIcon, text: 'Refer friends & earn bonus rewards' },
      { icon: HeartIcon, text: 'Premium badges for top-rated users' },
    ],
    gradientColors: ['#F5A623', 'rgba(245,166,35,0.7)'] as const,
  },
  {
    icon: ShieldIcon,
    title: 'Your Privacy Matters',
    subtitle: 'Safe, secure & respectful',
    features: [
      { icon: ShieldIcon, text: 'End-to-end encrypted voice calls' },
      { icon: UsersIcon, text: 'Voice verification for authentic profiles' },
      { icon: StarIcon, text: 'Report & block abusive users instantly' },
      { icon: HeartIcon, text: 'We never share your personal data with third parties' },
    ],
    gradientColors: ['#2DD4A8', 'rgba(45,212,168,0.7)'] as const,
    privacy: true,
  },
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}>
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
                <item.icon size={SLIDE_ICON_SIZE} />
              </LinearGradient>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              <View style={styles.featureList}>
                {item.features.map((f, i) => (
                  <View key={`${index}-${i}`} style={styles.featureRow}>
                    <View style={styles.featureIconBox}>
                      <f.icon color={Colors.primary} size={FEATURE_ICON_SIZE} />
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
