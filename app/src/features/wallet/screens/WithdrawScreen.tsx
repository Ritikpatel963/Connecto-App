import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import BackArrowIcon from '../../../components/BackArrowIcon';
import { useUser } from '../../../context/UserContext';
import { supabase } from '../../../api/supabase';
import { useSettings } from '../../../api/wallet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { ENV } from '../../../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Withdraw'>;

const WithdrawScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentUser, walletBalance, setWalletBalance } = useUser();
  const queryClient = useQueryClient();
  const { data: settings = {} } = useSettings();
  
  const [amountStr, setAmountStr] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpi, setLastUpi] = useState('');
  const [lastBank, setLastBank] = useState('');

  const uid = currentUser?.id;

  useEffect(() => {
    if (!uid) return;
    Promise.all([
      AsyncStorage.getItem(`${uid}_savedPayoutMethod`),
      AsyncStorage.getItem(`${uid}_savedUpiDetails`),
      AsyncStorage.getItem(`${uid}_savedBankDetails`),
      AsyncStorage.getItem(`${uid}_savedIfscCode`)
    ]).then(([m, u, b, i]) => {
      const activeMethod = m || 'UPI';
      setPayoutMethod(activeMethod);
      if (u) setLastUpi(u);
      if (b) setLastBank(b);
      if (i) setIfscCode(i);

      if (activeMethod === 'UPI' && u) setPayoutDetails(u);
      if (activeMethod === 'Bank Transfer' && b) setPayoutDetails(b);
    });
  }, [uid]);

  const withdrawConfig = settings.withdrawal_config || { min: 100, max: 10000 };
  const min = Number(withdrawConfig.min);
  const max = Number(withdrawConfig.max);
  const payoutRate = Number(settings.payout_coin_rate) || 0; // 1 ₹ = payoutRate coins
  const enteredCoins = Number(amountStr) || 0;
  const estimatedRs = payoutRate > 0 && enteredCoins > 0 ? (enteredCoins / payoutRate).toFixed(2) : null;

  const handleWithdraw = async () => {
    const amount = Number(amountStr);
    
    if (!amount || amount < min || amount > max) {
      Alert.alert('Invalid Amount', `Amount must be between ${min} and ${max}`);
      return;
    }
    if (amount > walletBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough coins');
      return;
    }
    if (!payoutDetails.trim()) {
      Alert.alert('Missing Details', 'Please enter your payout details (UPI/Bank)');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = currentUser?.id;
      if (!token) throw new Error("Session expired. Please log in again.");
      
      const res = await fetch(`${ENV.API_URL}/api/app/v1/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          payoutMethod: payoutMethod,
          payoutDetails: payoutMethod === 'Bank Transfer' ? `A/C: ${payoutDetails}, IFSC: ${ifscCode}` : payoutDetails
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const msg = errorData?.error?.message || errorData?.message || errorData?.error || "Failed to submit withdrawal request";
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      const responseJson = await res.json();
      const newBalance = responseJson.data?.newBalance ?? responseJson.newBalance;
      
      setWalletBalance(newBalance);
      
      await AsyncStorage.setItem(`${uid}_savedPayoutMethod`, payoutMethod);
      if (payoutMethod === 'UPI') {
        await AsyncStorage.setItem(`${uid}_savedUpiDetails`, payoutDetails);
        setLastUpi(payoutDetails);
      } else {
        await AsyncStorage.setItem(`${uid}_savedBankDetails`, payoutDetails);
        await AsyncStorage.setItem(`${uid}_savedIfscCode`, ifscCode);
        setLastBank(payoutDetails);
      }
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      
      Alert.alert('Success', 'Withdrawal request submitted for approval.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      let msg = err.message || 'Failed to submit withdrawal';
      if (msg === 'Network request failed') {
        msg = `Cannot reach server at ${ENV.API_URL}. If on Android Emulator, use 10.0.2.2 instead of localhost/IP.`;
      }
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrowIcon color={Colors.foreground} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Coins</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Available Balance</Text>
          <Text style={styles.balance}>{walletBalance.toLocaleString()} Coins</Text>
          <Text style={styles.ruleText}>Min: {min} | Max: {max}</Text>
        </View>

        <Text style={styles.inputLabel}>Withdraw Amount (Coins)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={`Min ${min}`}
          placeholderTextColor={Colors.mutedForeground}
          value={amountStr}
          onChangeText={setAmountStr}
        />
        {payoutRate > 0 && (
          <Text style={{ ...Typography.small, color: Colors.primary, marginTop: 6, textAlign: 'right' }}>
            {estimatedRs ? `≈ ₹${estimatedRs}` : `Rate: 1 ₹ = ${payoutRate} coins`}
          </Text>
        )}

        <Text style={styles.inputLabel}>Select Payout Method</Text>
        <View style={styles.methodRow}>
          {['UPI', 'Bank Transfer'].map(method => (
            <TouchableOpacity 
              key={method}
              style={[styles.methodBtn, payoutMethod === method && styles.methodBtnActive]}
              onPress={() => {
                setPayoutMethod(method);
                if (method === 'UPI') setPayoutDetails(lastUpi);
                if (method === 'Bank Transfer') setPayoutDetails(lastBank);
              }}
            >
              <Text style={[styles.methodBtnText, payoutMethod === method && styles.methodBtnTextActive]}>
                {method}
              </Text>
              {method === 'UPI' && lastUpi ? (
                <Text style={styles.methodBtnSubtext} numberOfLines={1}>{lastUpi}</Text>
              ) : null}
              {method === 'Bank Transfer' && lastBank ? (
                <Text style={styles.methodBtnSubtext} numberOfLines={1}>{lastBank}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {payoutMethod === 'UPI' ? (
          <>
            <Text style={styles.inputLabel}>UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your UPI ID (e.g., phone@upi)"
              placeholderTextColor={Colors.mutedForeground}
              value={payoutDetails}
              onChangeText={setPayoutDetails}
            />
          </>
        ) : (
          <>
            <Text style={styles.inputLabel}>Bank Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Bank Account Number"
              placeholderTextColor={Colors.mutedForeground}
              value={payoutDetails}
              onChangeText={setPayoutDetails}
            />
            
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>IFSC Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Bank IFSC Code"
              placeholderTextColor={Colors.mutedForeground}
              value={ifscCode}
              onChangeText={setIfscCode}
              autoCapitalize="characters"
            />
          </>
        )}

        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleWithdraw}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.h4, color: Colors.foreground },
  content: { padding: 20 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 20, marginBottom: 24, alignItems: 'center' },
  label: { ...Typography.body, color: Colors.mutedForeground },
  balance: { ...Typography.h2, color: Colors.foreground, marginVertical: 8 },
  ruleText: { ...Typography.small, color: Colors.primary },
  inputLabel: { ...Typography.label, color: Colors.foreground, marginBottom: 8, marginTop: 12 },
  methodRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  methodBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  methodBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(233,64,87,0.1)' },
  methodBtnText: { ...Typography.small, color: Colors.mutedForeground },
  methodBtnTextActive: { color: Colors.primary, fontWeight: 'bold' },
  methodBtnSubtext: { ...Typography.tiny, color: Colors.mutedForeground, marginTop: 4, textAlign: 'center', opacity: 0.7 },
  input: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, color: Colors.foreground, ...Typography.body },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: 16, alignItems: 'center', marginTop: 32 },
  submitBtnText: { ...Typography.bodyBold, color: '#FFFFFF' },
});

export default WithdrawScreen;
