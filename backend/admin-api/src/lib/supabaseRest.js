import { config } from "../config.js";
import { HttpError } from "../http.js";

const jsonHeaders = {
  apikey: config.supabaseServiceRoleKey,
  authorization: `Bearer ${config.supabaseServiceRoleKey}`,
  "content-type": "application/json",
};

const encode = (value) => encodeURIComponent(value).replace(/%2C/g, ",");

export async function supabase(path, { method = "GET", query = {}, body, headers = {} } = {}) {
  const url = new URL(`${config.supabaseUrl}/rest/v1/${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
    else url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    method,
    headers: { ...jsonHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new HttpError(response.status, "Database request failed");
  return { data, count: countFromRange(response.headers.get("content-range")) };
}

export function filterQuery(filters) {
  const query = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query[key] = `eq.${encode(String(value))}`;
  });
  return query;
}

function countFromRange(value) {
  if (!value) return 0;
  const [, total] = value.split("/");
  return Number(total || 0);
}

