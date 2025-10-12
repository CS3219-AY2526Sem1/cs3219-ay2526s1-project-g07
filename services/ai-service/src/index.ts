import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import type { GoogleGenAI } from "@google/genai";
import { createMiddleware } from "hono/factory";
import { logger } from "hono/logger";
import aiRoute from "./routes/index.js";
import verifyApiKey from "./service/verifyApiKey.js";

const app = new Hono();
app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

async function init() {
  const ai = await verifyApiKey(process.env.GEMINI_API_KEY);

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
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
}

init();
