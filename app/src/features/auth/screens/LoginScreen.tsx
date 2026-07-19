import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius, Elevation } from '../../../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { useUser } from '../../../context/UserContext';
import { ENV } from '../../../config/env';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const STATIC_OTP = '123456';

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated, setPhoneNumber, setCurrentUser, setRole } = useUser();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;

    setLoading(true);
    setError('');

    try {
      // Fetch settings to decide OTP method
      const settingsRes = await fetch(`${ENV.SUPABASE_URL}/rest/v1/settings?key=eq.otp_method&select=value`, {
        headers: { apikey: ENV.SUPABASE_KEY, Authorization: `Bearer ${ENV.SUPABASE_KEY}` }
      });
      const settingsData = await settingsRes.json().catch(() => []);
      const otpMethod = settingsData[0]?.value || 'firebase';

      if (otpMethod === 'firebase') {
        const confirmation = await auth().signInWithPhoneNumber('+91' + phone);
        setConfirm(confirmation);
        setStep('otp');
      } else {
        const res = await fetch(`${ENV.API_URL}/api/app/v1/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const errMsg = data?.error?.message || data?.message || (typeof data?.error === 'string' ? data.error : 'Failed to send OTP');
          throw new Error(errMsg);
        }
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.some(digit => !digit)) return;

    setLoading(true);
    setError('');
    const enteredOtp = otp.join('');

    try {
      if (confirm) {
        // Firebase Verification
        await confirm.confirm(enteredOtp);
      } else {
        // Fast2SMS Verification via Backend
        const verifyRes = await fetch(`${ENV.API_URL}/api/app/v1/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp: enteredOtp })
        });
        const verifyData = await verifyRes.json().catch(() => null);
        if (!verifyRes.ok || !verifyData?.verified) {
          const errMsg = verifyData?.error?.message || verifyData?.message || (typeof verifyData?.error === 'string' ? verifyData.error : 'Invalid OTP');
          throw new Error(errMsg);
        }
      }

      const fullPhone = `+91${phone}`;
      setPhoneNumber(fullPhone);

      const res = await fetch(`${ENV.SUPABASE_URL}/rest/v1/users?phone_number=eq.${encodeURIComponent(fullPhone)}&select=*`, {
        headers: {
          'apikey': ENV.SUPABASE_KEY,
          'Authorization': `Bearer ${ENV.SUPABASE_KEY}`
        }
      });
      const users = await res.json();

      if (users && users.length > 0) {
        const u = users[0];

        // Block deactivated users (admin unchecked them)
        if (!u.is_active) {
          setLoading(false);
          setError('Your account has been deactivated. Please contact support.');
          return;
        }

        setCurrentUser({
          id: u.id,
          name: u.name || 'Unknown',
          age: u.age || 20,
          avatar: u.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random&color=fff&size=256`,
          role: u.gender === 'female' ? 'girl' : 'boy',
          bio: u.bio || 'Hi, I am new here!',
          isOnline: u.is_online,
          isPremium: false,
          isVerified: u.is_id_verified && u.is_active,
          rating: parseFloat(u.average_rating) || 0,
          totalCalls: u.total_ratings || 0,
          pricePerMinute: parseFloat(u.call_rate) || 0,
          languages: u.languages || ['English', 'Hindi'],
          interests: u.interests || ['Music', 'Movies', 'Travel'],
          city: u.city || 'Unknown',
          state: u.state || '',
          country: u.country || '',
          lastSeen: u.last_seen_at || undefined
        });
        setRole(u.gender === 'female' ? 'girl' : 'boy');
        setIsAuthenticated(true);
        navigation.replace('MainTabs');
      } else {
        setIsAuthenticated(true);
        navigation.replace('RoleSelect');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Invalid OTP or network error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.glow} />

      <View style={styles.content}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBox}>
          <Text style={styles.iconText}>OTP</Text>
        </LinearGradient>

        <Text style={styles.title}>{step === 'phone' ? 'Enter your phone' : 'Verify OTP'}</Text>
        <Text style={styles.subtitle}>
          {step === 'phone' ? "We'll send you a verification code" : `Code sent to +91 ${phone}`}
        </Text>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {step === 'phone' ? (
          <View>
            <View style={styles.phoneRow}>
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.divider} />
              <TextInput
                value={phone}
                onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="Phone number"
                placeholderTextColor={Colors.mutedForeground}
                keyboardType="number-pad"
                style={styles.phoneInput}
                autoFocus
              />
            </View>
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={phone.length < 10 || loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.submitBtn, (phone.length < 10 || loading) && styles.disabled]}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Send OTP</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => {
                    otpRefs.current[i] = ref;
                  }}
                  value={digit}
                  onChangeText={v => handleOtpChange(v, i)}
                  maxLength={1}
                  keyboardType="number-pad"
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  autoFocus={i === 0}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={handleVerify}
              disabled={otp.some(digit => !digit) || loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.submitBtn, (otp.some(digit => !digit) || loading) && styles.disabled]}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Verify</Text>}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('phone')} style={styles.changeBtn}>
              <Text style={styles.changeText}>Change number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,92,92,0.08)',
    transform: [{ translateX: 48 }, { translateY: -48 }],
  },
  content: {
    zIndex: 10,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...Elevation.glow,
  },
  iconText: {
    ...Typography.label,
    color: '#FFFFFF',
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
  errorText: {
    ...Typography.small,
    color: Colors.destructive,
    marginBottom: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  countryCode: {
    ...Typography.bodySemibold,
    color: Colors.foreground,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  phoneInput: {
    flex: 1,
    ...Typography.h4,
    color: Colors.foreground,
    letterSpacing: 2,
    padding: 0,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.glow,
  },
  disabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    ...Typography.buttonLarge,
    color: '#FFFFFF',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  otpBox: {
    width: 44,
    height: 56,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.foreground,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
  },
  changeBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  changeText: {
    ...Typography.body,
    color: Colors.mutedForeground,
  },
});

export default LoginScreen;
