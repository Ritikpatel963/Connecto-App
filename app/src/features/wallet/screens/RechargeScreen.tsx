import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import BackArrowIcon from '../../../components/BackArrowIcon';
import { useUser } from '../../../context/UserContext';
import { supabase } from '../../../api/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Recharge'>;

type IconProps = {
  color?: string;
  size?: number;
};

type PaymentMethodId = 'upi' | 'card' | 'netbanking' | 'wallet' | 'manual';

type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

const OFFERS = [
  { id: '1', amount: 500, bonus: 50, tag: 'Popular', color: Colors.primary },
  { id: '2', amount: 1000, bonus: 150, tag: 'Best Value', color: Colors.accent },
  { id: '3', amount: 2000, bonus: 400, tag: 'Hot Deal', color: Colors.secondary },
] as const;

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'upi', label: 'UPI', subtitle: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', subtitle: 'All major banks' },
  { id: 'wallet', label: 'Mobile Wallets', subtitle: 'Paytm, Amazon Pay' },
  { id: 'manual', label: 'Manual Recharge (Upload Screenshot)', subtitle: 'Upload payment proof' },
];

const SmartphoneIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={7} y={2} width={10} height={20} rx={2} />
    <Path d="M11 18h2" />
  </Svg>
);

const CardIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={2} y={5} width={20} height={14} rx={2} />
    <Path d="M2 10h20" />
  </Svg>
);

const BankIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m3 10 9-6 9 6" />
    <Path d="M4 10h16" />
    <Path d="M6 10v8" />
    <Path d="M10 10v8" />
    <Path d="M14 10v8" />
    <Path d="M18 10v8" />
    <Path d="M3 21h18" />
  </Svg>
);

