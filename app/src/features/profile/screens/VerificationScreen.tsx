import React, { useState } from 'react';
import { useAlertStore } from '../../../hooks/useAlertStore';
import {
  View,
  Text,
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
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

const VerificationScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { role, currentUser } = useUser();
  const [idUploaded, setIdUploaded] = useState(false);
  const [idImageUri, setIdImageUri] = useState<string | null>(null);
  const [idImageBase64, setIdImageBase64] = useState<string | null>(null);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [recordingTime, setRecordingTime] = useState<number | null>(null);
  const [voiceFilePath, setVoiceFilePath] = useState<string | null>(null);
  const [recordingPhase, setRecordingPhase] = useState<'idle' | 'countdown' | 'recording'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickDocument = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.1,
      maxWidth: 400,
      maxHeight: 400,
      includeBase64: true,
    });
    if (result.assets && result.assets[0]?.uri) {
      setIdImageUri(result.assets[0].uri);
      if (result.assets[0].base64) {
        setIdImageBase64(`data:${result.assets[0].type || 'image/jpeg'};base64,${result.assets[0].base64}`);
      }
      setIdUploaded(true);
      useAlertStore.getState().show('Document Selected', 'Your ID document has been attached.');
    }
  };

  const startRecording = async () => {
    if (voiceRecorded || recordingPhase !== 'idle') return;

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          useAlertStore.getState().show('Permission Required', 'Microphone permission is needed to verify your voice.');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

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

      const filePath = await AudioRecord.stop();
      await new Promise<void>(resolve => setTimeout(() => resolve(), 600));

      let resolvedPath = filePath;
      if (!resolvedPath || !(await RNFS.exists(resolvedPath))) {
        resolvedPath = RNFS.DocumentDirectoryPath + '/voice_verification.wav';
      }

      const stat = await RNFS.stat(resolvedPath);
      if (!stat || stat.size < 1000) {
        throw new Error(`Recording file is empty or too small. Please speak louder and try again.`);
      }

      setVoiceFilePath(resolvedPath);
      setVoiceRecorded(true);
      setRecordingPhase('idle');
      setRecordingTime(null);
      useAlertStore.getState().show('Voice Recorded ✓', 'Your voice sample is ready.');
    } catch (e: any) {
      console.warn('Recording error', e);
      setRecordingPhase('idle');
      setRecordingTime(null);
      useAlertStore.getState().show('Recording Failed', e.message || 'Could not record audio. Please try again.');
    }
  };

  const handleComplete = async () => {
    const isUploadDisabled = !idUploaded && !voiceRecorded;
    if (isUploadDisabled) {
      return;
    }
    setIsSubmitting(true);
    try {
      const insertPromises = [];

      // Insert ID verification only if uploaded
      if (idUploaded) {
        insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/id_verifications`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser?.id,
            status: 'pending',
            id_image_url: idImageBase64 || 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=200&h=150&fit=crop'
          })
        }));
      }

      // Insert voice verification
      if (voiceRecorded && voiceFilePath) {
        try {
          const fileBase64 = await RNFS.readFile(voiceFilePath, 'base64');
          const voiceAudioUrl = `data:audio/wav;base64,${fileBase64}`;

          insertPromises.push(fetch(`${SUPABASE_URL}/rest/v1/voice_verifications`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: currentUser?.id,
              status: 'pending',
              voice_audio_url: voiceAudioUrl,
            })
          }));

          RNFS.unlink(voiceFilePath).catch(() => { });
        } catch (voiceErr: any) {
          useAlertStore.getState().show('Voice Upload Failed', `Could not upload voice. Please try again.`);
          return; 
        }
      }

      const results = await Promise.all(insertPromises);
      for (const res of results) {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`DB Error: ${errText}`);
        }
      }
      
      useAlertStore.getState().show('Success', 'Verification request submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.log('Error submitting verification', err);
      useAlertStore.getState().show('Error', err?.message || 'Something went wrong. Please try again.');
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
      ]}>
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={{ fontSize: 24, color: Colors.foreground }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verification</Text>
      <Text style={styles.subtitle}>Submit details for manual review</Text>

      <View style={styles.form}>
        <View style={styles.voiceCard}>
          <View style={styles.voiceRow}>
            <LinearGradient colors={[...Gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.voiceIcon}>
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

        <View style={styles.voiceCard}>
          <View style={styles.voiceRow}>
            <LinearGradient colors={[...Gradients.girl]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.voiceIcon}>
              <Text style={{ fontSize: 18 }}>🎤</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.voiceTitle}>Voice Verification</Text>
              <Text style={styles.voiceSubtitle}>Please read the following text aloud to get verified:</Text>
              <Text style={{ ...Typography.small, color: Colors.primary, marginTop: 4, fontStyle: 'italic' }}>
                "Hello, I am verifying my profile for Snappo."
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.recordBtn, (voiceRecorded || recordingPhase !== 'idle') && { backgroundColor: Colors.primary }]}
            activeOpacity={0.7}
            disabled={recordingPhase !== 'idle' && !voiceRecorded}
            onPress={startRecording}>
            <Text style={[styles.recordBtnText, (voiceRecorded || recordingPhase !== 'idle') && { color: '#FFF' }]}>
              {voiceRecorded ? 'Voice Recorded ✓' : recordingPhase === 'countdown' ? `Starting in ${recordingTime}s...` : recordingPhase === 'recording' ? `🔴 Recording... ${recordingTime}s left` : 'Start Voice Recording'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleComplete} disabled={isSubmitting || (!idUploaded && !voiceRecorded)} activeOpacity={0.8}>
        <LinearGradient colors={[...Gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.submitBtn, (isSubmitting || (!idUploaded && !voiceRecorded)) && styles.disabled]}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Submit for Verification</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 16 },
  title: { ...Typography.h2, color: Colors.foreground, marginBottom: 8 },
  subtitle: { ...Typography.body, color: Colors.mutedForeground, marginBottom: 32 },
  form: { gap: 16 },
  voiceCard: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 16, borderWidth: 1, borderColor: Colors.border },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voiceIcon: { width: 40, height: 40, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  voiceTitle: { ...Typography.bodySemibold, color: Colors.foreground },
  voiceSubtitle: { ...Typography.small, color: Colors.mutedForeground },
  recordBtn: { marginTop: 12, backgroundColor: Colors.muted, borderRadius: Radius.lg, paddingVertical: 10, alignItems: 'center' },
  recordBtnText: { ...Typography.bodyMedium, color: Colors.mutedForeground },
  submitBtn: { marginTop: 32, paddingVertical: 16, borderRadius: Radius.xl, alignItems: 'center', ...Elevation.glow },
  disabled: { opacity: 0.5 },
  submitText: { ...Typography.buttonLarge, color: '#FFFFFF' },
});

export default VerificationScreen;
