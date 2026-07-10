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

  throw new HttpError(404, "Route not found");
}
