export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const ok = (res, data, meta) => send(res, 200, { success: true, data, meta, error: null });
export const created = (res, data) => send(res, 201, { success: true, data, meta: null, error: null });
export const noContent = (res) => send(res, 204, null);

export function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  if (body) res.end(JSON.stringify(body));
  else res.end();
}

export function fail(res, error) {
  const status = error.status && error.status < 500 ? error.status : 500;
  send(res, status, {
    success: false,
    data: null,
    meta: null,
    error: { message: error.message || "Internal server error" },
  });
}

export async function readJson(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

export function pageParams(url) {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 25)));
  return { page, pageSize, from: (page - 1) * pageSize, to: page * pageSize - 1 };
}
