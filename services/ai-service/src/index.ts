import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import type { GoogleGenAI } from "@google/genai";
import { createMiddleware } from "hono/factory";
import { logger } from "hono/logger";
import aiRoute from "./routes/index.js";
import verifyApiKey from "./service/verifyApiKey.js";
import { KafkaClient, type KafkaConfig } from "./kafka/client.js";


const kafkaConfig: KafkaConfig = {
  clientId: "ai-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
  retry: { initialRetryTime: 300, retries: 10 },
};

export const kafkaClient = new KafkaClient(kafkaConfig);
const app = new Hono();
app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

async function init() {
  const ai = await verifyApiKey(process.env.GEMINI_API_KEY);
  
  try {
    await kafkaClient.connect();
  } catch (error) {
    console.error("Failed to connect to Kafka, process exiting...");
    process.exit(1); // Kafka is required for this service to retrieve questions as input to the AI model
  }

  // Pass the AI client to routes via middleware
  const aiMiddleware = createMiddleware<{
    Variables: {
      ai: GoogleGenAI;
    };
  }>(async (c, next) => {
    c.set("ai", ai);
    await next();
  });
  app.use("/api/ai/*", aiMiddleware);

  app.route("/api/ai", aiRoute);

  serve(
    {
      fetch: app.fetch,
      hostname: process.env.HOST || "127.0.0.1",
      port: parseInt(process.env.PORT || "5005", 10),
    },
    (info) => {
      console.log(`Server is running on http://${info.address}:${info.port}`);
    }
  );
}

init();
