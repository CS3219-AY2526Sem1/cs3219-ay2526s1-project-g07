import { Hono } from "hono";
import { getSessionDetails } from "../sessions.js";

const app = new Hono();

// Get session question
app.get("/:sessionId/question", async (c) => {
  const sessionId = c.req.param("sessionId");

  const sessionDetails = getSessionDetails(sessionId);
  if (!sessionDetails) {
    return c.json({ message: `Session with sessionId: ${sessionId} not found` }, 404);
  }

  return c.json(sessionDetails.question);
});


export default app;