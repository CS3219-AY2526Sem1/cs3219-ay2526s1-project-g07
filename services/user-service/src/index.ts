import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Context } from "hono";
import route from './routes/routes'
import { KafkaClient } from './kafka/client';

const app = new Hono()
app.use(logger());

app.get('/', (c: Context) => c.text('Hello Hono!'))

const kafkaConfig = {
  clientId: "user-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
  retry: { initialRetryTime: 300, retries: 10 },
};

// Enable CORS for all routes
app.use(cors({
  origin: ["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:80", "http://localhost:80"],
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  exposeHeaders: ["Content-Length", "Set-Cookie"],
  maxAge: 600,
  credentials: true
}))

// On Request, in Route, use Auth Handler
app.on(["POST", "GET"], "/api/user/auth/**", (c: Context) => {
  console.log(`${c.req.method} request to ${c.req.url}`);
  return auth.handler(c.req.raw);
});

// Add OPTIONS method support for CORS preflight
app.options("/api/user/auth/**", (c: Context) => {
  return new Response(null, { status: 200 });
});

app.route("/api/user/", route);

// Initialize database and start server
const startServer = async () => {
  let kafkaClient: KafkaClient | null = null;

  try {
    // Initialize database first
    // Start the server
    serve({
      fetch: app.fetch,
      port: 5002
    }, (info: { address: string; port: number }) => {
      console.log(`🚀 Server running at http://localhost:${info.port}`)
    });

    //Set up Kafka client
    kafkaClient = new KafkaClient(kafkaConfig);
    await kafkaClient.connect();

    // Disconnect Kafka client on server close
    process.on("SIGINT", async () => {
      console.log("SIGINT received: closing HTTP server");
      try {
        if (kafkaClient) {
          console.log("Disconnecting Kafka client...");
          await kafkaClient.disconnect();
        }
      } catch (err) {
        console.error("Error during Kafka client disconnection:", err);
        process.exit(1);
      }

      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
