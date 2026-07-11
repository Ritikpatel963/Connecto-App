import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { useUser } from '../../../context/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

const SUPABASE_URL = 'https://whypwqhdfxtjjenkhkwt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ';

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
  
  // Verification state (only used for setup)
  const [idUploaded, setIdUploaded] = useState(false);
  const [idImageUri, setIdImageUri] = useState<string | null>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(isEdit && currentUser ? currentUser.avatar : null);
  const [idImageBase64, setIdImageBase64] = useState<string | null>(null);
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [recordingTime, setRecordingTime] = useState<number | null>(null);

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

  const pickDocument = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: true,
    });
    if (result.assets && result.assets[0]?.uri) {
      setIdImageUri(result.assets[0].uri);
      if (result.assets[0].base64) {
        setIdImageBase64(`data:${result.assets[0].type || 'image/jpeg'};base64,${result.assets[0].base64}`);
      }
      setIdUploaded(true);
      Alert.alert('Document Selected', 'Your ID document has been attached.');
    }
  };

  // voiceFilePath: local path to the recorded .wav file
  const [voiceFilePath, setVoiceFilePath] = useState<string | null>(null);
  // recordingPhase: 'idle' | 'countdown' | 'recording'
  const [recordingPhase, setRecordingPhase] = useState<'idle' | 'countdown' | 'recording'>('idle');

  const startRecording = async () => {
    if (voiceRecorded || recordingPhase !== 'idle') return;

    // 1. Request mic permission
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Microphone permission is needed to verify your voice.');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    // 2. Countdown: 3s before recording starts
    setRecordingPhase('countdown');
    let countdown = 3;
    setRecordingTime(countdown);
    await new Promise<void>(resolve => {
      const cd = setInterval(() => {
        countdown -= 1;
        setRecordingTime(countdown);
        if (countdown <= 0) {
          clearInterval(cd);
          resolve();
        }
      }, 1000);
    });

    // 3. Actually start recording
    try {
      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 1,
        wavFile: 'voice_verification.wav',
      });
      AudioRecord.start();
      setRecordingPhase('recording');

      // Record for 10 seconds
      let elapsed = 0;
      const MAX = 10;
      setRecordingTime(MAX);
      await new Promise<void>(resolve => {
        const recInterval = setInterval(() => {
          elapsed += 1;
          setRecordingTime(MAX - elapsed);
          if (elapsed >= MAX) {
            clearInterval(recInterval);
            resolve();
          }
        }, 1000);
      });

      // 4. Stop and get the file path
      const filePath = await AudioRecord.stop();
      await new Promise<void>(resolve => setTimeout(() => resolve(), 600)); // let OS flush the file

      // Verify the file actually has data
      let resolvedPath = filePath;
      if (!resolvedPath || !(await RNFS.exists(resolvedPath))) {
        // Fallback: library writes to app's files dir
        resolvedPath = RNFS.DocumentDirectoryPath + '/voice_verification.wav';
      }

      const stat = await RNFS.stat(resolvedPath);
      if (!stat || stat.size < 1000) {
        throw new Error(`Recording file is empty or too small (${stat?.size ?? 0} bytes). Please speak louder and try again.`);
      }

      setVoiceFilePath(resolvedPath);
      setVoiceRecorded(true);
      setRecordingPhase('idle');
      setRecordingTime(null);
      Alert.alert('Voice Recorded ✓', 'Your voice sample is ready. Complete the form to submit for review.');
    } catch (e: any) {
      console.warn('Recording error', e);
      setRecordingPhase('idle');
      setRecordingTime(null);
      Alert.alert('Recording Failed', e.message || 'Could not record audio. Please try again.');
    }
  };

  const handleComplete = async () => {
    // Basic validation
    if (!name || !age || !city) return;
    if (!isEdit && (!phoneNumber || !idUploaded || (role === 'girl' && !voiceRecorded))) {
      return;
    }
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
          Alert.alert('Invalid Code', 'The referral code you entered is invalid. Please check and try again, or leave it blank.');
          return;
        }
        referrerId = refData[0].id;
      }

      const generatedReferralCode = isEdit ? undefined : `${name.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        name,
        phone_number: phoneNumber,
        age: parseInt(age),
        gender: role === 'girl' ? 'female' : 'male',
        city,
        state,
        country,
        bio,
        profile_image_url: profileImageBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=256`,
        is_online: true,
        call_rate: role === 'girl' ? 8 : 0,
        average_rating: 0,
        is_active: false, // For admin approval
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
          Alert.alert('Error', 'Failed to update profile');
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
          Alert.alert('Error', `Failed to save profile: ${resBody}`);
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

        // Insert ID verification
        insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/id_verifications`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: newUserId,
            status: 'pending',
            id_image_url: idImageBase64 || 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=200&h=150&fit=crop'
          })
        }));

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

        // Insert voice verification if girl — upload file to Storage first
        if (role === 'girl' && voiceRecorded && voiceFilePath) {
          try {
            // Read WAV as base64 then decode to raw bytes — Supabase Storage needs binary, not base64 string
            const fileBase64 = await RNFS.readFile(voiceFilePath, 'base64');
            const binaryStr = atob(fileBase64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }

            const timestamp = Date.now();
            const storagePath = `${newUserId}/${timestamp}.wav`;
            const bucketName = 'voice-verifications';

            // Upload raw WAV bytes to Supabase Storage
            const uploadRes = await fetch(
              `${SUPABASE_URL}/storage/v1/object/${bucketName}/${storagePath}`,
              {
                method: 'POST',
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'audio/wav',
                  'x-upsert': 'true',
                },
                body: bytes,
              }
            );

            if (!uploadRes.ok) {
              const errText = await uploadRes.text();
              throw new Error(`Storage upload failed (${uploadRes.status}): ${errText}`);
            }

            // Public URL for the uploaded file
            const voiceAudioUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${storagePath}`;

            // Insert record into voice_verifications table
            insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/voice_verifications`, {
              method: 'POST',
              headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: newUserId,
                status: 'pending',
                voice_audio_url: voiceAudioUrl,
              })
            }));

            // Clean up local temp file
            RNFS.unlink(voiceFilePath).catch(() => { });
          } catch (voiceErr: any) {
            console.warn('Voice upload error', voiceErr);
            Alert.alert('Voice Upload Failed', `Could not upload voice: ${voiceErr.message}\n\nPlease try again.`);
            return; // Don't navigate away — let them retry
          }
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
      Alert.alert('Error', 'Something went wrong. Please try again.');
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

        {!isEdit && (
          <View style={styles.voiceCard}>
            <View style={styles.voiceRow}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.voiceIcon}>
                <Text style={{ fontSize: 18 }}>📄</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceTitle}>ID Verification</Text>
                <Text style={styles.voiceSubtitle}>Upload your government verified document like Aadhaar, PAN etc.</Text>
              </View>
            </View>
            {idImageUri && (
              <Image source={{ uri: idImageUri }} style={{ width: '100%', height: 120, borderRadius: 8, marginTop: 8 }} resizeMode="cover" />
            )}
            <TouchableOpacity
              style={[styles.recordBtn, idUploaded && { backgroundColor: Colors.primary }]}
              activeOpacity={0.7}
              onPress={pickDocument}>
              <Text style={[styles.recordBtnText, idUploaded && { color: '#FFF' }]}>
                {idUploaded ? 'Document Uploaded ✓' : 'Upload Document'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isEdit && role === 'girl' && (
          <View style={styles.voiceCard}>
            <View style={styles.voiceRow}>
              <LinearGradient
                colors={[...Gradients.girl]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.voiceIcon}>
                <Text style={{ fontSize: 18 }}>🎤</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceTitle}>Voice Verification</Text>
                <Text style={styles.voiceSubtitle}>Please read the following text aloud to get verified:</Text>
                <Text style={{ ...Typography.small, color: Colors.primary, marginTop: 4, fontStyle: 'italic' }}>
                  "Hello, I am setting up my profile to join Connecto."
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.recordBtn, (voiceRecorded || recordingPhase !== 'idle') && { backgroundColor: Colors.primary }]}
              activeOpacity={0.7}
              disabled={recordingPhase !== 'idle' && !voiceRecorded}
              onPress={startRecording}>
              <Text style={[styles.recordBtnText, (voiceRecorded || recordingPhase !== 'idle') && { color: '#FFF' }]}>
                {voiceRecorded
                  ? 'Voice Recorded ✓'
                  : recordingPhase === 'countdown'
                    ? `Starting in ${recordingTime}s...`
                    : recordingPhase === 'recording'
                      ? `🔴 Recording... ${recordingTime}s left`
                      : 'Start Voice Recording'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleComplete}
        disabled={!name || !age || !city || (!isEdit && (!phoneNumber || !idUploaded || (role === 'girl' && !voiceRecorded)))}
        activeOpacity={0.8}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.submitBtn,
            (!name || !age || !city || (!isEdit && (!phoneNumber || !idUploaded || (role === 'girl' && !voiceRecorded)))) && styles.disabled
          ]}>
          <Text style={styles.submitText}>{isEdit ? 'Save Changes' : 'Complete Setup →'}</Text>
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
