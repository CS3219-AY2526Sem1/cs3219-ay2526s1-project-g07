import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Kafka } from 'kafkajs';
import type { Request, Response, NextFunction } from 'express';
import { API_ENDPOINTS_MATCHING } from '../../../shared/api-endpoints.ts';
import { MatchingServiceProducer } from './matching-service-producer.ts';
import { MatchingServiceConsumer } from './matching-service-consumer.ts';
import { Matcher } from './matcher.ts';
import { ConsumerMessageHandler } from './consumer-message-handler.ts';
import { MatchingWS } from './matching-ws.ts';
import { RedisClient } from '../../../redis/client.ts';
import { type RedisClientType } from 'redis';
import type { UserMatchingRequest, UserMatchingCancelRequest } from '../../../shared/types/matching-types.ts';

const app = express();
const httpServer = createServer(app);

dotenv.config();
const HOST_URL = process.env.HOST_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 4000;
const REDIS_DB_INDEX = process.env.REDIS_DATABASE_INDEX_MATCHING_SERVICE
  ? parseInt(process.env.REDIS_DATABASE_INDEX_MATCHING_SERVICE)
  : 0;

async function main() {
  // --- Middleware ---
  app.use(cors({
    origin: "*",
  }))

  app.use(express.json());

  const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9094']
  });

  // --- Core Components ---
  const redisClient = await RedisClient.createClient(REDIS_DB_INDEX) as RedisClientType;

  const matcher = new Matcher(redisClient);
  const messageHandler = new ConsumerMessageHandler(matcher);
  const producer = new MatchingServiceProducer(kafka, matcher);
  const consumer = new MatchingServiceConsumer(kafka, messageHandler);

  // --- Websocket & Kafka Connections ---
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const ws = new MatchingWS(io, matcher);
  const connectToWebSocket = () => {
    try {
      ws.init();
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json(err.message);
  })

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
    
    connectToWebSocket();
    console.log('WebSocket server is ready for connections');
  });

  httpServer.on('close', async () => {
    await redisClient.quit();
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 Caught SIGINT. Shutting down...');
    await redisClient.quit();
    httpServer.close(() => process.exit(0));
  });

  process.on('SIGTERM', async () => {
    await redisClient.quit();
    httpServer.close(() => process.exit(0));
  });

  // --- API Endpoints ---
  app.post(API_ENDPOINTS_MATCHING.MATCHING_REQUEST, async (req: Request, res: Response) => {
    const matchingRequest = req.body as UserMatchingRequest;
    console.log(`Received matching request for user id: ${matchingRequest.userId.id}`);
    
    matcher.enqueue(matchingRequest.userId, matchingRequest.preferences);

    return res.status(200).send({ message: `Matching service received session id: ${matchingRequest.userId.id}` });
  });

  app.post(API_ENDPOINTS_MATCHING.MATCHING_CANCEL, async (req: Request, res: Response) => {
    const { userId } = req.body as UserMatchingCancelRequest;
    console.log(`Received matching cancel request for user id: ${userId.id}`);

    matcher.dequeue(userId);

    return res.status(200).send({ message: `Matching service cancelled matching for user id: ${userId.id}` });
  });

  // --- Error Handling Middleware ---
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err);
    res.status(500).send({ error: 'An unexpected error occurred.' });
  });

  app.listen(PORT, () => {
    console.log(`✅ Matching Service API is running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start matching service:', err);
  process.exit(1);
});
