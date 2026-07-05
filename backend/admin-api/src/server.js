import http from "node:http";
import { config } from "./config.js";
import { fail } from "./http.js";
import { route } from "./routes/adminRoutes.js";

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin === config.adminOrigin) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("access-control-allow-headers", "authorization,content-type");
    res.setHeader("access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  try {
    await route(req, res, new URL(req.url || "/", `http://${req.headers.host}`));
  } catch (error) {
    fail(res, error);
  }
});

server.listen(config.port, () => {
  console.log(`Admin API listening on :${config.port}`);
});
