import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Kafka } from 'kafkajs';
import type { Request, Response, NextFunction } from 'express';
import { API_ENDPOINTS_MATCHING } from './utils.ts';
import { MatchingServiceProducer } from './matching-service-producer.ts';
import { MatchingServiceConsumer } from './matching-service-consumer.ts';
import { Matcher } from './matcher.ts';
import { ConsumerMessageHandler } from './consumer-message-handler.ts';
import { MatchingWS } from './matching-ws.ts';
import { RedisClient } from './redis/client.ts';
import Redis from 'redis';

const app = express();
const httpServer = createServer(app);

dotenv.config();
const HOST_URL = process.env.HOST_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 4000;
const WS_PORT = process.env.WS_PORT || 'http://localhost:5000';

async function main() {
  // --- Middleware ---
  app.use(cors({
    origin: HOST_URL
  }))

  app.use(express.json());

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json(err.message);
  });

  const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9094']
  });

  // --- Core Components ---
  const redisClient = await RedisClient.createClient() as Redis.RedisClientType;

  const matcher = new Matcher(redisClient);
  const messageHandler = new ConsumerMessageHandler(matcher);
  const producer = new MatchingServiceProducer(kafka, matcher);
  const consumer = new MatchingServiceConsumer(kafka, messageHandler);

  // --- Websocket & Kafka Connections ---
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: WS_PORT,
      methods: ["GET", "POST"]
    }
  });

  const ws = new MatchingWS(io, matcher);
  try {
    ws.init();
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
  }

  const connectToKafka = async () => {
    try {
      await producer.init();
      await consumer.init();
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
    }
  };

  // --- Server & Process Related Logic ---
  httpServer.listen(PORT, () => {
    connectToKafka();
    console.log(`Matching service listening on port ${PORT}`);
    console.log('WebSocket server is ready for connections');
  });

  httpServer.on('close', async () => {
    await RedisClient.quit();
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 Caught SIGINT. Shutting down...');
    await RedisClient.quit();
    httpServer.close(() => process.exit(0));
  });

  process.on('SIGTERM', async () => {
    await RedisClient.quit();
    httpServer.close(() => process.exit(0));
  });

  // --- API Endpoints ---
  app.post(API_ENDPOINTS_MATCHING.MATCHING_REQUEST, async (req: Request, res: Response) => {
    const { userId, topic, difficulty } = req.body;
    console.log(`Received matching request for user id: ${userId}`);

    matcher.enqueue(userId, { topic, difficulty });

    return res.status(200).send({ message: `Matching service received session id: ${userId}` });
  });

  app.post(API_ENDPOINTS_MATCHING.MATCHING_CANCEL, async (req: Request, res: Response) => {
    const { userId } = req.body;
    console.log(`Received matching cancel request for user id: ${userId}`);

    matcher.dequeue(userId);

    return res.status(200).send({ message: `Matching service cancelled matching for user id: ${userId}` });
  });
}

main().catch((err) => {
  console.error('Failed to start matching service:', err);
  process.exit(1);
});
