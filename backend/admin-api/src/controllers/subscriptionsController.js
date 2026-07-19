import { ok, pageParams, readJson } from "../http.js";
import { audit } from "../services/auditService.js";
import { getSubscription, listSubscriptions, subscriptionStats, updateSubscription } from "../services/subscriptionsService.js";

export async function list(req, res, url) {
  const page = pageParams(url);
  const { rows, count } = await listSubscriptions({
    ...page,
    status: url.searchParams.get("status"),
    planId: url.searchParams.get("plan_id"),
    fromDate: url.searchParams.get("from"),
    toDate: url.searchParams.get("to"),
    search: url.searchParams.get("search"),
    sortBy: url.searchParams.get("sortBy"),
    sortDirection: url.searchParams.get("sortDirection"),
  });
  ok(res, rows, { page: page.page, pageSize: page.pageSize, totalCount: count });
}

export async function detail(_req, res, _url, params) {
  ok(res, await getSubscription(params.id));
}

export async function patch(req, res, _url, params) {
  const before = await getSubscription(params.id);
  const after = await updateSubscription(params.id, await readJson(req));
  await audit(req, "subscription.update", "subscriptions", params.id, before, after);
  ok(res, after);
}

export async function stats(_req, res) {
  ok(res, await subscriptionStats());
}
