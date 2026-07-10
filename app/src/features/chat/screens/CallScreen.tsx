import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { useProfiles } from '../../../api/users';
import { useUser } from '../../../context/UserContext';
import { useSubmitRating } from '../../../api/ratings';
import RatingStars from '../../../components/RatingStars';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Call'>;

type IconProps = {
  color?: string;
  size?: number;
};

const CONTROL_ICON_SIZE = 22;
const END_CALL_ICON_SIZE = 24;
const MENU_ICON_SIZE = 20;
const TIP_CARD_WIDTH = Dimensions.get('window').width - 48;

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

const MoreVerticalIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = MENU_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Circle cx={12} cy={5} r={1.5} fill={color} stroke={color} />
    <Circle cx={12} cy={12} r={1.5} fill={color} stroke={color} />
    <Circle cx={12} cy={19} r={1.5} fill={color} stroke={color} />
  </Svg>
);

const callTips = [
  {
    title: 'Use earphones',
    text: 'Earphones make your voice clearer and keep your call private.',
  },
  {
    title: 'Be respectful',
    text: 'Polite and friendly conversations help avoid reports.',
  },
  {
    title: 'Reduce noise',
    text: 'Speak in a quiet place to improve quality and ratings.',
  },
];

const CallScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const { role, walletBalance, setWalletBalance, setIsOnline } = useUser();
  const { data: profiles = [], isLoading } = useProfiles();
  const profile = profiles.find(p => p.id === id);
  const [callState, setCallState] = useState<'ringing' | 'active' | 'ended'>('ringing');
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  
  const submitRating = useSubmitRating();

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
    setMenuOpen(false);
    setWalletBalance(Math.max(0, walletBalance - totalCost));
  }, [totalCost, walletBalance, setWalletBalance]);

  const reportUser = useCallback(() => {
    setMenuOpen(false);
    Alert.alert('Report submitted', 'Thanks for reporting. Our moderation team will review this call.');
  }, []);

  const goOffline = useCallback(() => {
    setMenuOpen(false);
    setIsOnline(false);
    Alert.alert('Status updated', 'You are now offline and will not receive new calls.');
  }, [setIsOnline]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const onTipScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    setActiveTip(Math.max(0, Math.min(callTips.length - 1, next)));
  }, []);

  if (!profile) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.backgroundArt}>
        <LinearGradient
          colors={[Colors.primary, Colors.transparent]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.ambientOrb, styles.ambientOrbTop]}
        />
        <LinearGradient
          colors={[Colors.boy, Colors.transparent]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ambientOrb, styles.ambientOrbBottom]}
        />
        <View style={[styles.arcLine, styles.arcLineOuter]} />
        <View style={[styles.arcLine, styles.arcLineInner]} />
      </View>
      {menuOpen && <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuOpen(false)} />}

      {callState !== 'ended' && (
        <View style={[styles.topActions, { top: insets.top + 12 }]}> 
          <TouchableOpacity
            onPress={() => setMenuOpen(!menuOpen)}
            activeOpacity={0.85}
            style={styles.topActionBtn}>
            <MoreVerticalIcon />
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.menuCard}>
              <TouchableOpacity onPress={reportUser} style={styles.menuItem} activeOpacity={0.8}>
                <Text style={styles.menuItemText}>Report</Text>
              </TouchableOpacity>
              {role === 'girl' && (
                <TouchableOpacity onPress={goOffline} style={styles.menuItem} activeOpacity={0.8}>
                  <Text style={[styles.menuItemText, styles.menuDangerText]}>Go offline</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

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
            ? `${costPerMin} Coins/min`
            : 'Call ended'}
        </Text>

        {/* Timer */}
        {callState !== 'ringing' && (
          <View style={styles.timerBox}>
            <Text style={styles.timer}>{formatTime(duration)}</Text>
            {callState === 'active' && (
              <Text style={styles.cost}>{totalCost} Coins spent</Text>
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
            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              maxLength={240}
              placeholder="Write your review..."
              placeholderTextColor={Colors.mutedForeground}
              value={review}
              onChangeText={setReview}
              textAlignVertical="top"
            />
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{formatTime(duration)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cost</Text>
                <Text style={[styles.summaryValue, { color: Colors.primary }]}>{totalCost} Coins</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={async () => {
                if (rating > 0 || review.trim().length > 0) {
                  await submitRating.mutateAsync({
                    targetUserId: profile.id,
                    rating,
                    reviewText: review
                  });
                }
                navigation.navigate('MainTabs');
              }}
              activeOpacity={0.85}
              style={styles.doneBtnPressable}
              disabled={submitRating.isPending}>
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

      {callState !== 'ended' && (
        <View style={[styles.tipsFooter, { bottom: insets.bottom + 10 }]}> 
          <Text style={styles.tipsTitle}>Quick tips</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onTipScrollEnd}
            contentContainerStyle={styles.tipsScrollerContent}>
            {callTips.map(tip => (
              <LinearGradient
                key={tip.title}
                colors={[Colors.card, Colors.surfaceElevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipCard}>
                <Text style={styles.tipHeading}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </LinearGradient>
            ))}
          </ScrollView>
          <View style={styles.tipDotsRow}>
            {callTips.map((_, index) => (
              <View key={String(index)} style={[styles.tipDot, index === activeTip && styles.tipDotActive]} />
            ))}
          </View>
        </View>
      )}
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
  backgroundArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
  },
  ambientOrbTop: {
    width: 320,
    height: 320,
    top: -110,
    right: -80,
    transform: [{ rotate: '18deg' }],
  },
  ambientOrbBottom: {
    width: 260,
    height: 260,
    bottom: 80,
    left: -95,
    transform: [{ rotate: '-20deg' }],
  },
  arcLine: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.white20,
    borderRadius: 999,
  },
  arcLineOuter: {
    width: 420,
    height: 420,
    top: 120,
    left: -120,
    transform: [{ rotate: '24deg' }],
    opacity: 0.28,
  },
  arcLineInner: {
    width: 280,
    height: 280,
    top: 184,
    right: -70,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.2,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.transparent,
    zIndex: 20,
  },
  topActions: {
    position: 'absolute',
    right: 20,
    zIndex: 30,
    alignItems: 'flex-end',
  },
  topActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.md,
  },
  menuCard: {
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    minWidth: 160,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Elevation.md,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  menuItemText: {
    ...Typography.bodyMedium,
    color: Colors.foreground,
  },
  menuDangerText: {
    color: Colors.destructive,
  },
  tipsFooter: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 15,
  },
  tipsTitle: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  tipsScrollerContent: {
    alignItems: 'stretch',
  },
  tipCard: {
    width: TIP_CARD_WIDTH,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Elevation.md,
  },
  tipHeading: {
    ...Typography.smallSemibold,
    color: Colors.primary,
    marginBottom: 6,
  },
  tipText: {
    ...Typography.body,
    color: Colors.foreground,
    lineHeight: 21,
  },
  tipDotsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.mutedForeground,
    opacity: 0.5,
  },
  tipDotActive: {
    width: 18,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 1,
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
  reviewInput: {
    width: '100%',
    minHeight: 96,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.muted,
    backgroundColor: Colors.background,
    color: Colors.foreground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Typography.body,
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
