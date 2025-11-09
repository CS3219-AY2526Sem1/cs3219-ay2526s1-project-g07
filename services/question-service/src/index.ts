import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import questionController from './controllers/questionController.js'
import { KafkaClient } from './kafka/client.js'
import { handleMatchingSuccess } from './kafka/messageHandler.js'
import 'dotenv/config'

const app = new Hono()

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:80', 'http://127.0.0.1:80', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}))

// Health check route
app.get('/', (c) => {
  return c.json({ message: 'Question Service is running!' })
})

// Question routes
app.route('/api/questions', questionController)

const port = parseInt(process.env.PORT || '5001')

const kafkaConfig = {
  clientId: "question-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
  retry: { initialRetryTime: 300, retries: 10 },
};

// Initialize and start server
const startServer = async () => {
  let kafkaClient: KafkaClient | null = null;

  try {
    // Start the HTTP server
    serve({
      fetch: app.fetch,
      port: port
    }, (info) => {
      console.log(`🚀 Question service running on http://localhost:${info.port}`)
    });

    // Set up Kafka client
    kafkaClient = new KafkaClient(kafkaConfig);
    await kafkaClient.connect();
    
    // Set up message handler and start consuming
    const consumer = kafkaClient.getConsumer();
    consumer.setMessageHandler(handleMatchingSuccess);
    await consumer.startConsuming();
    console.log('✅ Kafka consumer started and listening for matching success messages');

    // Disconnect Kafka client on server close
    process.on("SIGINT", async () => {
      console.log("SIGINT received: closing HTTP server");
      try {
        if (kafkaClient) {
          console.log("Disconnecting Kafka client...");
          await kafkaClient.disconnect();
        }
      } catch (err) {
        console.error("Error during Kafka client disconnection:", err);
        process.exit(1);
      }
      
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
