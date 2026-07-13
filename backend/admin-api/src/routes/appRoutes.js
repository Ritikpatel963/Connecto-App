import Razorpay from "razorpay";
import { HttpError, ok, readJson } from "../http.js";
import { config } from "../config.js";

// Basic supabase fetch wrapper
async function getSupabaseSettings() {
  const res = await fetch(`${config.supabaseUrl}/rest/v1/settings?select=*`, {
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch settings from Supabase");
  const data = await res.json();
  const settings = {};
  for (const row of data) settings[row.key] = row.value;
  return settings;
}

export async function appRoute(req, res, url) {
  const path = url.pathname.replace(/^\/api\/app\/v1/, "") || "/";

  // Razorpay Order Creation Endpoint
  if (req.method === "POST" && path === "/payments/razorpay/order") {
    const body = await readJson(req);
    const amount = body.amount; // in INR
    if (!amount) throw new HttpError(400, "Amount is required");

    const settings = await getSupabaseSettings();
    const key_id = settings.razorpay_key_id;
    const key_secret = settings.razorpay_key_secret;

    if (!key_id || !key_secret) {
      throw new HttpError(500, "Razorpay is not configured on the server");
    }

    const instance = new Razorpay({ key_id, key_secret });

    try {
      const order = await instance.orders.create({
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      return ok(res, order);
    } catch (err) {
      console.error("Razorpay order error:", err);
      throw new HttpError(500, "Failed to create order");
    }
  }

  // Wallet Recharge Processing (Manual & Razorpay)
  if (req.method === "POST" && path === "/wallet/recharge") {
    const body = await readJson(req);
    const { amount, paymentMethod, screenshotUrl } = body;
    if (!amount || amount < 10) throw new HttpError(400, "Invalid amount");

    // 1. Verify User Auth
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) throw new HttpError(401, "Missing auth token");
    
    const userRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${token}`, {
      headers: { apikey: config.supabaseServiceRoleKey, authorization: `Bearer ${config.supabaseServiceRoleKey}` },
    });
    const users = await userRes.json();
    if (!userRes.ok || !users || users.length === 0) throw new HttpError(401, "Invalid auth token");
    const user = users[0];
    const userId = user.id;

    // 2. Fetch packages to calculate coins server-side
    const settings = await getSupabaseSettings();
    const packagesRes = await fetch(`${config.supabaseUrl}/rest/v1/coin_packages?select=*`, {
      headers: { apikey: config.supabaseServiceRoleKey, Authorization: `Bearer ${config.supabaseServiceRoleKey}` },
    });
    const packages = await packagesRes.json();
    
    const baseRule = packages[0];
    const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
    const pkg = packages.find(p => p.price === amount);
    const baseCoins = Math.floor(amount / conversionRate);
    const bonus = (pkg && pkg.coins > baseCoins) ? pkg.coins - baseCoins : 0;
    const finalCoins = baseCoins + bonus;

    const isVerified = paymentMethod === 'razorpay';
    const status = isVerified ? 'verified' : 'pending';

    const serviceHeaders = {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    };

    // 3. Ensure Wallet Exists
    let walletRes = await fetch(`${config.supabaseUrl}/rest/v1/wallets?user_id=eq.${userId}&select=id,balance`, { headers: serviceHeaders });
    let walletData = await walletRes.json();
    let wallet = walletData[0];
    
    if (!wallet) {
      const createRes = await fetch(`${config.supabaseUrl}/rest/v1/wallets`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ id: userId, user_id: userId, balance: 0 })
      });
      walletData = await createRes.json();
      wallet = walletData[0];
    }
    const walletId = wallet.id;

    // 4. Insert Transaction
    await fetch(`${config.supabaseUrl}/rest/v1/wallet_transactions`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        wallet_id: walletId,
        transaction_type: 'recharge',
        amount: amount,
        payment_method: paymentMethod,
        payment_screenshot_url: screenshotUrl || null,
        verification_status: status
      })
    });

    let newBalance = wallet.balance;

    if (isVerified) {
      // 5. Update Balance Safely
      newBalance = wallet.balance + finalCoins;
      await fetch(`${config.supabaseUrl}/rest/v1/wallets?id=eq.${walletId}`, {
        method: "PATCH",
        headers: serviceHeaders,
        body: JSON.stringify({ balance: newBalance })
      });

      // 6. Update Referral & Reward
      const refRes = await fetch(`${config.supabaseUrl}/rest/v1/referrals?referred_user_id=eq.${userId}&status=eq.pending&select=referrer_user_id`, { headers: serviceHeaders });
      const pendingRefs = await refRes.json();
      if (pendingRefs && pendingRefs.length > 0) {
        const referrerId = pendingRefs[0].referrer_user_id;
        
        await fetch(`${config.supabaseUrl}/rest/v1/referrals?referred_user_id=eq.${userId}&status=eq.pending`, {
          method: "PATCH",
          headers: serviceHeaders,
          body: JSON.stringify({ status: 'successful' })
        });

        // ponytail: naive 4-step REST reward. RPC would be safer, but this keeps logic here without SQL migrations.
        const rwRes = await fetch(`${config.supabaseUrl}/rest/v1/wallets?id=eq.${referrerId}&select=balance`, { headers: serviceHeaders });
        const rwData = await rwRes.json();
        if (rwData && rwData.length > 0) {
          await fetch(`${config.supabaseUrl}/rest/v1/wallets?id=eq.${referrerId}`, {
            method: "PATCH",
            headers: serviceHeaders,
            body: JSON.stringify({ balance: rwData[0].balance + (parseInt(settings.referral_reward_coins) || 50) })
          });
        }
      }
    }

    return ok(res, { newBalance, status });
  }

  // Wallet Withdrawal
  if (req.method === "POST" && path === "/wallet/withdraw") {
    const body = await readJson(req);
    const { amount, payoutMethod, payoutDetails } = body;
    if (!amount || amount < 100) throw new HttpError(400, "Invalid amount");
    if (!payoutMethod || !payoutDetails) throw new HttpError(400, "Missing payout details");

    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) throw new HttpError(401, "Missing auth token");
    
    const userRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${token}`, {
      headers: { apikey: config.supabaseServiceRoleKey, authorization: `Bearer ${config.supabaseServiceRoleKey}` },
    });
    const users = await userRes.json();
    if (!userRes.ok || !users || users.length === 0) throw new HttpError(401, "Invalid auth token");
    const user = users[0];
    const userId = user.id;

    const serviceHeaders = {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    };

    let walletRes = await fetch(`${config.supabaseUrl}/rest/v1/wallets?user_id=eq.${userId}&select=id,balance`, { headers: serviceHeaders });
    let walletData = await walletRes.json();
    let wallet = walletData[0];
    
    if (!wallet) {
      const createRes = await fetch(`${config.supabaseUrl}/rest/v1/wallets`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ id: userId, user_id: userId, balance: 0 })
      });
      walletData = await createRes.json();
      wallet = walletData[0];
    }

    if (wallet.balance < amount) {
      throw new HttpError(400, "Insufficient balance");
    }

    const wRes = await fetch(`${config.supabaseUrl}/rest/v1/withdrawals`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        user_id: userId,
        amount_coins: amount,
        amount_fiat: amount / 10,
        currency: 'INR',
        payment_method: `${payoutMethod}: ${payoutDetails}`,
        status: 'pending'
      })
    });
      if (!wRes.ok) {
        const errObj = await wRes.json().catch(()=>null);
        console.error("Failed to insert withdrawal:", errObj);
        throw new HttpError(500, "Failed to record withdrawal request");
      }

      let newBalance = wallet.balance - amount;
      let wUpdateRes = await fetch(`${config.supabaseUrl}/rest/v1/wallets?id=eq.${wallet.id}`, {
        method: "PATCH",
        headers: serviceHeaders,
        body: JSON.stringify({ balance: newBalance, updated_at: new Date().toISOString() })
      });
      if (!wUpdateRes.ok) {
        const errObj = await wUpdateRes.json().catch(()=>null);
        throw new HttpError(500, "Failed to update wallet balance");
      }

    return ok(res, { newBalance });
  }

  // Submit Rating
  if (req.method === "POST" && path === "/ratings") {
    const body = await readJson(req);
    const { targetUserId, rating, reviewText } = body;
    if (!targetUserId || !rating) throw new HttpError(400, "Missing rating details");

    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) throw new HttpError(401, "Missing auth token");
    
    const userRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${token}`, {
      headers: { apikey: config.supabaseServiceRoleKey, authorization: `Bearer ${config.supabaseServiceRoleKey}` },
    });
    const users = await userRes.json();
    if (!userRes.ok || !users || users.length === 0) throw new HttpError(401, "Invalid auth token");
    const user = users[0];
    const userId = user.id;

    const serviceHeaders = {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    };

    await fetch(`${config.supabaseUrl}/rest/v1/ratings`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        rater_user_id: userId,
        rated_user_id: targetUserId,
        rating: rating,
        review_text: reviewText,
        call_id: `call-${Date.now()}`
      })
    });

    return ok(res, { success: true });
  }

  // Generate Referral Code
  if (req.method === "POST" && path === "/users/referral-code") {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) throw new HttpError(401, "Missing auth token");
    
    const userRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${token}`, {
      headers: { apikey: config.supabaseServiceRoleKey, authorization: `Bearer ${config.supabaseServiceRoleKey}` },
    });
    const users = await userRes.json();
    if (!userRes.ok || !users || users.length === 0) throw new HttpError(401, "Invalid auth token");
    const user = users[0];
    const userId = user.id;

    const serviceHeaders = {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    };

    const checkRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${userId}&select=referral_code`, { headers: serviceHeaders });
    const checkData = await checkRes.json();
    let code = checkData[0]?.referral_code;

    if (!code) {
      code = `USER${userId}${Math.abs(userId * 7391) % 10000}`;
      await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
        method: "PATCH",
        headers: serviceHeaders,
        body: JSON.stringify({ referral_code: code })
      });
    }

    return ok(res, { code });
  }

  // Presence Update
  if (req.method === "POST" && path === "/users/presence") {
    const body = await readJson(req);
    const { isOnline } = body;

    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) throw new HttpError(401, "Missing auth token");
    
    const userRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${token}`, {
      headers: { apikey: config.supabaseServiceRoleKey, authorization: `Bearer ${config.supabaseServiceRoleKey}` },
    });
    const users = await userRes.json();
    if (!userRes.ok || !users || users.length === 0) throw new HttpError(401, "Invalid auth token");
    const user = users[0];
    const userId = user.id;

    const serviceHeaders = {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json"
    };

    await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
      method: "PATCH",
      headers: serviceHeaders,
      body: JSON.stringify({ 
        is_online: isOnline, 
        last_seen_at: new Date().toISOString() 
      })
    });

    return ok(res, { success: true });
  }

  throw new HttpError(404, "Route not found");
}
