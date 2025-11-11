// AI Assistance Disclosure:
// Tool: GitHub Copilot (model: GPT-5), date: 2025-11-11
// Scope: Requested for assistance to integrate kafka to the API logic to retrieve data from other services
// Author review: I have tested the endpoint with a curl request and is working as intended.

import type { GoogleGenAI } from "@google/genai";
import { Hono } from "hono";
import debugCode from "../service/debugCode.js";
import getHint from "../service/getHint.js";
import { kafkaClient } from "../index.js";

declare module "hono" {
  interface ContextVariableMap {
    ai: GoogleGenAI;
  }
}

const app = new Hono();

app.post("/hint", async (c) => {
  const body = await c.req.json();

  const { collabSessionId, userId } = body;
  console.log("Hint request body:", body);
  if (!collabSessionId || !userId) {
    return c.text("Missing collabSessionId or userId", 400);
  }

  const ai = c.var.ai;
  if (!ai) {
    return c.text("AI client not initialized", 500);
  }

  console.log(`Received hint request from ${userId} in ${collabSessionId}`);

  let response = null;
  try {
    response = await kafkaClient.retrieveQuestionDetails(collabSessionId, userId);

    console.log("Retrieved question details:", response);

    if (response === null) {
      console.error("Question details is null");
    }

  } catch (err) {
    console.error("Error:", err);
    return c.text("Error retrieving question details", 500);
  }
  
  if (!response || !response.question) {
    return c.text("Failed to retrieve question details", 500);
  }

  const questionDetails = response.question || "";

  try {
    const hint = await getHint(ai, questionDetails);
    if (!hint) {
      return c.text("Failed to get hint from AI", 500);
    }

    console.log("Sending hint response:", hint);
    return c.text(hint);
  } catch (err) {
    console.error("Error getting hint from AI:", err);
    return c.text("Error getting hint from AI", 500);
  }
});

app.post("/debug", async (c) => {
  const body = await c.req.json();
  const { question, code, output } = body;
  const ai = c.var.ai;
  if (!ai) {
    return c.text("AI client not initialized", 500);
  }
  console.log("Received question:", question);
  console.log("Received code:", code);
  console.log("Received output:", output);
  const hint = await debugCode(ai, question, code, output);
  if (!hint) {
    return c.text("Failed to get hint from AI", 500);
  }
  console.log("Sending hint response:", hint);
  return c.text(hint);
});

export default app;
