import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from "hono/logger";
import questionController from './controllers/questionController.js'
import { startKafkaServices } from './kafka/index.js'

const app = new Hono()
app.use(logger());

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:80', 'http://127.0.0.1:80', 'http://localhost:3000', 'http://127.0.0.1:3000', "https://pp.kirara.dev"],
  credentials: true,
}))

// Health check route
app.get('/', (c) => {
  return c.json({ message: 'Question Service is running!' })
})

// Question routes
app.route('/api/questions', questionController)

const port = parseInt(process.env.PORT || '5001')

// Start HTTP server
serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`✅ Question service running on http://localhost:${info.port}`)
})

// Start Kafka services
startKafkaServices().catch((error) => {
  console.error('❌ Failed to start Kafka services:', error)
  process.exit(1)
})
