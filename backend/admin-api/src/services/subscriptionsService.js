import { HttpError } from "../http.js";
import { filterQuery, supabase } from "../lib/supabaseRest.js";

const select = "id,user_id,plan_id,status,provider,current_period_start,current_period_end,trial_ends_at,cancel_at_period_end,created_at,updated_at,users(id,name,phone_number)";
const writable = new Set(["status", "plan_id", "current_period_end", "trial_ends_at", "cancel_at_period_end"]);

export async function listSubscriptions(params) {
  const query = {
    select,
    order: `${params.sortBy || "created_at"}.${params.sortDirection === "asc" ? "asc" : "desc"}`,
    limit: params.pageSize,
    offset: params.from,
    ...filterQuery({ status: params.status, plan_id: params.planId }),
  };
  const dateFilters = [params.fromDate && `gte.${params.fromDate}`, params.toDate && `lte.${params.toDate}`].filter(Boolean);
  if (dateFilters.length) query.created_at = dateFilters;
  if (params.search) query.or = `plan_id.ilike.*${params.search}*,provider.ilike.*${params.search}*`;

  const { data, count } = await supabase("subscriptions", {
    query,
    headers: { prefer: "count=exact" },
  });
  return { rows: sanitizeRows(data || []), count };
}

export async function getSubscription(id) {
  const { data } = await supabase("subscriptions", { query: { select, id: `eq.${id}`, limit: 1 } });
  if (!data?.[0]) throw new HttpError(404, "Subscription not found");
  return sanitize(data[0]);
}

export async function updateSubscription(id, payload) {
  const patch = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (writable.has(key)) patch[key] = value;
  });
  if (!Object.keys(patch).length) throw new HttpError(400, "No supported subscription fields");

  patch.updated_at = new Date().toISOString();
  const { data } = await supabase("subscriptions", {
    method: "PATCH",
    query: { id: `eq.${id}`, select },
    body: patch,
    headers: { prefer: "return=representation" },
  });
  if (!data?.[0]) throw new HttpError(404, "Subscription not found");
  return sanitize(data[0]);
}

export async function subscriptionStats() {
  const { data } = await supabase("admin_subscription_stats", {
    query: { select: "*", order: "snapshot_date.desc", limit: 1 },
  });
  return data?.[0] || { active_count: 0, trial_count: 0, churned_count: 0, revenue: 0, snapshot_date: null };
}

function sanitizeRows(rows) {
  return rows.map(sanitize);
}

function sanitize(row) {
  const { users, ...subscription } = row;
  return {
    ...subscription,
    user: users ? { id: users.id, name: users.name, phone_number: users.phone_number } : null,
  };
}

