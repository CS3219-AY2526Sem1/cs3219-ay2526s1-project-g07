
/*
AI Assistance Disclosure:
Tool: GitHub Copilot (model: claude-sonnet-3.5), date: 2025-10-12
Scope: Generated instantiation of kafka client for collab-service
Author review: I have reviewed the code for correctness and ran it in a test file to ensure that the event gets produced.

Tool: ChatGPT (model: GPT-4.1), date: 2025‑10‑24
Scope: Generated some functions of the WebSocket and asked for explanations of the WebSocket.
Author review: I validated correctness of the functions, removed unnecessary code, and modified the code to fit the requirements.
*/

import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { WebSocketServer } from "ws";
import { setupWSConnection } from "@y/websocket-server/utils";
import { KafkaClient, type KafkaConfig } from "./kafka/client.js";
import { checkSessionAndUsers } from "./sessions.js";
import { addActiveRoom, disconnectSocketFromRoom, getActiveRoom } from "./rooms.js";
import rooms from "./routes/room.js";
import sessions from "./routes/sessions.js";
import { cors } from 'hono/cors'
import { logger } from "hono/logger";


declare module "ws" {
  interface WebSocket {
    userId: string;
    sessionId: string;
  }
}

const wss = new WebSocketServer({ noServer: true });
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "5004", 10);
const kafkaConfig: KafkaConfig = {
  clientId: "collab-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
  retry: { initialRetryTime: 300, retries: 10 },
};

console.log("Collab-service starting...");
const app = new Hono();

// Enable CORS for all routes
app.use(cors({
  origin: ["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:80", "http://localhost:80"], 
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  exposeHeaders: ["Content-Length", "Set-Cookie"],
  maxAge: 600,
  credentials: true
}))
app.use(logger());

// ------------------- Hono Routes ------------------ //
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route("/rooms", rooms);
app.route("/sessions", sessions);

// ------------------- WebSocket & HTTP Server Setup ------------------ //
const server = serve(
  {
    fetch: app.fetch,
    hostname: host,
    port: port,
  },
  (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  }
);

// ------------------- WebSocket Connections ------------------ //
wss.on("connection", (ws, request) => {

  setupWSConnection(ws, request, {docName: ws.sessionId});

  ws.on('error', console.error);
  
  ws.on('message', () => {
    const room = getActiveRoom(ws.sessionId);
    console.log('users', Array.from(room?.keys() || []));
  });

  ws.on("close", () => {
    // Clean up when user disconnects
    console.log(`User ${ ws.userId } disconnected from session ${ ws.sessionId }`);
    disconnectSocketFromRoom(ws.sessionId, ws.userId, ws as any); // Clean up user from active rooms after disconnect
    console.log('Current active users after disconnect:', Array.from(getActiveRoom(ws.sessionId)?.keys() || []));
  });
});

server.on("upgrade", (request, socket, head) => {
  console.log("Upgrade request received, Host:", request.headers.host, "URL:", request.url);
  const url = new URL(request.url || "", `http://${request.headers.host}`);
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
  wss.handleUpgrade(request, socket, head, ws => {
    ws.userId = userId;
    ws.sessionId = collabSessionId;
    addActiveRoom(ws.sessionId, ws.userId, ws as any);

    wss.emit('connection', ws, request);
  });
});


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
  }

  process.exit(code);
}

// Handles exit signals - Termination, Interrupt
process.on('SIGTERM', () => shutdown());
process.on('SIGINT', () => shutdown());
