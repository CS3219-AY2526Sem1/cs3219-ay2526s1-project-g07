import type { GoogleGenAI } from "@google/genai";
import { Hono } from "hono";
import getHint from "../service/getHint.js";

declare module "hono" {
  interface ContextVariableMap {
    ai: GoogleGenAI;
  }
}

const app = new Hono();

app.post("/hint", async (c) => {
  const body = await c.req.json();
  const { question } = body;
  const ai = c.var.ai;
  if (!ai) {
    return c.text("AI client not initialized", 500);
  }
  console.log("Received question:", question);
  const hint = await getHint(ai, question);
  if (!hint) {
    return c.text("Failed to get hint from AI", 500);
  }
  console.log("Sending hint response:", hint);
  return c.text(hint);
});

export default app;
