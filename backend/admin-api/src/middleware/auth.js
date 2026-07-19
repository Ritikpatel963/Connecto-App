import { config } from "../config.js";
import { HttpError } from "../http.js";
import { supabase } from "../lib/supabaseRest.js";

const rolePermissions = {
  "super admin": ["*"],
  moderator: ["users:read", "users:write", "reports:read", "reports:write", "analytics:read"],
  support: ["users:read", "subscriptions:read", "payments:read", "reports:read", "analytics:read"],
  "read-only": ["users:read", "subscriptions:read", "reports:read", "payments:read", "matches:read", "analytics:read"],
};

export async function requireAdmin(req, permission) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Missing admin token");

  const userRes = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: config.supabaseAnonKey, authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) throw new HttpError(401, "Invalid admin token");

  const user = await userRes.json();
  const { data } = await supabase("admins", {
    query: { select: "id,name,email,role_id,is_active,roles(name)", auth_user_id: `eq.${user.id}`, limit: 1 },
  });
  const admin = data?.[0];
  if (!admin?.is_active) throw new HttpError(403, "Admin account is not active");

  const role = String(admin.roles?.name || "read-only").toLowerCase();
  const permissions = rolePermissions[role] || rolePermissions["read-only"];
  if (permission && !permissions.includes("*") && !permissions.includes(permission)) {
    throw new HttpError(403, "Missing admin permission");
  }

  req.admin = { id: admin.id, name: admin.name, email: admin.email, role, tokenScope: "admin" };
}
