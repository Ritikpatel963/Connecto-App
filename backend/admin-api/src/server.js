import http from "node:http";
import { Server } from "socket.io";
import { config } from "./config.js";
import { fail } from "./http.js";
import { route } from "./routes/adminRoutes.js";
import { appRoute } from "./routes/appRoutes.js";

const server = http.createServer(async (req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "authorization,content-type");
  res.setHeader("access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("access-control-allow-private-network", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  try {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host}`);
    if (parsedUrl.pathname === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "success", message: "Yes API works perfectly" }));
    }
    if (parsedUrl.pathname.startsWith("/api/app")) {
      await appRoute(req, res, parsedUrl);
    } else {
      await route(req, res, parsedUrl);
    }
  } catch (error) {
    console.error("Uncaught error:", error);
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

server.listen(config.port, "0.0.0.0", () => {
  console.log(`API listening on :${config.port}`);
});
