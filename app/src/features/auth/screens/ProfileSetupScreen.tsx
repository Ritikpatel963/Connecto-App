import React, { useState } from 'react';
import { useAlertStore } from '../../../hooks/useAlertStore';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { ENV } from '../../../config/env';

const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_KEY = ENV.SUPABASE_KEY;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const atob = (input: string = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';
  if (str.length % 4 == 1) { throw new Error("'atob' failed: The string to be decoded is not correctly encoded."); }
  for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const ProfileSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.params?.isEdit;
  const initialReferral = route.params?.referralCode || '';
  const insets = useSafeAreaInsets();
  const { role, phoneNumber, currentUser, setCurrentUser, setIsAuthenticated } = useUser();
  const [name, setName] = useState(isEdit && currentUser ? currentUser.name : '');
  const [age, setAge] = useState(isEdit && currentUser ? String(currentUser.age) : '');
  const [bio, setBio] = useState(isEdit && currentUser ? currentUser.bio : '');
  const [city, setCity] = useState(isEdit && currentUser ? currentUser.city || '' : '');
  const [state, setState] = useState(isEdit && currentUser ? currentUser.state || '' : '');
  const [country, setCountry] = useState(isEdit && currentUser ? currentUser.country || '' : '');
  const [languages, setLanguages] = useState(isEdit && currentUser ? currentUser.languages?.join(', ') || '' : '');
  const [interests, setInterests] = useState(isEdit && currentUser ? currentUser.interests?.join(', ') || '' : '');
  const [referralCodeInput, setReferralCodeInput] = useState(initialReferral);
  const [referralError, setReferralError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(isEdit && currentUser ? currentUser.avatar : null);
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);

  const pickProfileImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: true,
    });
    if (result.assets && result.assets[0]?.uri) {
      setProfileImageUri(result.assets[0].uri);
      if (result.assets[0].base64) {
        setProfileImageBase64(`data:${result.assets[0].type || 'image/jpeg'};base64,${result.assets[0].base64}`);
      }
    }
  };

  const handleComplete = async () => {
    // Basic validation
    if (!name || !age || !city) return;
    if (!isEdit && !phoneNumber) {
      return;
    }

    setIsSubmitting(true);
    try {
      setReferralError('');
      let referrerId = null;

      if (!isEdit && referralCodeInput.trim()) {
        const refRes = await fetch(`${SUPABASE_URL}/rest/v1/users?referral_code=eq.${referralCodeInput.trim()}&select=id`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const refData = await refRes.json();
        if (!refData || refData.length === 0) {
          setReferralError('Invalid referral code');
          useAlertStore.getState().show('Invalid Code', 'The referral code you entered is invalid. Please check and try again, or leave it blank.');
          setIsSubmitting(false);
          return;
        }
        referrerId = refData[0].id;
      }

      const generatedReferralCode = isEdit ? undefined : `${name.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

      let finalBio = bio.trim();
      let autoVerify = false;
      if (!isEdit) {
        try {
          const sRes = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=in.(default_bios,auto_verify_profiles)&select=key,value`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
          });
          const sData = await sRes.json();
          if (sData && sData.length > 0) {
            const bioSetting = sData.find((s: any) => s.key === 'default_bios');
            const verifySetting = sData.find((s: any) => s.key === 'auto_verify_profiles');
            
            if (verifySetting && verifySetting.value === 'true') {
              autoVerify = true;
            }
            
            if (!finalBio && bioSetting && bioSetting.value) {
              const biosList = bioSetting.value.split('\\n').map((b: string) => b.trim()).filter(Boolean);
              if (biosList.length > 0) {
                finalBio = biosList[Math.floor(Math.random() * biosList.length)];
              }
            }
          }
        } catch (e) {
          console.warn('Could not fetch settings', e);
        }
        if (!finalBio) finalBio = 'Hi, I am new here!'; // Fallback
      }

      const payload = {
        name,
        phone_number: phoneNumber,
        age: parseInt(age),
        gender: role === 'girl' ? 'female' : 'male',
        city,
        state,
        country,
        bio: finalBio,
        profile_image_url: profileImageBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=256`,
        is_online: true,
        call_rate: role === 'girl' ? 8 : 0,
        average_rating: 0,
        is_active: autoVerify, // Auto-verify feature
        is_id_verified: autoVerify,
        ...(isEdit ? {} : { referral_code: generatedReferralCode, referred_by_user_id: referrerId }),
      };

      let newUserId = isEdit ? currentUser?.id : null;

      if (isEdit) {
        // Just update existing profile
        const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${newUserId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, age: parseInt(age), city, state, country, bio })
        });
        if (!res.ok) {
          useAlertStore.getState().show('Error', 'Failed to update profile');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Create new profile
        const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });
        const resBody = await res.text();
        if (!res.ok) {
          useAlertStore.getState().show('Error', `Failed to save profile: ${resBody}`);
          setIsSubmitting(false);
          return;
        }
        try {
          const parsed = JSON.parse(resBody);
          newUserId = parsed[0]?.id;
        } catch (e) { }
      }

      if (newUserId && !isEdit) {
        const insertPromises = [];

        // Insert languages
        const langs = languages.split(',').map(s => s.trim()).filter(Boolean);
        for (const lang of langs) {
          insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/user_languages`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: newUserId, language: lang })
          }));
        }

        // Insert interests
        const ints = interests.split(',').map(s => s.trim()).filter(Boolean);
        for (const int of ints) {
          insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/user_interests`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: newUserId, interest: int })
          }));
        }

        // Insert initial wallet with 10 coins (Ponytail fix)
        insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/wallets`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newUserId,
            user_id: newUserId,
            balance: 10
          })
        }));

        if (referrerId) {
          insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/referrals`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referrer_user_id: referrerId,
              referred_user_id: newUserId,
              status: 'pending'
            })
          }));
        }

        await Promise.all(insertPromises);
      }

      if (newUserId) {
        if (isEdit && currentUser) {
          setCurrentUser({
            ...currentUser,
            name,
            age: parseInt(age),
            city,
            state,
            country,
            bio,
            avatar: profileImageBase64 || currentUser.avatar,
          });
          navigation.goBack();
        } else {
          setCurrentUser({
            id: newUserId,
            name,
            age: parseInt(age),
            avatar: profileImageBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=256`,
            role: role || 'boy',
            bio: bio || 'Hi, I am new here!',
            isOnline: true,
            isPremium: false,
            isVerified: false,
            rating: 0,
            totalCalls: 0,
            pricePerMinute: role === 'girl' ? 8 : 0,
            languages: [],
            interests: [],
            city,
            state,
            country,
          });
          // Profile setup complete - go straight to app
          navigation.replace('MainTabs');
        }
      }
    } catch (err) {
      console.log('Error creating profile', err);
      useAlertStore.getState().show('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
      ]}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEdit ? 'Edit Profile' : 'Set up your profile'}</Text>
      <Text style={styles.subtitle}>{isEdit ? 'Update your personal details' : 'Let people know who you are'}</Text>

      {/* Avatar */}
      <TouchableOpacity style={styles.avatarRow} onPress={pickProfileImage} activeOpacity={0.7}>
        <View style={styles.avatarBox}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.cameraIcon}>📷</Text>
          )}
        </View>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addBadge}>
          <Text style={styles.addText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

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
            placeholder="Tell us about yourself..."
            placeholderTextColor={Colors.mutedForeground}
            style={[styles.input, { height: 80 }]}
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>STATE</Text>
            <TextInput
              value={state}
              onChangeText={setState}
              placeholder="State"
              placeholderTextColor={Colors.mutedForeground}
              style={styles.input}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>COUNTRY</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              placeholderTextColor={Colors.mutedForeground}
              style={styles.input}
            />
          </View>
        </View>

        <View>
          <Text style={styles.label}>LANGUAGES (Comma separated)</Text>
          <TextInput
            value={languages}
            onChangeText={setLanguages}
            placeholder="English, Hindi"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.input}
          />
        </View>

        <View>
          <Text style={styles.label}>INTERESTS (Comma separated)</Text>
          <TextInput
            value={interests}
            onChangeText={setInterests}
            placeholder="Music, Travel"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.input}
          />
        </View>

        {!isEdit && (
          <View>
            <Text style={styles.label}>REFERRAL CODE (Optional)</Text>
            <TextInput
              value={referralCodeInput}
              onChangeText={(t) => { setReferralCodeInput(t); setReferralError(''); }}
              placeholder="e.g. ALEX1234"
              placeholderTextColor={Colors.mutedForeground}
              style={[styles.input, referralError ? { borderColor: 'red', borderWidth: 1 } : {}]}
              autoCapitalize="characters"
            />
            {referralError ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{referralError}</Text> : null}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleComplete}
        disabled={isSubmitting || (!isEdit && !phoneNumber)}
        activeOpacity={0.8}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.submitBtn,
            (isSubmitting || (!isEdit && !phoneNumber)) && styles.disabled
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>{isEdit ? 'Save Changes' : 'Complete Setup →'}</Text>
          )}
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
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: Radius['2xl'],
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
