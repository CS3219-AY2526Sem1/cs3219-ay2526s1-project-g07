import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { WebSocketServer } from "ws";
import http from "http";
import { setupWSConnection } from "@y/websocket-server/utils";

const wss = new WebSocketServer({ noServer: true });
const host = process.env.HOST || "localhost";
const port = Number.parseInt(process.env.PORT || "1234");

const app = new Hono();

const server = http.createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

wss.on("connection", setupWSConnection);

server.on("upgrade", (request, socket, head) => {
  // You may check auth of request here..
  // Call `wss.HandleUpgrade` *after* you checked whether the client has access
  // (e.g. by checking cookies, or url parameters).
  // See https://github.com/websockets/ws#client-authentication
  wss.handleUpgrade(
    request,
    socket,
    head,
    /** @param {any} ws */ (ws) => {
      wss.emit("connection", ws, request);
    }
  );
});

// Websocket server
server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});

// ------------------- Hono Routes ------------------ //

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Hono Http server
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
