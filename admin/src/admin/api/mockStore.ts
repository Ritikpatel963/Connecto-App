import { entityConfigs } from "../../data/adminSchema";
import { BaseRecord, ListParams, ListResponse } from "../types";

type Store = Record<string, BaseRecord[]>;

const keyMap: Record<string, string> = {
  "user-languages": "user-languages",
  "user-interests": "user-interests",
  "id-verifications": "id-verifications",
  "voice-verifications": "voice-verifications",
  "wallet-transactions": "wallet-transactions",
  "referral-tiers": "referral-tiers",
  "referral-redemptions": "referral-redemptions",
  "role-permissions": "role-permissions",
};

const source = entityConfigs as Record<string, { rows: BaseRecord[] }>;
const store: Store = Object.fromEntries(
  Object.entries(source).map(([key, config]) => [keyMap[key] || key, config.rows.map((row) => ({ ...row }))])
);

const valueForSearch = (record: BaseRecord) =>
  Object.values(record)
    .filter((value) => typeof value !== "object")
    .join(" ")
    .toLowerCase();

export const mockStore = {
  list<T extends BaseRecord>(resource: string, params: ListParams): ListResponse<T> {
    let rows = [...(store[resource] || [])] as T[];
    const search = params.search?.trim().toLowerCase();

    if (search) rows = rows.filter((row) => valueForSearch(row).includes(search));

    Object.entries(params.filters || {}).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") return;
      rows = rows.filter((row) => String(row[key]) === String(value));
    });

    if (params.sortBy) {
      const direction = params.sortDirection === "desc" ? -1 : 1;
      rows.sort((a, b) => String(a[params.sortBy! as keyof T] ?? "").localeCompare(String(b[params.sortBy! as keyof T] ?? ""), undefined, { numeric: true }) * direction);
    }

    const total = rows.length;
    const start = (params.page - 1) * params.pageSize;
    return { data: rows.slice(start, start + params.pageSize), total, page: params.page, pageSize: params.pageSize };
  },

  get<T extends BaseRecord>(resource: string, id: string | number): T {
    const row = (store[resource] || []).find((item) => String(item.id) === String(id));
    if (!row) throw new Error("Record not found");
    return { ...row } as T;
  },

  create<T extends BaseRecord>(resource: string, payload: Partial<T>): T {
    const row = { id: `${resource.toUpperCase()}-${Date.now()}`, ...payload } as T;
    store[resource] = [row, ...(store[resource] || [])];
    return row;
  },

  update<T extends BaseRecord>(resource: string, id: string | number, payload: Partial<T>): T {
    let updated: BaseRecord | undefined;
    let oldRecord: BaseRecord | undefined;
    
    store[resource] = (store[resource] || []).map((row) => {
      if (String(row.id) !== String(id)) return row;
      oldRecord = { ...row };
      updated = { ...row, ...payload };
      return updated;
    });
    
    if (!updated) throw new Error("Record not found");

    // ponytail: auto-credit mock wallet on approval
    if (resource === 'wallet-transactions' && payload.verification_status === 'verified' && oldRecord?.verification_status !== 'verified') {
      const wallet = store['wallets']?.find(w => String(w.id) === String((updated as any).wallet_id) || String(w.user_id) === String((updated as any).wallet_id));
      if (wallet) mockStore.update('wallets', wallet.id as string, { balance: Number(wallet.balance) + Number((updated as any).amount) });
    }

    // Ponytail Mock Automation: Trigger reward when a referral gets qualified!
    if (resource === 'referrals' && payload.status === 'qualified' && oldRecord?.status !== 'qualified') {
      const referrerId = updated.referrer_user_id;
      // Count qualified
      const totalQualified = store['referrals'].filter(r => r.referrer_user_id === referrerId && r.status === 'qualified').length;
      
      // Find matching tier
      const tier = store['referral-tiers']?.find(t => t.is_active && Number(t.min_referrals) === totalQualified);
      if (tier) {
        // Auto-reward!
        mockStore.create('referral-redemptions', {
          user_id: referrerId,
          tier_id: tier.id,
          qualified_referrals_at_request: totalQualified,
          reward_amount: tier.reward_amount,
          status: 'credited',
          requested_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        });
        
        // Find wallet
        const wallet = store['wallets']?.find(w => w.user_id === referrerId);
        if (wallet) {
          mockStore.create('wallet-transactions', {
            wallet_id: wallet.id,
            transaction_type: 'referral_reward',
            amount: tier.reward_amount,
            payment_method: 'system_auto',
            verification_status: 'verified',
            created_at: new Date().toISOString(),
          });
          // Add balance
          mockStore.update('wallets', wallet.id as string, { balance: Number(wallet.balance) + Number(tier.reward_amount) });
        }
      }
    }

    return updated as T;
  },

  remove(resource: string, id: string | number): void {
    store[resource] = (store[resource] || []).filter((row) => String(row.id) !== String(id));
  },

  rows(resource: string): BaseRecord[] {
    return (store[resource] || []).map((row) => ({ ...row }));
  },
};
