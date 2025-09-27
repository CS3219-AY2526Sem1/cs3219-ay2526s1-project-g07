import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import type { Request, Response, NextFunction } from 'express';
import { TOPICS_MATCHING, API_ENDPOINTS_MATCHING } from './utils.ts';
import { MatchingServiceProducer } from './matching-service-producer.ts';
import { MatchingServiceConsumer } from './matching-service-consumer.ts';
import { Matcher } from './matcher.ts';
import { ConsumerMessageHandler } from './consumer-message-handler.ts';

const app = express();

dotenv.config();
const HOST_URL = process.env.HOST_URL || 'http://localhost:3000';

app.use(cors({
  origin: HOST_URL
}))

app.use(express.json());

const kafka = new Kafka({
  clientId: 'matching-service',
  brokers: ['localhost:9094']
});

const matcher = new Matcher();
const messageHandler = new ConsumerMessageHandler(matcher);
const producer = new MatchingServiceProducer(kafka, matcher);
const consumer = new MatchingServiceConsumer(kafka, messageHandler);

const connectToKafka = async () => {
  try {
    await producer.init();
    await consumer.init();
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
  }
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json(err.message);
})

app.listen(4000, () => {
  connectToKafka();
  console.log('Matching service listening on port 4000');
});

// API endpoints
app.post(API_ENDPOINTS_MATCHING.MATCHING_REQUEST, async (req: Request, res: Response) => {
  const { userId, topic, difficulty } = req.body;
  console.log(`Received matching request for user id: ${userId}`);

  await producer.send({
    topic: TOPICS_MATCHING.MATCHING_REQUEST,
    messages: [ { value: JSON.stringify({ userId, topic, difficulty }) }]
  });

  return res.status(200).send({ message: `Matching service received session id: ${userId}` });
});
