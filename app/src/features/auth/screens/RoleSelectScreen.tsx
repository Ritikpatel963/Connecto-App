import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UserRole } from '../../../shared/types/app';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

type IconProps = {
  color?: string;
  size?: number;
};

const ROLE_ICON_SIZE = 24;

const PhoneIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = ROLE_ICON_SIZE }) => (
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

const HeadphonesIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = ROLE_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </Svg>
);

const roles: { role: UserRole; icon: React.FC<IconProps>; title: string; subtitle: string; gradient: readonly [string, string] }[] = [
  { role: 'boy', icon: PhoneIcon, title: 'Boy', subtitle: 'Discover & call amazing people', gradient: Gradients.boy },
  { role: 'girl', icon: HeadphonesIcon, title: 'Girl', subtitle: 'Earn by taking calls', gradient: Gradients.girl },
];

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setRole } = useUser();

  const handleSelect = (role: UserRole) => {
    setRole(role);
    navigation.replace('ProfileSetup');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>How will you use Connecto?</Text>
      <Text style={styles.subtitle}>Choose your role to get started</Text>

      <View style={styles.cards}>
        {roles.map(({ role, icon: Icon, title, subtitle, gradient }) => (
          <TouchableOpacity
            key={role}
            onPress={() => handleSelect(role)}
            activeOpacity={0.85}>
            <LinearGradient
              colors={[...gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}>
              <View style={styles.decorCircle} />
              <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                  <Icon />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardSubtitle}>{subtitle}</Text>
                <Text style={styles.getStarted}>Get started →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
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
  title: {
    ...Typography.h2,
    color: Colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.mutedForeground,
    marginBottom: 40,
  },
  cards: {
    gap: 16,
  },
  card: {
    borderRadius: Radius['2xl'],
    padding: 24,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardContent: {
    zIndex: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.h3,
    color: '#FFFFFF',
  },
  cardSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  getStarted: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
  },
});

export default RoleSelectScreen;
