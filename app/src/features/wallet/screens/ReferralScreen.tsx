import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import { mockReferralInfo } from '../../../shared/data/mockData';
import ReferralProgressBar from '../../../components/ReferralProgressBar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Referral'>;

const ReferralScreen: React.FC<Props> = ({ navigation }) => {
  const info = mockReferralInfo;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18, color: Colors.foreground }}>←</Text>
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
        <Text style={{ fontSize: 28, marginBottom: 12 }}>🎁</Text>
        <Text style={styles.cardTitle}>Invite & Earn</Text>
        <Text style={styles.cardSubtitle}>Share your code and earn ₹50 per referral</Text>

        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{info.code}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.codeBtn}>
              <Text style={{ fontSize: 14, color: '#FFF' }}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.codeBtn}>
              <Text style={{ fontSize: 14, color: '#FFF' }}>↗</Text>
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
    paddingTop: 16,
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
});

export default ReferralScreen;
