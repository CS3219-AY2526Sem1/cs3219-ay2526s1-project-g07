import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import questionController from './controllers/questionController.js'

const app = new Hono()

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}))

// Health check route
app.get('/', (c) => {
  return c.json({ message: 'Question Service is running!' })
})

// Question routes
app.route('/api/question', questionController)

const port = parseInt(process.env.PORT || '5001')

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Question service running on http://localhost:${info.port}`)
})
