import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import verifyApiKey from "./service/verifyApiKey.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

async function init() {
  await verifyApiKey(process.env.GEMINI_API_KEY);

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
