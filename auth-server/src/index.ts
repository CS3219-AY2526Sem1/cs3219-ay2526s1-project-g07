import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { auth } from "./lib/auth"; 
import { cors } from "hono/cors";
import type { Context } from "hono";
import route from './routes/routes'

const app = new Hono()

app.get('/', (c: Context) => c.text('Hello Hono!'))

// Enable CORS for all routes
app.use(cors({
  origin: ["http://localhost:3000"], 
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true
}))

// On Request, in Route, use Auth Handler
app.on(["POST", "GET"], "/api/auth/**", (c: Context) => {
  console.log(`${c.req.method} request to ${c.req.url}`);
  return auth.handler(c.req.raw);
});

app.route("/", route);

serve({
  fetch: app.fetch,
  port: 5000
}, (info: { address: string; port: number }) => {
  console.log(`🚀 Server running at http://localhost:${info.port}`)
})

