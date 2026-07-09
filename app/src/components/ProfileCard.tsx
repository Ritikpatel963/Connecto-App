import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors, Gradients } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import type { UserProfile } from '../shared/types/app';
import OnlineIndicator from './OnlineIndicator';
import PremiumBadge from './PremiumBadge';
import RatingStars from './RatingStars';

type IconProps = {
  color?: string;
  size?: number;
};

const VERIFIED_ICON_SIZE = 14;
const CALL_ICON_SMALL_SIZE = 14;
const CALL_ICON_GRID_SIZE = 12;

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

const PhoneIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = CALL_ICON_SMALL_SIZE }) => (
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

interface ProfileCardProps {
  profile: UserProfile;
  onCall?: () => void;
  onPress?: () => void;
  isFavorite?: boolean;
  variant?: 'grid' | 'list';
  role?: 'boy' | 'girl' | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onCall,
  onPress,
  isFavorite: _isFavorite,
  variant = 'grid',
  role,
}) => {
  const gradientColors = role === 'girl' ? [...Gradients.girl] : [...Gradients.boy];

  if (variant === 'list') {
    return (
      <TouchableOpacity onPress={onPress} style={styles.listCard} activeOpacity={0.7}>
        <View>
          <Image source={{ uri: profile.avatar }} style={styles.listAvatar} />
          <View style={styles.listIndicator}>
            <OnlineIndicator isOnline={profile.isOnline} size="sm" />
          </View>
        </View>
        <View style={styles.listInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.listName} numberOfLines={1}>{profile.name}</Text>
            {profile.isPremium && <PremiumBadge size="sm" />}
            {profile.isVerified && <BadgeCheckIcon />}
          </View>
          <Text style={styles.listBio} numberOfLines={1}>{profile.bio}</Text>
          <View style={styles.listMeta}>
            <RatingStars rating={profile.rating} size={12} />
            {profile.role !== 'boy' && (
              <Text style={styles.listPrice}>
                {profile.packageName ? `${profile.pricePerMinute} coins/min` : `₹${profile.pricePerMinute}/min`}
              </Text>
            )}
          </View>
        </View>
        {role === 'boy' && (
          <TouchableOpacity onPress={onCall} activeOpacity={0.8}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.callBtnSmall}>
              <PhoneIcon size={CALL_ICON_SMALL_SIZE} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.gridCard} activeOpacity={0.8}>
      <Image source={{ uri: profile.avatar }} style={styles.gridImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gridOverlay}
      />

      {/* Top badges */}
      <View style={styles.gridTopBadges}>
        <OnlineIndicator isOnline={profile.isOnline} size="md" />
        {profile.isPremium && <PremiumBadge size="sm" />}
      </View>

      {/* Bottom info */}
      <View style={styles.gridBottom}>
        <View style={styles.nameRow}>
          <Text style={styles.gridName}>
            {profile.name}, {profile.age}
          </Text>
          {profile.isVerified && <BadgeCheckIcon />}
        </View>
        <Text style={styles.gridSub}>
          {profile.city} {profile.role !== 'boy' && `· ${profile.packageName ? `${profile.pricePerMinute} coins/min` : `₹${profile.pricePerMinute}/min`}`}
        </Text>
        <View style={styles.gridFooter}>
          <RatingStars rating={profile.rating} size={12} />
          {role === 'boy' && (
            <TouchableOpacity onPress={onCall} activeOpacity={0.8}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.callBtnGrid}>
                <PhoneIcon size={CALL_ICON_GRID_SIZE} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List variant
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
  },
  listAvatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
  },
  listIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  listInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listName: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
    flexShrink: 1,
  },
  verified: {
    width: VERIFIED_ICON_SIZE,
    height: VERIFIED_ICON_SIZE,
  },
  listBio: {
    ...Typography.small,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  listPrice: {
    ...Typography.small,
    color: Colors.mutedForeground,
  },
  callBtnSmall: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Grid variant
  gridCard: {
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridTopBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  gridName: {
    ...Typography.bodyBold,
    color: Colors.foreground,
  },
  gridSub: {
    ...Typography.caption,
    color: Colors.white60,
    marginTop: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  callBtnGrid: {
    width: 32,
    height: 32,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileCard;
