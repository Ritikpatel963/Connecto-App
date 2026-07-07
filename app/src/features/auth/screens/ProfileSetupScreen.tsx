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

  const [voiceBase64, setVoiceBase64] = useState<string | null>(null);
  const audioChunksRef = React.useRef<string[]>([]);

  const startRecording = async () => {
    if (voiceRecorded || recordingTime !== null) return;

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Microphone permission is needed.');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    try {
      audioChunksRef.current = [];

      const options = {
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'verification.wav',
      };

      AudioRecord.init(options);

      AudioRecord.on('data', (data: string) => {
        audioChunksRef.current.push(data);
      });

      AudioRecord.start();
      setRecordingTime(5);

      let timeLeft = 5;
      const interval = setInterval(async () => {
        timeLeft -= 1;
        setRecordingTime(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(interval);
          setRecordingTime(null);

          try {
            const returnedPath = await AudioRecord.stop();
            // Give file system 500ms to flush
            await new Promise(r => setTimeout(r, 500));

            let base64Str = '';

            // Strategy 1: Try reading from the path returned by stop()
            if (returnedPath && typeof returnedPath === 'string') {
              try {
                const exists = await RNFS.exists(returnedPath);
                if (exists) {
                  base64Str = await RNFS.readFile(returnedPath, 'base64');
                }
              } catch (_) {}
            }

            // Strategy 2: Try cache directory
            if (!base64Str) {
              try {
                const cachePath = RNFS.CachesDirectoryPath + '/verification.wav';
                const exists = await RNFS.exists(cachePath);
                if (exists) {
                  base64Str = await RNFS.readFile(cachePath, 'base64');
                }
              } catch (_) {}
            }

            // Strategy 3: Try document directory
            if (!base64Str) {
              try {
                const docPath = RNFS.DocumentDirectoryPath + '/verification.wav';
                const exists = await RNFS.exists(docPath);
                if (exists) {
                  base64Str = await RNFS.readFile(docPath, 'base64');
                }
              } catch (_) {}
            }

            // Strategy 4: Use streamed chunks
            if (!base64Str && audioChunksRef.current.length > 0) {
              base64Str = audioChunksRef.current.join('');
            }

            if (base64Str && base64Str.length > 50) {
              setVoiceBase64(`data:audio/wav;base64,${base64Str}`);
              setVoiceRecorded(true);
              Alert.alert('Voice Verified', 'Your voice sample was recorded successfully.');
            } else {
              Alert.alert(
                'Recording Failed',
                `No audio data captured.\nReturned path: ${returnedPath}\nChunks: ${audioChunksRef.current.length}\nBase64 length: ${base64Str.length}`,
              );
            }
          } catch (e: any) {
            console.warn('Recording error', e);
            Alert.alert('Error', `Recording failed: ${e.message || String(e)}`);
          }
        }
      }, 1000);
    } catch (e: any) {
      console.warn('Error starting recorder', e);
      setRecordingTime(null);
      Alert.alert('Error', `Could not start recorder: ${e.message || String(e)}`);
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
        } catch(e) {}

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

          // Insert voice verification if girl
          if (role === 'girl' && voiceRecorded && voiceBase64) {
            insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/voice_verifications`, {
              method: 'POST',
              headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user_id: newUserId, 
                status: 'pending',
                voice_audio_url: voiceBase64
              })
            }));
          }

          await Promise.all(insertPromises);
        }

        // Profile submitted for approval — don't authenticate yet
        navigation.replace('WaitApproval');
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
              style={[styles.recordBtn, (voiceRecorded || recordingTime !== null) && { backgroundColor: Colors.primary }]} 
              activeOpacity={0.7}
              onPress={startRecording}>
              <Text style={[styles.recordBtnText, voiceRecorded && { color: '#FFF' }]}>
                {voiceRecorded ? 'Voice Recorded ✓' : recordingTime !== null ? `Recording... ${recordingTime}s` : 'Start Live Recording'}
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
