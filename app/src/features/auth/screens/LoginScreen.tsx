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
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { useUser } from '../../../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setPhoneNumber } = useUser();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('otp');
      }, 1200);
    }
  };

  const handleVerify = () => {
    if (otp.every(d => d !== '')) {
      setLoading(true);
      setTimeout(() => {
        setPhoneNumber(`+91${phone}`);
        setLoading(false);
        navigation.replace('RoleSelect');
      }, 1000);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 3) {
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
          <Text style={styles.iconEmoji}>📞</Text>
        </LinearGradient>

        <Text style={styles.title}>
          {step === 'phone' ? 'Enter your phone' : 'Verify OTP'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'phone'
            ? "We'll send you a verification code"
            : `Code sent to +91 ${phone}`}
        </Text>

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
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Send OTP →</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.otpRow}>
              {[0, 1, 2, 3].map(i => (
                <TextInput
                  key={i}
                  ref={ref => {
                    otpRefs.current[i] = ref;
                  }}
                  value={otp[i]}
                  onChangeText={v => handleOtpChange(v, i)}
                  maxLength={1}
                  keyboardType="number-pad"
                  style={[styles.otpBox, otp[i] ? styles.otpBoxFilled : null]}
                  autoFocus={i === 0}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={handleVerify}
              disabled={otp.some(d => d === '') || loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.submitBtn, (otp.some(d => d === '') || loading) && styles.disabled]}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Verify →</Text>
                )}
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
  iconEmoji: {
    fontSize: 24,
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
    gap: 12,
    marginBottom: 32,
  },
  otpBox: {
    width: 56,
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
