import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const { role, setCurrentUser, setIsAuthenticated } = useUser();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');

  const handleComplete = () => {
    if (name && age) {
      setCurrentUser({
        id: 'me',
        name,
        age: parseInt(age),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        role: role!,
        bio,
        isOnline: true,
        isPremium: false,
        isVerified: false,
        rating: 0,
        totalCalls: 0,
        pricePerMinute: role === 'girl' ? 8 : 0,
        languages: ['Hindi', 'English'],
        interests: [],
        city,
      });
      setIsAuthenticated(true);
      navigation.replace('MainTabs');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Set up your profile</Text>
      <Text style={styles.subtitle}>Let people know who you are</Text>

      {/* Avatar placeholder */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarBox}>
          <Text style={styles.cameraIcon}>📷</Text>
        </View>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addBadge}>
          <Text style={styles.addText}>+</Text>
        </LinearGradient>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>AGE</Text>
            <TextInput
              value={age}
              onChangeText={t => setAge(t.replace(/\D/g, ''))}
              placeholder="Age"
              placeholderTextColor={Colors.mutedForeground}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>CITY</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={Colors.mutedForeground}
              style={styles.input}
            />
          </View>
        </View>

        <View>
          <Text style={styles.label}>BIO</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell something about yourself..."
            placeholderTextColor={Colors.mutedForeground}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
        </View>

        {role === 'girl' && (
          <View style={styles.voiceCard}>
            <View style={styles.voiceRow}>
              <LinearGradient
                colors={[...Gradients.girl]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.voiceIcon}>
                <Text style={{ fontSize: 18 }}>🎤</Text>
              </LinearGradient>
              <View>
                <Text style={styles.voiceTitle}>Voice Verification</Text>
                <Text style={styles.voiceSubtitle}>Record a 10-sec sample to get verified</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.recordBtn} activeOpacity={0.7}>
              <Text style={styles.recordBtnText}>Record Voice Sample</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleComplete}
        disabled={!name || !age}
        activeOpacity={0.8}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.submitBtn, (!name || !age) && styles.disabled]}>
          <Text style={styles.submitText}>Complete Setup →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    ...Typography.h2,
    color: Colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.mutedForeground,
    marginBottom: 32,
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarBox: {
    width: 96,
    height: 96,
    borderRadius: Radius['2xl'],
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 32,
  },
  addBadge: {
    position: 'absolute',
    bottom: -4,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  label: {
    ...Typography.label,
    color: Colors.mutedForeground,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.foreground,
    ...Typography.body,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  half: {
    flex: 1,
  },
  voiceCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTitle: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
  },
  voiceSubtitle: {
    ...Typography.small,
    color: Colors.mutedForeground,
  },
  recordBtn: {
    marginTop: 12,
    backgroundColor: Colors.muted,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    alignItems: 'center',
  },
  recordBtnText: {
    ...Typography.bodyMedium,
    color: Colors.mutedForeground,
  },
  submitBtn: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    ...Elevation.glow,
  },
  disabled: {
    opacity: 0.5,
  },
  submitText: {
    ...Typography.buttonLarge,
    color: '#FFFFFF',
  },
});

export default ProfileSetupScreen;