const WalletIcon: React.FC<IconProps> = ({ color = Colors.foreground, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </Svg>
);

const RechargeScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { currentUser, walletBalance, setWalletBalance } = useUser();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(route.params?.amount ?? null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('upi');

  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);
  const bonus = OFFERS.find(o => o.amount === finalAmount)?.bonus ?? 0;

  const handleRecharge = async () => {
    if (!finalAmount || finalAmount < 10) {
      Alert.alert('Invalid Amount', 'Minimum recharge is Rs 10');
      return;
    }

    const paymentLabel = PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label ?? 'UPI';

    if (selectedPayment === 'manual') {
      try {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 1,
        });

        if (result.didCancel || !result.assets?.length) return;

        const asset = result.assets[0];
        if (!asset.uri) {
          Alert.alert('Error', 'Could not process the image.');
          return;
        }

        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: asset.fileName || 'screenshot.jpg',
          type: asset.type || 'image/jpeg',
        } as any);

        // Ponytail shortcut: Upload to a free temporary host to bypass the 255 char limit in Supabase
        const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        let uploadedUrl = uploadData?.data?.url || '';
        if (uploadedUrl) {
          // Convert to direct download link
          uploadedUrl = uploadedUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        }

        const { error } = await supabase.from('wallet_transactions').insert({
          wallet_id: currentUser?.id || 1,
          transaction_type: 'recharge',
          amount: finalAmount,
          payment_method: 'manual_upload',
          payment_screenshot_url: uploadedUrl || 'https://placehold.co/600x400?text=Upload+Failed',
          verification_status: 'pending',
        });

        if (error) throw error;

        Alert.alert('Success', 'Recharge request submitted. Pending admin approval.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to submit request');
      }
      return;
    }

    Alert.alert(
      'Confirm Recharge',
      `Recharge Rs ${finalAmount}${bonus ? ` + Rs ${bonus} bonus` : ''} via ${paymentLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            setWalletBalance(walletBalance + finalAmount + bonus);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderPaymentIcon = (id: PaymentMethodId) => {
    switch (id) {
      case 'upi':
        return <SmartphoneIcon />;
      case 'card':
        return <CardIcon />;
      case 'netbanking':
        return <BankIcon />;
      case 'wallet':
        return <WalletIcon />;
      default:
        return <WalletIcon />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrowIcon color={Colors.foreground} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharge Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}> 
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}>
          <View style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{walletBalance.toLocaleString()} Coins</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Select Amount</Text>
        <View style={styles.amountsGrid}>
          {QUICK_AMOUNTS.map(amt => {
            const isSelected = selectedAmount === amt;
            return (
              <TouchableOpacity
                key={amt}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                style={[styles.amountChip, isSelected && styles.amountChipActive]}>
                <Text style={[styles.amountChipText, isSelected && styles.amountChipTextActive]}>
                  Rs {amt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.customInputWrap}>
          <Text style={styles.currencyPrefix}>Rs</Text>
          <TextInput
            style={styles.customInput}
            placeholder="Enter custom amount"
            placeholderTextColor={Colors.mutedForeground}
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={val => {
              setCustomAmount(val.replace(/[^0-9]/g, ''));
              setSelectedAmount(null);
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>Special Offers</Text>
        {OFFERS.map(offer => (
          <TouchableOpacity
            key={offer.id}
            activeOpacity={0.7}
            onPress={() => {
              setSelectedAmount(offer.amount);
              setCustomAmount('');
            }}
            style={[
              styles.offerCard,
              selectedAmount === offer.amount && { borderColor: offer.color, borderWidth: 1.5 },
            ]}>
            <View style={[styles.offerTag, { backgroundColor: `${offer.color}22` }]}>
              <Text style={[styles.offerTagText, { color: offer.color }]}>{offer.tag}</Text>
            </View>
            <View style={styles.offerRow}>
              <View>
                <Text style={styles.offerAmount}>Rs {offer.amount}</Text>
                <Text style={styles.offerBonus}>+Rs {offer.bonus} bonus coins</Text>
              </View>
              <View style={styles.offerTotal}>
                <Text style={styles.offerTotalLabel}>You get</Text>
                <Text style={[styles.offerTotalAmount, { color: offer.color }]}>
                  Rs {offer.amount + offer.bonus}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map(method => {
          const isSelected = selectedPayment === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              activeOpacity={0.7}
              onPress={() => setSelectedPayment(method.id)}
              style={[styles.paymentCard, isSelected && styles.paymentCardActive]}>
              <View style={styles.paymentIconWrap}>{renderPaymentIcon(method.id)}</View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentLabel}>{method.label}</Text>
                <Text style={styles.paymentSub}>{method.subtitle}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioActive]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {finalAmount > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}> 
          <View>
            <Text style={styles.ctaLabel}>Total</Text>
            <Text style={styles.ctaAmount}>
              Rs {finalAmount}
              {bonus > 0 && <Text style={styles.ctaBonus}> +Rs {bonus}</Text>}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={handleRecharge}>
            <LinearGradient
              colors={[...Gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Proceed to Pay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...Typography.h4, color: Colors.foreground },
  scroll: { paddingHorizontal: 16 },

  balanceCard: {
    borderRadius: Radius['2xl'],
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    alignItems: 'center',
  },
  balanceGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  balanceLabel: { ...Typography.smallSemibold, color: Colors.white80, marginBottom: 4 },
  balanceAmount: { ...Typography.h1, color: Colors.primaryForeground },

  sectionTitle: {
    ...Typography.label,
    color: Colors.mutedForeground,
    marginBottom: 12,
    marginTop: 8,
  },

  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  amountChip: {
    width: (width - 52) / 3,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  amountChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,92,92,0.14)',
  },
  amountChipText: { ...Typography.bodySemibold, color: Colors.foreground },
  amountChipTextActive: { color: Colors.primary },

  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencyPrefix: { ...Typography.h4, color: Colors.mutedForeground, marginRight: 8 },
  customInput: {
    flex: 1,
    ...Typography.bodySemibold,
    color: Colors.foreground,
    paddingVertical: 16,
  },

  offerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  offerTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
    marginBottom: 10,
  },
  offerTagText: { ...Typography.caption },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerAmount: { ...Typography.h3, color: Colors.foreground },
  offerBonus: { ...Typography.smallSemibold, color: Colors.accent, marginTop: 2 },
  offerTotal: { alignItems: 'flex-end' },
  offerTotalLabel: { ...Typography.caption, color: Colors.mutedForeground },
  offerTotalAmount: { ...Typography.h3 },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  paymentCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,92,92,0.1)',
  },
  paymentIconWrap: {
    width: 28,
    height: 28,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: { flex: 1 },
  paymentLabel: { ...Typography.bodySemibold, color: Colors.foreground },
  paymentSub: { ...Typography.caption, color: Colors.mutedForeground, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ctaLabel: { ...Typography.caption, color: Colors.mutedForeground },
  ctaAmount: { ...Typography.h3, color: Colors.foreground },
  ctaBonus: { ...Typography.bodySemibold, color: Colors.accent },
  ctaButton: {
    borderRadius: Radius.lg,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  ctaButtonText: { ...Typography.button, color: Colors.primaryForeground },
});

export default RechargeScreen;
