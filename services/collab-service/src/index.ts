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

const wss = new WebSocketServer({ noServer: true });
// TODO: maybe use Hono instead of node:http
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

// In-memory store of rooms and their users (in memory for simplicity for now :D)
const sessions = new Map();
sessions.set("session123", new Set(["userA", "userB"]));
sessions.set("session456", new Set(["userC", "userD"]));
sessions.set("dummy-session-id", new Set(["user1", "user2"]));

// Keep track of connected clients per session (optional)
const activeRooms = new Map(); // sessionId → Set of connected userIds

// Handle WebSocket connections

wss.on("connection", (ws, request) => {
  setupWSConnection(ws, request);

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
  // You may check auth of request here..
  // Call `wss.HandleUpgrade` *after* you checked whether the client has access
  // (e.g. by checking cookies, or url parameters).
  // See https://github.com/websockets/ws#client-authentication

  // const { query } = url.parse(request.url, true);
  const sessionId = "dummy-session-id"; // extract from request url or cookies
  const userId = "user1"; // extract from request url or cookies
  if (!sessionId || !userId) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  const session = sessions.get(sessionId);
  if (!session) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  // Check if session exists
  const allowedUsers = sessions.get(sessionId);
  if (!allowedUsers) {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  // Check if this user is part of the session
  if (!allowedUsers.has(userId)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  // Enforce max 2 connections (optional safety check)
  const room = activeRooms.get(sessionId) || new Set();
  if (room.size >= 2 && !room.has(userId)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  // Track the user's connection
  room.add(userId);
  activeRooms.set(sessionId, room);

  wss.handleUpgrade(
    request,
    socket,
    head,
    /** @param {any} ws */ (ws) => {
      wss.emit("connection", ws, request);
    }
  );

  // // Upgrade connection
  // wss.handleUpgrade(request, socket, head, (ws) => {
  //   ws.userId = userId;
  //   ws.sessionId = sessionId;

  //   wss.emit("connection", ws, request);
  // });
});

// Websocket server
server.listen(port, host, () => {
  console.log(`running websocket at '${host}' on port ${port}`);
});

// TODO: Enable Kafka once integration working
// Setup Kafka Client
// const kafkaClient: KafkaClient = new KafkaClient(kafkaConfig);
// try {
//   await kafkaClient.connect();
// } catch (err) {
//   console.error("Failed to connect to Kafka, exiting...");
//   await shutdown(1);
// }

// async function shutdown(code: number = 0) {
//   console.log("Shutting down collab-service...");
//   try {
//     await kafkaClient.disconnect();
//   } catch (err) {
//     console.error("Error during shutdown of collab-service:", err);
//     process.exit(1)
//   }

//   process.exit(code);
// }

//Handles exit signals - Termination, Interrupt
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
