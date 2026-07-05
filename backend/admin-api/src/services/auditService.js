import { supabase } from "../lib/supabaseRest.js";

export async function audit(req, action, resource, resourceId, beforeValue, afterValue) {
  await supabase("admin_audit_log", {
    method: "POST",
    body: [{
      admin_id: req.admin.id,
      action,
      resource,
      resource_id: String(resourceId),
      before_value: beforeValue,
      after_value: afterValue,
      ip_address: req.socket.remoteAddress,
      user_agent: req.headers["user-agent"] || null,
    }],
    headers: { prefer: "return=minimal" },
  });
}
