import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import type { UserRole } from '../../../shared/types/app';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const roles: { role: UserRole; icon: string; title: string; subtitle: string; gradient: readonly [string, string] }[] = [
  { role: 'boy', icon: '📞', title: 'Boy', subtitle: 'Discover & call amazing people', gradient: Gradients.boy },
  { role: 'girl', icon: '🎧', title: 'Girl', subtitle: 'Earn by taking calls', gradient: Gradients.girl },
];

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { setRole } = useUser();

  const handleSelect = (role: UserRole) => {
    setRole(role);
    navigation.replace('ProfileSetup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How will you use Connecto?</Text>
      <Text style={styles.subtitle}>Choose your role to get started</Text>

      <View style={styles.cards}>
        {roles.map(({ role, icon, title, subtitle, gradient }) => (
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
                  <Text style={styles.iconEmoji}>{icon}</Text>
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
    paddingTop: 64,
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
  iconEmoji: {
    fontSize: 24,
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
