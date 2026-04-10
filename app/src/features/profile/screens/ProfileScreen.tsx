import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { mockProfiles } from '../../../shared/data/mockData';
import { useUser } from '../../../context/UserContext';
import OnlineIndicator from '../../../components/OnlineIndicator';
import PremiumBadge from '../../../components/PremiumBadge';
import RatingStars from '../../../components/RatingStars';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const { height } = Dimensions.get('window');

const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const { role } = useUser();
  const profile = mockProfiles.find(p => p.id === id);

  if (!profile) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Hero image */}
      <View style={styles.hero}>
        <Image source={{ uri: profile.avatar }} style={styles.heroImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', Colors.background]}
          style={styles.heroOverlay}
        />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: '#FFF' }}>←</Text>
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
            {profile.isVerified && <Text style={styles.verified}>✓</Text>}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📍 {profile.city}</Text>
            <Text style={styles.metaText}>🌐 {profile.languages.join(', ')}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionRow}>
          {role === 'boy' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Call', { id: profile.id })}
              activeOpacity={0.8}
              style={styles.callBtnWrapper}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.callBtn}>
                <Text style={styles.callBtnText}>📞 Call · ₹{profile.pricePerMinute}/min</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={{ fontSize: 20 }}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Conversation', { id: `chat-0` })}
            style={styles.iconBtn}>
            <Text style={{ fontSize: 20 }}>💬</Text>
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
            <Text style={styles.statValue}>₹{profile.pricePerMinute}/min</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={[styles.card, { marginBottom: 100 }]}>
          <Text style={styles.sectionLabel}>INTERESTS</Text>
          <View style={styles.tagsRow}>
            {profile.interests.map(interest => (
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
    top: 16,
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
  verified: {
    fontSize: 20,
    color: Colors.accent,
    fontWeight: '700',
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
