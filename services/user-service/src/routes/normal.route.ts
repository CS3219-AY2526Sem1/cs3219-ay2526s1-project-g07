import { Hono } from "hono";
import type { Context } from "hono";

const normalRouter = new Hono();

normalRouter.get("/", (c: Context) => {
    return c.json({ message: "This is non-protected content" });
});

export default normalRouter;
