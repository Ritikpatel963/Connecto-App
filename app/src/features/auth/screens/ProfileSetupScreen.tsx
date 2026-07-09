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

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { role, phoneNumber, setCurrentUser, setIsAuthenticated } = useUser();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [languages, setLanguages] = useState('');
  const [interests, setInterests] = useState('');
  const [idUploaded, setIdUploaded] = useState(false);
  const [idImageUri, setIdImageUri] = useState<string | null>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
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
        audioSource: 6,
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
      await new Promise(r => setTimeout(r, 600)); // let OS flush the file

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
    if (!name || !age || !phoneNumber || !idUploaded || (role === 'girl' && !voiceRecorded)) {
      return;
    }
    try {
      const payload = {
        name,
        phone_number: phoneNumber,
        age: parseInt(age),
        gender: role === 'girl' ? 'female' : 'male',
        city,
        state,
        country,
        profile_image_url: profileImageBase64 || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        is_online: true,
        call_rate: role === 'girl' ? 8 : 0,
        average_rating: 0,
        is_active: false, // For admin approval
      };

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
      console.log('Supabase response:', res.status, resBody);
      if (!res.ok) {
        Alert.alert('Error', `Failed to save profile: ${resBody}`);
        return;
      }

      let newUserId = null;
      try {
        const parsed = JSON.parse(resBody);
        newUserId = parsed[0]?.id;
      } catch (e) { }

      if (newUserId) {
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

      // Profile setup complete - go straight to app
      navigation.replace('MainTabs');
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
      <Text style={styles.title}>Set up your profile</Text>
      <Text style={styles.subtitle}>Let people know who you are</Text>

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
        disabled={!name || !age || !phoneNumber || !idUploaded || (role === 'girl' && !voiceRecorded)}
        activeOpacity={0.8}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.submitBtn,
            (!name || !age || !phoneNumber || !idUploaded || (role === 'girl' && !voiceRecorded)) && styles.disabled
          ]}>
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
