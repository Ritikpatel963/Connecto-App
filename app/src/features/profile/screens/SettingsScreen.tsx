import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import PremiumBadge from '../../../components/PremiumBadge';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

type MenuScreen = 'ProfileSetup' | 'MainTabs' | 'Referral';

type MenuItem = {
  icon: string;
  label: string;
  screen?: MenuScreen;
};

const menuItems: ReadonlyArray<MenuItem> = [
  { icon: '👤', label: 'Edit Profile', screen: 'ProfileSetup' },
  { icon: '✓', label: 'Verification' },
  { icon: '💰', label: 'Wallet', screen: 'MainTabs' },
  { icon: '🎁', label: 'Referral Program', screen: 'Referral' },
  { icon: '🔔', label: 'Notification Settings' },
  { icon: '🛡️', label: 'Privacy & Security' },
  { icon: '🌐', label: 'Language' },
  { icon: '❓', label: 'Help & Support' },
];

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentUser, role, resetSession } = useUser();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    resetSession();
    if (rootNavigation) {
      rootNavigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 92 },
      ]}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile header */}
      <View style={styles.profileCard}>
        <View>
          <View style={styles.avatarBox}>
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={{ fontSize: 28 }}>👤</Text>
            )}
          </View>
          {currentUser?.isPremium && (
            <View style={styles.premiumBadge}>
              <PremiumBadge size="sm" />
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
          <Text style={styles.profileMeta}>
            {role} · {currentUser?.city || 'India'}
          </Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: role === 'girl' ? 'rgba(244,114,182,0.1)' : 'rgba(107,159,255,0.1)' },
            ]}>
            <Text
              style={[
                styles.roleBadgeText,
                { color: role === 'girl' ? Colors.girl : Colors.boy },
              ]}>
              {role === 'girl' ? 'Receiver' : 'Caller'}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 16, color: Colors.mutedForeground }}>›</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map(({ icon, label, screen }) => (
          <TouchableOpacity
            key={label}
            onPress={() => screen && navigation.navigate(screen)}
            style={styles.menuItem}
            activeOpacity={0.7}>
            <View style={styles.menuIconBox}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
        <View style={styles.logoutIcon}>
          <Text style={{ fontSize: 18 }}>🚪</Text>
        </View>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  title: {
    ...Typography.h3,
    color: Colors.foreground,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.card,
    borderRadius: Radius['2xl'],
    padding: 20,
    marginBottom: 24,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 64,
    height: 64,
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.bodyBold,
    color: Colors.foreground,
  },
  profileMeta: {
    ...Typography.small,
    color: Colors.mutedForeground,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  roleBadgeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  menu: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.xl,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.foreground,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: Radius.xl,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    ...Typography.bodyMedium,
    color: Colors.destructive,
  },
});

export default SettingsScreen;
