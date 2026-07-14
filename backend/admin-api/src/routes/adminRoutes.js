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

  if (req.method === "POST" && path === "/notifications/send") {
    await requireAdmin(req);
    const body = await readJson(req);
    const { userId, title, message } = body;
    
    const { sendPushNotification } = await import("../lib/firebase.js");
    
    let tokens = [];
    if (userId) {
      const dbRes = await fetch(`${config.supabaseUrl}/rest/v1/users?id=eq.${userId}&select=fcm_token`, { headers: { apikey: config.supabaseServiceRoleKey, Authorization: `Bearer ${config.supabaseServiceRoleKey}` }});
      const data = await dbRes.json();
      if (data[0] && data[0].fcm_token) tokens.push(data[0].fcm_token);
    } else {
      const dbRes = await fetch(`${config.supabaseUrl}/rest/v1/users?select=fcm_token&fcm_token=not.is.null`, { headers: { apikey: config.supabaseServiceRoleKey, Authorization: `Bearer ${config.supabaseServiceRoleKey}` }});
      const data = await dbRes.json();
      tokens = data.map(u => u.fcm_token).filter(Boolean);
    }
    
    let sentCount = 0;
    for (const token of tokens) {
      if (await sendPushNotification(token, title, message)) sentCount++;
    }
    
    return ok(res, { success: true, sentCount });
  }

  throw new HttpError(404, "Route not found");
}
