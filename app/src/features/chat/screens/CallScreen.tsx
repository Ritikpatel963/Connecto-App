import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { mockProfiles } from '../../../shared/data/mockData';
import { useUser } from '../../../context/UserContext';
import RatingStars from '../../../components/RatingStars';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Call'>;

const CallScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const { walletBalance, setWalletBalance } = useUser();
  const profile = mockProfiles.find(p => p.id === id);
  const [callState, setCallState] = useState<'ringing' | 'active' | 'ended'>('ringing');
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [rating, setRating] = useState(0);

  const costPerMin = profile?.pricePerMinute || 10;
  const totalCost = Math.ceil(duration / 60) * costPerMin;

  useEffect(() => {
    if (callState === 'ringing') {
      const t = setTimeout(() => setCallState('active'), 3000);
      return () => clearTimeout(t);
    }
  }, [callState]);

  useEffect(() => {
    if (callState === 'active') {
      const t = setInterval(() => setDuration(d => d + 1), 1000);
      return () => clearInterval(t);
    }
  }, [callState]);

  const endCall = useCallback(() => {
    setCallState('ended');
    setWalletBalance(Math.max(0, walletBalance - totalCost));
  }, [totalCost, walletBalance, setWalletBalance]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.glow} />

      <View style={styles.center}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          {callState === 'ringing' && (
            <>
              <View style={[styles.ring, styles.ring1]} />
              <View style={[styles.ring, styles.ring2]} />
            </>
          )}
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.status}>
          {callState === 'ringing'
            ? 'Calling...'
            : callState === 'active'
            ? `₹${costPerMin}/min`
            : 'Call ended'}
        </Text>

        {/* Timer */}
        {callState !== 'ringing' && (
          <View style={styles.timerBox}>
            <Text style={styles.timer}>{formatTime(duration)}</Text>
            {callState === 'active' && (
              <Text style={styles.cost}>₹{totalCost} spent</Text>
            )}
          </View>
        )}

        {/* Controls or Rating */}
        {callState === 'ended' ? (
          <View style={styles.ratingCard}>
            <Text style={styles.rateLabel}>Rate your experience</Text>
            <View style={styles.starsRow}>
              <RatingStars rating={rating} size={32} interactive onChange={setRating} />
            </View>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{formatTime(duration)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cost</Text>
                <Text style={[styles.summaryValue, { color: Colors.primary }]}>₹{totalCost}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} activeOpacity={0.8}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => setMuted(!muted)}
              style={[styles.controlBtn, muted && styles.controlBtnActive]}>
              <Text style={{ fontSize: 22 }}>{muted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={endCall} style={styles.endBtn}>
              <Text style={{ fontSize: 24 }}>📵</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSpeaker(!speaker)}
              style={[styles.controlBtn, speaker && styles.controlBtnActive]}>
              <Text style={{ fontSize: 22 }}>{speaker ? '🔊' : '🔈'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: 'rgba(255,92,92,0.12)',
  },
  center: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    zIndex: 10,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    marginBottom: 24,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: Colors.card,
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: 'rgba(255,92,92,0.3)',
  },
  ring1: {
    transform: [{ scale: 1.3 }],
    opacity: 0.4,
  },
  ring2: {
    transform: [{ scale: 1.5 }],
    opacity: 0.2,
  },
  name: {
    ...Typography.h3,
    color: Colors.foreground,
  },
  status: {
    ...Typography.body,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  timerBox: {
    alignItems: 'center',
    marginTop: 16,
  },
  timer: {
    ...Typography.mono,
    color: Colors.foreground,
  },
  cost: {
    ...Typography.bodySemibold,
    color: Colors.primary,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 64,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: Colors.primary,
  },
  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.md,
  },
  ratingCard: {
    marginTop: 40,
    backgroundColor: Colors.card,
    borderRadius: Radius['2xl'],
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  rateLabel: {
    ...Typography.body,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  starsRow: {
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: Colors.muted,
    borderRadius: Radius.xl,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.mutedForeground,
  },
  summaryValue: {
    ...Typography.bodyMedium,
    color: Colors.foreground,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.xl,
    alignItems: 'center',
    ...Elevation.glow,
  },
  doneBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});

export default CallScreen;
