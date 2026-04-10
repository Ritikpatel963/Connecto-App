import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import BackArrowIcon from '../../../components/BackArrowIcon';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacySecurity'>;

type IconProps = {
  color?: string;
  size?: number;
};

type SettingToggleProps = {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  value: boolean;
  onToggle: (v: boolean) => void;
};

type SettingNavProps = {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
};

const ShieldIcon: React.FC<IconProps> = ({ color = Colors.primary, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

const OnlineIcon: React.FC<IconProps> = ({ color = Colors.accent, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={8} />
    <Circle cx={12} cy={12} r={2} fill={color} stroke="none" />
  </Svg>
);

const EyeIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <Circle cx={12} cy={12} r={3} />
  </Svg>
);

const ClockIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

const CheckBadgeIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <Path d="m9 12 2 2 4-4" />
  </Svg>
);

const LockIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <RectPath />
  </Svg>
);

const RectPath = () => (
  <>
    <Path d="M7 10V7a5 5 0 0 1 10 0v3" />
    <Path d="M5 10h14v10H5z" />
  </>
);

const FingerprintIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 11a2 2 0 0 1 2 2v4" />
    <Path d="M18 8a6 6 0 0 0-12 0v5" />
    <Path d="M8 17a4 4 0 0 0 8 0" />
    <Path d="M12 2a10 10 0 0 0-10 10" />
  </Svg>
);

const CameraOffIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 2l20 20" />
    <Path d="M21 15V7a2 2 0 0 0-2-2H9" />
    <Path d="M7 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12" />
  </Svg>
);

const MicIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <Line x1={12} x2={12} y1={19} y2={22} />
  </Svg>
);

const BanIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Line x1={4.9} x2={19.1} y1={19.1} y2={4.9} />
  </Svg>
);

const FlagIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 22V4" />
    <Path d="M4 4h9l-1 3h9l-2 5H9" />
  </Svg>
);

const DownloadIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 3v12" />
    <Path d="m7 10 5 5 5-5" />
    <Path d="M5 21h14" />
  </Svg>
);

const TrashIcon: React.FC<IconProps> = ({ color = Colors.destructive, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18" />
    <Path d="M8 6V4h8v2" />
    <Path d="M19 6l-1 14H6L5 6" />
  </Svg>
);

const SettingToggle = ({ icon, label, subtitle, value, onToggle }: SettingToggleProps) => (
  <View style={styles.settingRow}>
    <View style={styles.settingIconWrap}>{icon}</View>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingSub}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: Colors.border, true: 'rgba(255,92,92,0.35)' }}
      thumbColor={value ? Colors.primary : Colors.mutedForeground}
    />
  </View>
);

const SettingNav = ({ icon, label, subtitle, onPress, danger }: SettingNavProps) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.settingRow}>
    <View style={styles.settingIconWrap}>{icon}</View>
    <View style={styles.settingInfo}>
      <Text style={[styles.settingLabel, danger && { color: Colors.destructive }]}>{label}</Text>
      <Text style={styles.settingSub}>{subtitle}</Text>
    </View>
    <Text style={[styles.chevron, danger && { color: Colors.destructive }]}>›</Text>
  </TouchableOpacity>
);

const PrivacySecurityScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showOnline, setShowOnline] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [screenRecordBlock, setScreenRecordBlock] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [callRecording, setCallRecording] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data, wallet balance, and conversations will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.'),
        },
      ],
    );
  };

  const handleBlockedUsers = () => {
    Alert.alert('Blocked Users', 'No blocked users yet.');
  };

  const handleReportHistory = () => {
    Alert.alert('Report History', 'You have no reports.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrowIcon color={Colors.foreground} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}> 
        {/* Security Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconWrap}>
            <ShieldIcon color={Colors.primary} size={32} />
          </View>
          <Text style={styles.statusTitle}>Account Security</Text>
          <Text style={styles.statusSub}>
            {twoFactor ? 'Your account is well protected' : 'Enable 2FA for better security'}
          </Text>
          <View style={styles.statusBadgeRow}>
            <View style={[styles.statusBadge, twoFactor ? styles.badgeGood : styles.badgeWarn]}>
              <Text style={[styles.statusBadgeText, twoFactor ? styles.badgeGoodText : styles.badgeWarnText]}>
                {twoFactor ? '✓ 2FA Enabled' : '⚠ 2FA Off'}
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.badgeGood]}>
              <Text style={[styles.statusBadgeText, styles.badgeGoodText]}>✓ Phone Verified</Text>
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.sectionCard}>
          <SettingToggle
            icon={<OnlineIcon />}
            label="Show Online Status"
            subtitle="Let others see when you're online"
            value={showOnline}
            onToggle={setShowOnline}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon={<ClockIcon />}
            label="Show Last Seen"
            subtitle="Display your last active time"
            value={showLastSeen}
            onToggle={setShowLastSeen}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon={<EyeIcon />}
            label="Profile Visibility"
            subtitle="Appear in discovery for other users"
            value={profileVisible}
            onToggle={setProfileVisible}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon={<CheckBadgeIcon />}
            label="Read Receipts"
            subtitle="Show when you've read messages"
            value={readReceipts}
            onToggle={setReadReceipts}
          />
        </View>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.sectionCard}>
          <SettingToggle
            icon={<LockIcon />}
            label="Two-Factor Authentication"
            subtitle="Extra layer of security on login"
            value={twoFactor}
            onToggle={setTwoFactor}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon={<FingerprintIcon />}
            label="Biometric Lock"
            subtitle="Require Face ID / fingerprint to open app"
            value={biometric}
            onToggle={setBiometric}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon={<CameraOffIcon />}
            label="Block Screen Recording"
            subtitle="Prevent screenshots during calls"
            value={screenRecordBlock}
            onToggle={setScreenRecordBlock}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon={<MicIcon />}
            label="Allow Call Recording"
            subtitle="Let the other party record calls"
            value={callRecording}
            onToggle={setCallRecording}
          />
        </View>

        {/* Manage Section */}
        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.sectionCard}>
          <SettingNav
            icon={<BanIcon />}
            label="Blocked Users"
            subtitle="View and manage blocked users"
            onPress={handleBlockedUsers}
          />
          <View style={styles.divider} />
          <SettingNav
            icon={<FlagIcon />}
            label="Report History"
            subtitle="See your past reports"
            onPress={handleReportHistory}
          />
          <View style={styles.divider} />
          <SettingNav
            icon={<DownloadIcon />}
            label="Download My Data"
            subtitle="Request a copy of your data"
            onPress={() => Alert.alert('Data Request', 'Your data export will be ready within 24 hours.')}
          />
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: Colors.destructive }]}>Danger Zone</Text>
        <View style={[styles.sectionCard, { borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1 }]}> 
          <SettingNav
            icon={<TrashIcon />}
            label="Delete Account"
            subtitle="Permanently delete all your data"
            onPress={handleDeleteAccount}
            danger
          />
        </View>

        <Text style={styles.footerNote}>
          Your privacy matters. We never sell your data to third parties. Read our full Privacy Policy for more details.
        </Text>

        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.lg,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...Typography.h4, color: Colors.foreground },
  scroll: { paddingHorizontal: 16 },

  // Status Card
  statusCard: {
    backgroundColor: Colors.card, borderRadius: Radius['2xl'], padding: 24,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: Colors.border,
  },
  statusIconWrap: {
    width: 64, height: 64, borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,92,92,0.15)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  statusTitle: { ...Typography.h4, color: Colors.foreground, marginBottom: 4 },
  statusSub: { ...Typography.small, color: Colors.mutedForeground, textAlign: 'center' },
  statusBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.md },
  statusBadgeText: { ...Typography.caption },
  badgeGood: { backgroundColor: 'rgba(45,212,168,0.15)' },
  badgeGoodText: { color: Colors.accent },
  badgeWarn: { backgroundColor: 'rgba(245,166,35,0.15)' },
  badgeWarnText: { color: Colors.secondary },

  // Section
  sectionTitle: {
    ...Typography.label,
    color: Colors.mutedForeground,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', marginBottom: 24,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
  },
  settingIconWrap: {
    width: 28,
    height: 28,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { ...Typography.bodySemibold, color: Colors.foreground },
  settingSub: { ...Typography.caption, color: Colors.mutedForeground, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.mutedForeground, fontWeight: '300' },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 56 },

  // Footer
  footerNote: {
    ...Typography.small,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default PrivacySecurityScreen;
