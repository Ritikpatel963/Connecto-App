import { config } from "../config.js";
import * as subscriptions from "../controllers/subscriptionsController.js";
import { HttpError, ok, readJson } from "../http.js";
import { requireAdmin } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

export async function route(req, res, url) {
  const path = url.pathname.replace(/^\/api\/admin\/v1/, "") || "/";

  if (req.method === "POST" && path === "/auth/login") {
    rateLimit(req.socket.remoteAddress || "unknown", 10, 60_000);
    const body = await readJson(req);
    const auth = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: config.supabaseAnonKey, "content-type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
    if (!auth.ok) throw new HttpError(401, "Invalid admin credentials");

    const session = await auth.json();
    req.headers.authorization = `Bearer ${session.access_token}`;
    await requireAdmin(req);
    return ok(res, {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      token_scope: "admin",
      admin: req.admin,
    });
  }

  if (req.method === "GET" && path === "/subscriptions/stats") {
    await requireAdmin(req, "subscriptions:read");
    return subscriptions.stats(req, res, url);
  }
  if (req.method === "GET" && path === "/subscriptions") {
    await requireAdmin(req, "subscriptions:read");
    return subscriptions.list(req, res, url);
  }
  const subscriptionMatch = path.match(/^\/subscriptions\/([^/]+)$/);
  if (subscriptionMatch && req.method === "GET") {
    await requireAdmin(req, "subscriptions:read");
    return subscriptions.detail(req, res, url, { id: subscriptionMatch[1] });
  }
  if (subscriptionMatch && req.method === "PATCH") {
    await requireAdmin(req, "subscriptions:write");
    return subscriptions.patch(req, res, url, { id: subscriptionMatch[1] });
  }

  if (req.method === "POST" && (path === "/push/dispatch" || path === "/notifications/send")) {
    await requireAdmin(req);
    const body = await readJson(req);
    const { userId, userIds, title, message, audience } = body;
    const targetIds = userIds || (userId ? [userId] : []);
    
    const { sendPushNotification } = await import("../lib/firebase.js");
    
    let tokens = [];
    if (audience === 'specific' && targetIds.length > 0) {
      const dbRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=in.(${targetIds.join(',')})&select=fcm_token`, { headers: { apikey: config.supabaseServiceRoleKey, Authorization: `Bearer ${config.supabaseServiceRoleKey}` }});
      const data = await dbRes.json();
      tokens = data.map(u => u.fcm_token).filter(Boolean);
    } else {
      let query = `${config.supabaseUrl}/rest/v1/users?select=fcm_token&fcm_token=not.is.null`;
      if (audience === 'male') query += '&gender=eq.male';
      if (audience === 'female') query += '&gender=eq.female';
      if (audience === 'verified') query += '&is_id_verified=eq.true';
      
      const dbRes = await fetch(query, { headers: { apikey: config.supabaseServiceRoleKey, Authorization: `Bearer ${config.supabaseServiceRoleKey}` }});
      const data = await dbRes.json();
      tokens = data.map(u => u.fcm_token).filter(Boolean);
    }
    
    let sentCount = 0;
    for (const token of tokens) {
      if (await sendPushNotification(token, title, message)) sentCount++;
    }

    // Ponytail: Lazy log push notification directly via fetch
    const dbRes2 = await fetch(`${config.supabaseUrl}/rest/v1/push_notifications`, {
      method: 'POST',
      headers: {
        apikey: config.supabaseServiceRoleKey,
        Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, message, target_user_id: userId || null, sent_count: sentCount })
    });
    if (!dbRes2.ok) {
      console.error("DB Save Error:", await dbRes2.text());
    }
    
    return ok(res, { success: true, sentCount });
  }

  if (req.method === "GET" && path === "/push/history") {
    await requireAdmin(req);
    const dbRes = await fetch(`${config.supabaseUrl}/rest/v1/push_notifications?order=created_at.desc`, {
      headers: {
        apikey: config.supabaseServiceRoleKey,
        Authorization: `Bearer ${config.supabaseServiceRoleKey}`
      }
    });
    if (!dbRes.ok) throw new HttpError(500, "Failed to fetch notification history");
    const history = await dbRes.json();
    return ok(res, history);
  }

  // Create a staff auth user with email pre-confirmed (service role bypasses email confirmation)
  if (req.method === "POST" && path === "/staff/create") {
    await requireAdmin(req);
    const { email, password } = await readJson(req);
    if (!email || !password) throw new HttpError(400, "email and password required");

    const createRes = await fetch(`${config.supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseServiceRoleKey,
        Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new HttpError(createRes.status, createData?.message || "Failed to create auth user");
    return ok(res, { id: createData.id, email: createData.email });
  }

  throw new HttpError(404, "Route not found");
}
