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
  ActivityIndicator,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RazorpayCheckout from 'react-native-razorpay';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Gradients } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Radius } from '../../../theme/spacing';
import BackArrowIcon from '../../../components/BackArrowIcon';
import { useUser } from '../../../context/UserContext';
import { supabase } from '../../../api/supabase';
import { useCoinPackages, useSettings } from '../../../api/wallet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Recharge'>;

type IconProps = {
  color?: string;
  size?: number;
};

type PaymentMethodId = 'razorpay' | 'in_app' | 'manual';

type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];



const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'razorpay', label: 'Razorpay', subtitle: 'UPI, Cards, Netbanking' },
  { id: 'in_app', label: 'In App Purchase', subtitle: 'Google Play Billing' },
  { id: 'manual', label: 'Manual Recharge', subtitle: 'Upload payment screenshot' },
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

  const { data: coinPackages = [], isLoading: packagesLoading } = useCoinPackages();
  const { data: settings = {} } = useSettings();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(route.params?.amount ?? null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Auto-select the default package
  React.useEffect(() => {
    if (selectedAmount === null && !customAmount && coinPackages.length > 0) {
      if (settings?.default_package_id) {
        const defaultAdminPkg = coinPackages.find(p => String(p.id) === String(settings.default_package_id));
        if (defaultAdminPkg) {
          setSelectedAmount(defaultAdminPkg.price);
          return;
        }
      }

      // Prioritize packages with a bonus as default, fallback to the first available package
      const baseRule = coinPackages[0];
      const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
      const defaultPkg = coinPackages.find(p => p.coins > Math.floor(p.price / conversionRate)) || coinPackages[0];
      
      if (defaultPkg) {
        setSelectedAmount(defaultPkg.price);
      }
    }
  }, [coinPackages, selectedAmount, customAmount, settings?.default_package_id]);

  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);
  
  // Calculate conversion rate: price per coin. Fallback to 1 if no rule.
  const baseRule = coinPackages[0];
  const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
  
  const pkg = coinPackages.find(p => p.price === finalAmount);
  const baseCoins = Math.floor(finalAmount / conversionRate);
  const bonus = (pkg && pkg.coins > baseCoins) ? pkg.coins - baseCoins : 0;
  const finalCoins = baseCoins + bonus;

  const handleRecharge = async () => {
    if (isSubmitting) return;

    if (!finalAmount || finalAmount < 10) {
      Alert.alert('Invalid Amount', 'Minimum recharge is Rs 10');
      return;
    }

    setIsSubmitting(true);

    const paymentLabel = PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label ?? 'UPI';
    const pkg = coinPackages.find(p => p.price === finalAmount);
    
    const isSpecial = pkg && pkg.coins > Math.floor(pkg.price / conversionRate);
    const paymentMethodDbString = selectedPayment === 'manual' ? 'manual_upload' : 'razorpay';

    if (selectedPayment === 'manual') {
      try {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 1,
          includeBase64: true,
        });

        if (result.didCancel || !result.assets?.length) return;

        const asset = result.assets[0];
        if (!asset.uri || !asset.base64) {
          Alert.alert('Error', 'Could not process the image.');
          return;
        }

        const uploadedUrl = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;

        const { error } = await supabase.from('wallet_transactions').insert({
          wallet_id: currentUser?.id || 1,
          transaction_type: 'recharge',
          amount: finalAmount, 
          payment_method: paymentMethodDbString,
          payment_screenshot_url: uploadedUrl || 'https://placehold.co/600x400?text=Upload+Failed',
          verification_status: 'pending',
        });

        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['transactions'] });

        Alert.alert('Success', 'Recharge request submitted. Pending admin approval.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to submit request');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(false);

    if (selectedPayment === 'razorpay') {
      try {
        setIsSubmitting(true);
        const res = await fetch('https://connecto.yashsoni.me/api/app/v1/payments/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalAmount })
        });
        
        if (!res.ok) throw new Error("Failed to create order");
        const order = await res.json();
        
        const options = {
          description: 'Recharge Wallet',
          image: 'https://placehold.co/100x100?text=Logo',
          currency: 'INR',
          key: settings?.razorpay_key_id,
          amount: order.amount,
          name: 'Connecto App',
          order_id: order.id,
          theme: { color: Colors.primary }
        };
        
        const data = await RazorpayCheckout.open(options);
        
        const userId = currentUser?.id || 1;
        let { data: wallet } = await supabase.from('wallets').select('id').or(`id.eq.${userId},user_id.eq.${userId}`).maybeSingle();
        
        if (!wallet) {
           const { data: newWallet, error: createErr } = await supabase.from('wallets').insert({ id: userId, user_id: userId, balance: walletBalance }).select('id').single();
           if (createErr) throw createErr;
           wallet = newWallet;
        }
        const walletId = wallet?.id || userId;
        
        await supabase.from('wallet_transactions').insert({
          wallet_id: walletId,
          transaction_type: 'recharge',
          amount: finalAmount,
          payment_method: paymentMethodDbString,
          verification_status: 'verified',
        });
        
        await supabase.from('wallets').update({ balance: walletBalance + finalCoins }).eq('id', walletId);
        
        // Ponytail: Lazily mark referral as successful on first successful recharge
        fetch('https://whypwqhdfxtjjenkhkwt.supabase.co/rest/v1/referrals?referred_user_id=eq.' + userId + '&status=eq.pending', {
          method: 'PATCH',
          headers: {
            'apikey': 'sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ',
            'Authorization': 'Bearer sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'successful' })
        }).catch(() => {});

        setWalletBalance(walletBalance + finalCoins);
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
        setIsSubmitting(false);
        navigation.goBack();
      } catch (error: any) {
        setIsSubmitting(false);
        Alert.alert("Payment Error", error.description || error.message || "Payment failed");
      }
      return;
    }

    Alert.alert(
      'Confirm Recharge',
      `Buy ${finalCoins} Coins for Rs ${finalAmount} via ${paymentLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            setIsSubmitting(true);
            const userId = currentUser?.id || 1;
            let { data: wallet } = await supabase.from('wallets').select('id').or(`id.eq.${userId},user_id.eq.${userId}`).maybeSingle();
            
            if (!wallet) {
               const { data: newWallet, error: createErr } = await supabase.from('wallets').insert({ id: userId, user_id: userId, balance: walletBalance }).select('id').single();
               if (createErr) throw createErr;
               wallet = newWallet;
            }
            const walletId = wallet?.id || userId;
            
            await supabase.from('wallet_transactions').insert({
              wallet_id: walletId,
              transaction_type: 'recharge',
              amount: finalAmount,
              payment_method: paymentMethodDbString,
              verification_status: 'verified',
            });
            
            await supabase.from('wallets').update({ balance: walletBalance + finalCoins }).eq('id', walletId);
            
            // Ponytail: Lazily mark referral as successful on first successful recharge
            fetch('https://whypwqhdfxtjjenkhkwt.supabase.co/rest/v1/referrals?referred_user_id=eq.' + userId + '&status=eq.pending', {
              method: 'PATCH',
              headers: {
                'apikey': 'sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ',
                'Authorization': 'Bearer sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'successful' })
            }).catch(() => {});

            setWalletBalance(walletBalance + finalCoins);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
            setIsSubmitting(false);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderPaymentIcon = (id: PaymentMethodId) => {
    switch (id) {
      case 'razorpay':
        return <BankIcon />;
      case 'in_app':
        return <SmartphoneIcon />;
      case 'manual':
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
        {coinPackages.map((pkg, index) => {
          const baseCoinsForPrice = Math.floor(pkg.price / conversionRate);
          const pkgBonus = pkg.coins > baseCoinsForPrice ? pkg.coins - baseCoinsForPrice : 0;
          
          if (pkgBonus <= 0) return null; // Only show as special offer if there's a bonus
          
          const offerColor = [Colors.primary, Colors.accent, Colors.secondary][index % 3];
          
          return (
            <TouchableOpacity
              key={`pkg-${pkg.id}`}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedAmount(pkg.price);
                setCustomAmount('');
              }}
              style={[
                styles.offerCard,
                selectedAmount === pkg.price && { borderColor: offerColor, borderWidth: 1.5 },
              ]}>
              <View style={[styles.offerTag, { backgroundColor: `${offerColor}22` }]}>
                <Text style={[styles.offerTagText, { color: offerColor }]}>{pkg.name || 'Special Offer'}</Text>
              </View>
              <View style={styles.offerRow}>
                <View>
                  <Text style={styles.offerAmount}>Rs {pkg.price}</Text>
                  <Text style={styles.offerBonus}>+Rs {pkgBonus} bonus coins</Text>
                </View>
                <View style={styles.offerTotal}>
                  <Text style={styles.offerTotalLabel}>You get</Text>
                  <Text style={[styles.offerTotalAmount, { color: offerColor }]}>
                    {pkg.coins} Coins
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map(method => {
          const isSelected = selectedPayment === method.id;
          return (
            <View key={method.id}>
              <TouchableOpacity
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

              {isSelected && method.id === 'manual' && (
                <View style={{ backgroundColor: Colors.card, padding: 16, borderRadius: Radius.lg, marginBottom: 16, alignItems: 'center' }}>
                  <Text style={{ ...Typography.bodySemibold, color: Colors.foreground, marginBottom: 12 }}>Scan QR to Pay</Text>
                  {settings.payment_qr_url ? (
                    <View style={{ width: 200, height: 200, backgroundColor: Colors.border, borderRadius: Radius.md, marginBottom: 16, overflow: 'hidden' }}>
                      <Image 
                        source={{ uri: settings.payment_qr_url }} 
                        style={{ width: '100%', height: '100%' }} 
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <Text style={{ color: Colors.mutedForeground, marginBottom: 16 }}>No QR Code configured</Text>
                  )}
                  {settings.payment_qr_url && (
                    <TouchableOpacity 
                      style={{ padding: 10, backgroundColor: Colors.primary, borderRadius: Radius.md }}
                      onPress={() => {
                        Alert.alert('Download', 'Please take a screenshot of the QR code to save it.');
                      }}
                    >
                      <Text style={{ ...Typography.button, color: Colors.primaryForeground }}>Download QR</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}> 
        <View>
            <Text style={styles.ctaLabel}>Total</Text>
            <Text style={styles.ctaAmount}>
              Rs {finalAmount}
              <Text style={styles.ctaBonus}>  → {finalCoins} Coins</Text>
            </Text>
          </View>
          <TouchableOpacity
          onPress={handleRecharge}
          disabled={!finalAmount || isSubmitting}
          activeOpacity={0.8}
          style={styles.payBtnWrapper}
        >
          <LinearGradient
            colors={!finalAmount || isSubmitting ? [Colors.border, Colors.border] : [...Gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.payBtn}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={[styles.payBtnText, !finalAmount && { color: Colors.mutedForeground }]}>
                {selectedPayment === 'manual' ? 'Upload Screenshot' : 'Proceed to Pay'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        </View>
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
  payBtnWrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  payBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  payBtnText: {
    ...Typography.button,
    color: Colors.primaryForeground,
  }
});

export default RechargeScreen;
