import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Share, Clipboard, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { useReferralStats } from '../../../api/wallet';
import ReferralProgressBar from '../../../components/ReferralProgressBar';
import BackArrowIcon from '../../../components/BackArrowIcon';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Referral'>;

const GiftIcon: React.FC<{ color?: string; size?: number }> = ({ color = '#FFFFFF', size = 18 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Rect x={3} y={8} width={18} height={4} rx={1} />
    <Path d="M12 8v13" />
    <Path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <Path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </Svg>
);

const CopyIcon: React.FC<{ color?: string; size?: number }> = ({ color = '#FFFFFF', size = 16 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
    <Path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

const ShareIcon: React.FC<{ color?: string; size?: number }> = ({ color = '#FFFFFF', size = 16 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Circle cx={18} cy={5} r={3} />
    <Circle cx={6} cy={12} r={3} />
    <Circle cx={18} cy={19} r={3} />
    <Line x1={8.59} x2={15.42} y1={13.51} y2={17.49} />
    <Line x1={15.41} x2={8.59} y1={6.51} y2={10.49} />
  </Svg>
);

const ReferralScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { data: info, isLoading } = useReferralStats();

  if (isLoading || !info) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{color: Colors.mutedForeground}}>Loading...</Text>
      </View>
    );
  }

  const history = (info as any).history || [];
  const pendingCount = history.filter((h: any) => h.status === 'pending').length;
  const successfulCount = history.filter((h: any) => h.status === 'successful' || h.status === 'completed').length;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Connecto! Use my referral code ${info.code} when signing up. \nLink: connecto://invite/${info.code}`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(info.code);
    Alert.alert('Copied!', 'Referral code copied to clipboard.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon color={Colors.foreground} size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Referrals</Text>
      </View>

      {/* Referral card */}
      <LinearGradient
        colors={[...Gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.referralCard}>
        <View style={styles.decorCircle} />
        <View style={styles.giftIconWrap}>
          <GiftIcon />
        </View>
        <Text style={styles.cardTitle}>Invite & Earn</Text>
        <Text style={styles.cardSubtitle}>Share your code and earn ₹50 per referral</Text>

        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{info.code}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.codeBtn} onPress={handleCopy}>
              <CopyIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.codeBtn} onPress={handleShare}>
              <ShareIcon />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{info.totalReferred}</Text>
          <Text style={styles.statLabel}>Total Referred</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.accent }]}>₹{info.totalEarnings}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
      </View>
      
      {/* Ponytail: Add Pending/Successful Summary */}
      <View style={[styles.statsRow, { marginTop: 8 }]}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#eab308' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>{successfulCount}</Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
      </View>

      {/* Milestones */}
      <Text style={styles.sectionLabel}>MILESTONES</Text>
      <View style={styles.milestones}>
        {info.milestones.map((m, i) => (
          <ReferralProgressBar
            key={i}
            current={info.totalReferred}
            target={m.target}
            reward={m.reward}
            reached={m.reached}
          />
        ))}
      </View>

      {/* History */}
      <Text style={styles.sectionLabel}>REFERRAL HISTORY</Text>
      <View style={styles.historyList}>
        {(info as any).history?.length === 0 ? (
          <Text style={{ color: Colors.mutedForeground, textAlign: 'center', marginTop: 12 }}>No referrals yet.</Text>
        ) : (
          (info as any).history?.map((ref: any, idx: number) => (
            <View key={idx} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <View>
                  <Text style={styles.historyName}>{ref.referred?.name || ref.referred?.phone_number || 'Unknown User'}</Text>
                  <Text style={styles.historyDate}>{new Date(ref.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, (ref.status === 'completed' || ref.status === 'successful') && styles.statusBadgeCompleted]}>
                <Text style={[styles.statusText, (ref.status === 'completed' || ref.status === 'successful') && styles.statusTextCompleted]}>
                  {ref.status || 'pending'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
  },
  title: {
    ...Typography.h3,
    color: Colors.foreground,
  },
  referralCard: {
    borderRadius: Radius['2xl'],
    padding: 20,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    ...Typography.h4,
    color: '#FFFFFF',
  },
  giftIconWrap: {
    marginBottom: 12,
  },
  cardSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  codeBox: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.xl,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    ...Typography.button,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.foreground,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.mutedForeground,
    marginTop: 24,
    marginBottom: 12,
  },
  milestones: {
    gap: 12,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: Radius.xl,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyName: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
  },
  historyDate: {
    ...Typography.small,
    color: Colors.mutedForeground,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(234,179,8,0.1)', // yellow
  },
  statusText: {
    ...Typography.caption,
    color: '#eab308',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(34,197,94,0.1)', // green
  },
  statusTextCompleted: {
    color: '#22c55e',
  },
});

export default ReferralScreen;
