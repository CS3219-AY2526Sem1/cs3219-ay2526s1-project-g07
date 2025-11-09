import { Hono } from "hono";
import { removeActiveRoom } from "../rooms.js";

const app = new Hono();

app.delete("/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const { userId } = await c.req.json();

  removeActiveRoom(sessionId, userId);
  return c.json({ message: `User ${userId} removed from room with sessionId: ${sessionId}` });
});


export default app;