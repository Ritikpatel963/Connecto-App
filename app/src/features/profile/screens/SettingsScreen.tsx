import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import PremiumBadge from '../../../components/PremiumBadge';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

type MenuScreen = 'ProfileSetup' | 'MainTabs' | 'Referral' | 'Notifications' | 'PrivacySecurity' | 'Verification' | 'Content';
type MenuTab = 'Wallet';

type MenuItem = {
  icon: 'user' | 'verification' | 'wallet' | 'referral' | 'notification' | 'privacy' | 'language' | 'help';
  label: string;
  screen?: MenuScreen;
  tab?: MenuTab;
  params?: any;
};

type IconProps = {
  color?: string;
  size?: number;
};

const UserIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

const BadgeCheckIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <Path d="m9 12 2 2 4-4" />
  </Svg>
);

const WalletIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </Svg>
);

const GiftIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={3} y={8} width={18} height={4} rx={1} />
    <Path d="M12 8v13" />
    <Path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <Path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </Svg>
);

const BellIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

const ShieldIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

const GlobeIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Path d="M2 12h20" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

const HelpIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Path d="M12 17h.01" />
  </Svg>
);

const LogoutIcon: React.FC<IconProps> = ({ color = Colors.destructive, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Polyline points="16 17 21 12 16 7" />
    <Line x1={21} x2={9} y1={12} y2={12} />
  </Svg>
);

const menuItems: ReadonlyArray<MenuItem> = [
  { icon: 'user', label: 'Edit Profile', screen: 'ProfileSetup', params: { isEdit: true } },
  { icon: 'verification', label: 'Verification', screen: 'Verification' },
  { icon: 'wallet', label: 'Wallet', tab: 'Wallet' },
  { icon: 'referral', label: 'Referral Program', screen: 'Referral' },
  { icon: 'privacy', label: 'Privacy & Security', screen: 'Content', params: { title: 'Privacy & Security', contentKey: 'privacy_policy' } },
  { icon: 'help', label: 'Help & Support', screen: 'Content', params: { title: 'Help & Support', contentKey: 'help_support' } },
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

  const renderMenuIcon = (icon: MenuItem['icon']) => {
    switch (icon) {
      case 'user':
        return <UserIcon />;
      case 'verification':
        return <BadgeCheckIcon />;
      case 'wallet':
        return <WalletIcon />;
      case 'referral':
        return <GiftIcon />;
      case 'notification':
        return <BellIcon />;
      case 'privacy':
        return <ShieldIcon />;
      case 'language':
        return <GlobeIcon />;
      case 'help':
        return <HelpIcon />;
      default:
        return <HelpIcon />;
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.tab) {
      navigation.navigate(item.tab);
      return;
    }

    if (item.screen) {
      if (item.params) {
        navigation.navigate(item.screen as any, item.params);
      } else {
        navigation.navigate(item.screen as any);
      }
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
            {currentUser?.isVerified && <BadgeCheckIcon size={16} color="#10B981" />}
          </View>
          <Text style={styles.profileMeta}>
            {role === 'girl' ? 'Receiver' : 'Caller'} · {currentUser?.city || 'India'}
          </Text>

        </View>
        <Text style={{ fontSize: 16, color: Colors.mutedForeground }}>›</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.label}
            onPress={() => handleMenuPress(item)}
            style={styles.menuItem}
            activeOpacity={0.7}>
            <View style={styles.menuIconBox}>
              {renderMenuIcon(item.icon)}
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
        <View style={styles.logoutIcon}>
          <LogoutIcon />
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
