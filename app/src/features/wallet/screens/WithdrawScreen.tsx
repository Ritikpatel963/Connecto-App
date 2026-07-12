import React, { useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Withdraw'>;

const WithdrawScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentUser, walletBalance, setWalletBalance } = useUser();
  const queryClient = useQueryClient();
  const { data: settings = {} } = useSettings();
  
  const [amountStr, setAmountStr] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withdrawConfig = settings.withdrawal_config || { min: 100, max: 10000 };
  const min = Number(withdrawConfig.min);
  const max = Number(withdrawConfig.max);

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
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const res = await fetch('http://192.168.1.6:4100/api/app/v1/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          payoutMethod: payoutMethod,
          payoutDetails: payoutDetails
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to submit withdrawal request");
      }

      const { newBalance } = await res.json();
      
      setWalletBalance(newBalance);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      
      Alert.alert('Success', 'Withdrawal request submitted for approval.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit withdrawal');
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

        <Text style={styles.inputLabel}>Select Payout Method</Text>
        <View style={styles.methodRow}>
          {['UPI', 'Debit Card', 'Bank Transfer'].map(method => (
            <TouchableOpacity 
              key={method}
              style={[styles.methodBtn, payoutMethod === method && styles.methodBtnActive]}
              onPress={() => setPayoutMethod(method)}
            >
              <Text style={[styles.methodBtnText, payoutMethod === method && styles.methodBtnTextActive]}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>{payoutMethod} Details</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          placeholder={`Enter your ${payoutMethod} details...`}
          placeholderTextColor={Colors.mutedForeground}
          value={payoutDetails}
          onChangeText={setPayoutDetails}
        />

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
  input: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, color: Colors.foreground, ...Typography.body },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: 16, alignItems: 'center', marginTop: 32 },
  submitBtnText: { ...Typography.bodyBold, color: '#FFFFFF' },
});

export default WithdrawScreen;
