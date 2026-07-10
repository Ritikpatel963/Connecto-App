import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Transaction, ReferralInfo } from '../shared/types/app';
import { useUser } from '../context/UserContext';

export const useTransactions = () => {
  const { currentUser } = useUser(); const id = currentUser?.id;
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      // For now, hardcode user ID 1 if context is missing, since we don't have auth yet
      const userId = id || 1; 
      
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();
      const walletId = wallet?.id;

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .or(`wallet_id.eq.${walletId || userId},wallet_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((tx: any): Transaction => ({
        id: String(tx.id),
        type: (tx.transaction_type as any) || 'recharge',
        amount: Number(tx.amount || 0),
        description: String(tx.payment_method || 'Wallet Tx'),
        timestamp: String(tx.created_at),
        status: (tx.verification_status || tx.status) as any || 'completed'
      }));
    }
  });
};

export const useReferralStats = () => {
  const { currentUser } = useUser(); const id = currentUser?.id;
  return useQuery({
    queryKey: ['referrals', id],
    queryFn: async () => {
      const userId = id || 1;
      const { data, error } = await supabase
        .from('users')
        .select('referral_code, total_referrals, referral_earnings')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        code: data?.referral_code || 'N/A',
        totalReferred: data?.total_referrals || 0,
        totalEarnings: data?.referral_earnings || 0,
        milestones: [
          { target: 10, reward: 500, reached: (data?.total_referrals || 0) >= 10 },
          { target: 50, reward: 3000, reached: (data?.total_referrals || 0) >= 50 },
          { target: 100, reward: 8000, reached: (data?.total_referrals || 0) >= 100 }
        ]
      } as ReferralInfo;
    }
  });
};

export const useWalletBalance = () => {
  const { currentUser, setWalletBalance } = useUser(); 
  const id = currentUser?.id;
  
  return useQuery({
    queryKey: ['walletBalance', id],
    queryFn: async () => {
      const userId = id || 1;
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('balance')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') throw error; // ignore no rows error
      
      const balance = wallet?.balance || 0;
      setWalletBalance(balance); // Sync local state
      return balance;
    },
    // We can enable this even without ID if we fallback to 1 for demo purposes
    // enabled: !!id, 
  });
};
export const useCoinPackages = () => {
  return useQuery({
    queryKey: ['coinPackages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
        
      if (error) throw error;
      return data || [];
    }
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      const settingsMap = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
      return settingsMap;
    }
  });
};
