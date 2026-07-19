import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Transaction, ReferralInfo } from '../shared/types/app';
import { useUser } from '../context/UserContext';
import { ENV } from '../config/env';
import { useEffect } from 'react';

export const useTransactions = () => {
  const { currentUser } = useUser(); 
  const id = currentUser?.id;
  const role = currentUser?.role;

  return useQuery({
    queryKey: ['transactions', id, role],
    queryFn: async () => {
      const userId = id || 1; 
      
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();
      const walletId = wallet?.id;

      const txPromise = supabase
        .from('wallet_transactions')
        .select('*')
        .or(`wallet_id.eq.${walletId || userId},wallet_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(15);
        
      const wdPromise = role === 'girl' 
        ? supabase
            .from('withdrawals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(15)
        : Promise.resolve({ data: [] });

      const [txRes, wdRes] = await Promise.all([txPromise, wdPromise]);

      const txData = txRes.data || [];
      const wdData = wdRes.data || [];

      let transactions = [
        ...txData.map((tx: any): Transaction => ({
          id: String(tx.id),
          type: (tx.transaction_type as any) || 'recharge',
          amount: Number(tx.amount || 0),
          description: String(tx.payment_method || 'Wallet Tx'),
          timestamp: String(tx.created_at),
          status: (tx.verification_status || tx.status) as any || 'completed',
          paymentGateway: String(tx.payment_method || '').split(':')[0],
          txnId: String(tx.payment_method || '').split(':')[1]?.trim() || '',
          screenshotUrl: tx.payment_screenshot_url || undefined
        })),
        ...wdData.map((wd: any): Transaction => ({
          id: `wd-${wd.id}`,
          type: 'withdrawal',
          amount: -(Number(wd.amount_coins || 0)),
          description: `Withdraw to ${String(wd.payment_method).split(':')[0] || 'Account'}`,
          timestamp: String(wd.created_at),
          status: wd.status || 'pending',
          paymentGateway: String(wd.payment_method || '').split(':')[0],
          txnId: String(wd.payment_method || '').split(':')[1]?.trim() || ''
        }))
      ];

      // Enforce business rules: boys only recharge/debit, girls only withdraw/credit
      transactions = transactions.filter(tx => {
        if (role === 'girl') {
          return ['withdrawal', 'earning', 'call_credit', 'referral_bonus'].includes(tx.type);
        }
        // Default to boy rules
        return ['recharge', 'call_debit', 'referral_bonus'].includes(tx.type);
      });

      return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
      
      let userCode = data?.referral_code;
      if (!userCode) {
        const res = await fetch(`${ENV.API_URL}/api/app/v1/users/referral-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`
          }
        });
        if (res.ok) {
          const resData = await res.json();
          userCode = resData.code;
        }
      }

      const { data: historyData } = await supabase
        .from('referrals')
        .select('*, referred:referred_user_id(name, phone_number)')
        .eq('referrer_user_id', userId)
        .order('created_at', { ascending: false });

      const history = historyData || [];
      const computedTotalReferred = history.length;
      const computedTotalEarnings = history.filter(h => h.status === 'qualified' || h.status === 'successful' || h.status === 'completed').length * 50;

      return {
        code: userCode,
        totalReferred: computedTotalReferred,
        totalEarnings: computedTotalEarnings,
        milestones: [
          { target: 10, reward: 500, reached: computedTotalReferred >= 10 },
          { target: 50, reward: 3000, reached: computedTotalReferred >= 50 },
          { target: 100, reward: 8000, reached: computedTotalReferred >= 100 }
        ],
        history
      } as ReferralInfo & { history: any[] };
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
export const useMonthlyEarnings = () => {
  const { currentUser } = useUser();
  const id = currentUser?.id;
  return useQuery({
    queryKey: ['monthlyEarnings', id],
    queryFn: async () => {
      if (!id) return 0;
      const { data: wallet } = await supabase.from('wallets').select('id').or(`id.eq.${id},user_id.eq.${id}`).maybeSingle();
      if (!wallet) return 0;
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('wallet_id', wallet.id)
        .eq('transaction_type', 'earning')
        .gte('created_at', startOfMonth.toISOString());
        
      if (error) return 0;
      return data.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    }
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

export const useWalletRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:wallet_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
