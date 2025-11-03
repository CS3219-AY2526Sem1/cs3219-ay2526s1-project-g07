// AI Assistance Disclosure:
// Tool: GitHub Copilot (model: claude-sonnet-3.5), date: 2025-10-12
// Scope: Generated instantiation of kafka client for collab-service
// Author review: I have reviewed the code for correctness and ran it in a test file to ensure that the event gets produced.

import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { WebSocketServer } from "ws";
import http from "http";
import { setupWSConnection } from "@y/websocket-server/utils";
import { KafkaClient, type KafkaConfig } from "./kafka/client.js";
import { checkSessionAndUsers } from "./sessions.js";
import { addActiveRoom } from "./rooms.js";

const wss = new WebSocketServer({ noServer: true });
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "5004", 10);
const kafkaConfig: KafkaConfig = {
  clientId: "collab-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
  retry: { initialRetryTime: 300, retries: 10 },
};

const app = new Hono();

const server = http.createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

// Handle WebSocket connections
wss.on("connection", (ws, request) => {
  console.log("New WebSocket connection");
  setupWSConnection(ws, request);
  console.log(`User ${ (ws as any).userId } connected to session ${ (ws as any).sessionId }`);
  addActiveRoom((ws as any).sessionId, (ws as any).userId, ws as any);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log(`Received message ${data} from user`);
  });

  // ws.on("close", () => {
  //   // Clean up when user disconnects
  //   const room = activeRooms.get(ws.sessionId);
  //   if (room) {
  //     room.delete(ws.userId);
  //     if (room.size === 0) activeRooms.delete(ws.sessionId);
  //   }
  // });
});
server.on("upgrade", (request, socket, head) => {
  // Call `wss.HandleUpgrade` *after* you checked whether the client has access
  // (e.g. by checking cookies, or url parameters).
  // See https://github.com/websockets/ws#client-authentication

  console.log("Upgrade request received, Host:", request.headers.host, "URL:", request.url);
  // console.log(request);
  const url= new URL(request.url || "", `http://${request.headers.host}`);
  const collabSessionId = url.searchParams.get("sessionId");
  const userId = url.searchParams.get("userId");

  if (!collabSessionId || !userId) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  console.log(`Authenticating user ${userId} for session ${collabSessionId}`);
  const isValidUser = checkSessionAndUsers(collabSessionId, userId);
  if (!isValidUser) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  console.log("Authentication successful");
  console.log(`Upgrading connection for user ${userId} in session ${collabSessionId}`);
  wss.handleUpgrade(request, socket, head, /** @param {any} ws */ ws => {
      (ws as any).userId = userId;
      (ws as any).sessionId = collabSessionId;
    wss.emit('connection', ws, request)
  })
});

// Websocket server
server.listen(port, host, () => {
  console.log(`running websocket at '${host}' on port ${port}`);
});

// TODO: Enable Kafka once integration working
// Setup Kafka Client
export const kafkaClient: KafkaClient = new KafkaClient(kafkaConfig);
try {
  await kafkaClient.connect();
} catch (err) {
  console.error("Failed to connect to Kafka, exiting...");
  await shutdown(1);
}

async function shutdown(code: number = 0) {
  console.log("Shutting down collab-service...");
  try {
    await kafkaClient.disconnect();
  } catch (err) {
    console.error("Error during shutdown of collab-service:", err);
    process.exit(1)
  }

  process.exit(code);
}

// Handles exit signals - Termination, Interrupt
process.on('SIGTERM', () => shutdown());
process.on('SIGINT', () => shutdown());

// ------------------- Hono Routes ------------------ //

// app.get("/", (c) => {
//   return c.text("Hello Hono!");
// });

// // Hono Http server
// serve(
//   {
//     fetch: app.fetch,
//     port: 5004,
//   },
//   (info) => {
//     console.log(`Server is running on http://${info.address}:${info.port}`);
//   }
// );
