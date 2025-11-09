import { Hono } from "hono";
import { removeActiveRoom } from "../rooms.js";

const app = new Hono();

app.get("/:sessionId/:userId", (c) => {
  const sessionId = c.req.param("sessionId");
  const userId = c.req.param("userId");
  
  removeActiveRoom(sessionId, userId);
  return c.json({ message: `User ${userId} removed from room with sessionId: ${sessionId}` });
});


export default app;