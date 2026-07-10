import http from "node:http";
import { Server } from "socket.io";
import { config } from "./config.js";
import { fail } from "./http.js";
import { route } from "./routes/adminRoutes.js";
import { appRoute } from "./routes/appRoutes.js";

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
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host}`);
    if (parsedUrl.pathname.startsWith("/api/app")) {
      await appRoute(req, res, parsedUrl);
    } else {
      await route(req, res, parsedUrl);
    }
  } catch (error) {
    fail(res, error);
  }
});

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

server.listen(config.port, () => {
  console.log(`API listening on :${config.port}`);
});
