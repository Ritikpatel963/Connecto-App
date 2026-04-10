import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';
import type { UserProfile } from '../shared/types/app';
import OnlineIndicator from './OnlineIndicator';
import PremiumBadge from './PremiumBadge';
import RatingStars from './RatingStars';

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
            {profile.isVerified && <Text style={styles.verified}>✓</Text>}
          </View>
          <Text style={styles.listBio} numberOfLines={1}>{profile.bio}</Text>
          <View style={styles.listMeta}>
            <RatingStars rating={profile.rating} size={12} />
            <Text style={styles.listPrice}>₹{profile.pricePerMinute}/min</Text>
          </View>
        </View>
        {role === 'boy' && (
          <TouchableOpacity onPress={onCall} activeOpacity={0.8}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.callBtnSmall}>
              <Text style={styles.callIcon}>📞</Text>
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
          {profile.isVerified && <Text style={styles.verifiedGrid}>✓</Text>}
        </View>
        <Text style={styles.gridSub}>
          {profile.city} · ₹{profile.pricePerMinute}/min
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
                <Text style={{ fontSize: 12 }}>📞</Text>
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
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '700',
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
  callIcon: {
    fontSize: 18,
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
  verifiedGrid: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '700',
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
