import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Line, Path } from 'react-native-svg';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { mockProfiles } from '../../../shared/data/mockData';
import { useUser } from '../../../context/UserContext';
import RatingStars from '../../../components/RatingStars';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Call'>;

type IconProps = {
  color?: string;
  size?: number;
};

const CONTROL_ICON_SIZE = 22;
const END_CALL_ICON_SIZE = 24;

const MicIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = CONTROL_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <Line x1={12} x2={12} y1={19} y2={22} />
  </Svg>
);

const MicOffIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = CONTROL_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Line x1={2} x2={22} y1={2} y2={22} />
    <Path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
    <Path d="M5 10v2a7 7 0 0 0 12 5" />
    <Path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <Path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <Line x1={12} x2={12} y1={19} y2={22} />
  </Svg>
);

const VolumeXIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = CONTROL_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <Line x1={22} x2={16} y1={9} y2={15} />
    <Line x1={16} x2={22} y1={9} y2={15} />
  </Svg>
);

const Volume2Icon: React.FC<IconProps> = ({ color = '#FFFFFF', size = CONTROL_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <Path d="M16 9a5 5 0 0 1 0 6" />
    <Path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
  </Svg>
);

const PhoneOffIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = END_CALL_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
    <Line x1={22} x2={2} y1={2} y2={22} />
  </Svg>
);

const CallScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
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
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              activeOpacity={0.85}
              style={styles.doneBtnPressable}>
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
              {muted ? <MicOffIcon /> : <MicIcon />}
            </TouchableOpacity>
            <TouchableOpacity onPress={endCall} style={styles.endBtn}>
              <PhoneOffIcon />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSpeaker(!speaker)}
              style={[styles.controlBtn, speaker && styles.controlBtnActive]}>
              {speaker ? <Volume2Icon /> : <VolumeXIcon />}
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
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.glow,
  },
  doneBtnPressable: {
    width: '100%',
  },
  doneBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});

export default CallScreen;
