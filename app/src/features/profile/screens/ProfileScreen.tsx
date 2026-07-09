import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import BackArrowIcon from '../../../components/BackArrowIcon';
import { useProfiles } from '../../../api/users';
import { useUser } from '../../../context/UserContext';
import OnlineIndicator from '../../../components/OnlineIndicator';
import PremiumBadge from '../../../components/PremiumBadge';
import RatingStars from '../../../components/RatingStars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const { height } = Dimensions.get('window');

type IconProps = {
  color?: string;
  size?: number;
};

const VERIFIED_ICON_SIZE = 14;
const ACTION_ICON_SIZE = 20;
const CALL_ICON_SIZE = 14;

const BadgeCheckIcon: React.FC<IconProps> = ({ color = Colors.accent, size = VERIFIED_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <Path d="m9 12 2 2 4-4" />
  </Svg>
);

const PhoneIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = CALL_ICON_SIZE }) => (
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

const ChatIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = ACTION_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

const HeartIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = ACTION_ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const { role, currentUser } = useUser();
  const { data: profiles = [] } = useProfiles();
  const profile = route.params.profile || profiles.find(p => String(p.id) === String(id));

  if (!profile) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      bounces={false}>
      {/* Hero image */}
      <View style={styles.hero}>
        <Image source={{ uri: profile.avatar }} style={styles.heroImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', Colors.background]}
          style={styles.heroOverlay}
        />

        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { top: insets.top + 16 }]}>
          <BackArrowIcon color="#FFFFFF" size={20} />
        </TouchableOpacity>

        <View style={styles.heroBottom}>
          <View style={styles.onlineRow}>
            <OnlineIndicator isOnline={profile.isOnline} />
            <Text style={styles.onlineText}>
              {profile.isOnline ? 'Online' : profile.lastSeen || 'Offline'}
            </Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.heroName}>{profile.name}, {profile.age}</Text>
            {profile.isPremium && <PremiumBadge size="md" />}
            {profile.isVerified && <BadgeCheckIcon />}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📍 {profile.city}</Text>
            {profile.languages && profile.languages.length > 0 && (
              <Text style={styles.metaText}>🌐 {profile.languages.join(', ')}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionRow}>
          {role === 'boy' && (
            <TouchableOpacity
              onPress={() => {
                if (!currentUser?.isVerified) return Alert.alert('Not Verified', 'Admin has not verified your profile yet.');
                navigation.navigate('Call', { id: profile.id });
              }}
              activeOpacity={0.8}
              style={styles.callBtnWrapper}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.callBtn}>
                <View style={styles.callBtnContent}>
                  <PhoneIcon />
                  <Text style={styles.callBtnText}>
                    Call · ₹{profile.pricePerMinute}/min
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn}>
            <HeartIcon />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!currentUser?.isVerified) return Alert.alert('Not Verified', 'Admin has not verified your profile yet.');
              navigation.navigate('Conversation', { id: `chat-${profile.id}`, profile });
            }}
            style={styles.iconBtn}>
            <ChatIcon />
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={{ marginTop: 4 }}>
              <RatingStars rating={profile.rating} size={10} />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.totalCalls}</Text>
            <Text style={styles.statLabel}>Calls</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ₹{profile.pricePerMinute}
            </Text>
            <Text style={styles.statLabel}>
              Rate
            </Text>
          </View>
        </View>

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>LANGUAGES</Text>
            <View style={styles.tagsRow}>
              {profile.languages.map((lang: string) => (
                <View key={lang} style={[styles.tag, { backgroundColor: 'rgba(107,159,255,0.1)' }]}>
                  <Text style={[styles.tagText, { color: Colors.primary }]}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Interests */}
        <View style={[styles.card, { marginBottom: 100 }]}>
          <Text style={styles.sectionLabel}>INTERESTS</Text>
          <View style={styles.tagsRow}>
            {profile.interests.map((interest: string) => (
              <View key={interest} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: Colors.mutedForeground,
  },
  hero: {
    height: height * 0.55,
    minHeight: 380,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  onlineText: {
    ...Typography.small,
    color: Colors.white70,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroName: {
    ...Typography.h2,
    color: Colors.foreground,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  metaText: {
    ...Typography.body,
    color: Colors.mutedForeground,
  },
  actions: {
    paddingHorizontal: 20,
    marginTop: -8,
    zIndex: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  callBtnWrapper: {
    flex: 1,
  },
  callBtn: {
    paddingVertical: 14,
    borderRadius: Radius.xl,
    alignItems: 'center',
    ...Elevation.glow,
  },
  callBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  iconBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  bioText: {
    ...Typography.body,
    color: Colors.foreground,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h4,
    color: Colors.foreground,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.muted,
    borderRadius: Radius.lg,
  },
  tagText: {
    ...Typography.small,
    color: Colors.foreground,
  },
});

export default ProfileScreen;
