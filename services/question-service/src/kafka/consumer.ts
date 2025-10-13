import { Kafka } from 'kafkajs';
import type { Consumer, EachMessagePayload } from 'kafkajs';
import type { QuestionRequestMessage } from './types.js';

export class QuestionConsumer {
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected: boolean = false;
  private messageHandler: ((message: QuestionRequestMessage) => Promise<void>) | null = null;

  constructor(brokers: string[] = ['localhost:9094']) {
    this.kafka = new Kafka({
      clientId: 'question-service-consumer',
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.consumer = this.kafka.consumer({
      groupId: 'question-service-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.consumer.connect();
      this.isConnected = true;
      console.log('✅ Question Consumer connected to Kafka');
    } catch (error) {
      console.error('❌ Failed to connect Question Consumer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('Question Consumer disconnected from Kafka');
    } catch (error) {
      console.error('Error disconnecting Question Consumer:', error);
      throw error;
    }
  }

  setMessageHandler(handler: (message: QuestionRequestMessage) => Promise<void>): void {
    this.messageHandler = handler;
  }

  async subscribe(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Consumer is not connected. Call connect() first.');
    }

    try {
      await this.consumer.subscribe({
        topic: 'question-request',
        fromBeginning: false
      });
      console.log('✅ Subscribed to question-request topic');
    } catch (error) {
      console.error('❌ Failed to subscribe to question-request topic:', error);
      throw error;
    }
  }

  async startConsuming(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Consumer is not connected. Call connect() first.');
    }

    if (!this.messageHandler) {
      throw new Error('Message handler is not set. Call setMessageHandler() first.');
    }

    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const { topic, partition, message } = payload;

          if (!message.value) {
            console.warn('⚠️ Received message with no value');
            return;
          }

          try {
            const messageValue = message.value.toString();
            const parsedMessage: QuestionRequestMessage = JSON.parse(messageValue);

            console.log(`📥 Received question request:`, {
              requestId: parsedMessage.requestId,
              difficulty: parsedMessage.difficulty,
              categories: parsedMessage.categories,
              topic,
              partition,
              offset: message.offset
            });

            if (this.messageHandler) {
              await this.messageHandler(parsedMessage);
            }
          } catch (error) {
            console.error('❌ Error processing message:', error);
            console.error('Message value:', message.value.toString());
          }
        }
      });

      console.log('✅ Question Consumer started consuming messages');
    } catch (error) {
      console.error('❌ Failed to start consuming messages:', error);
      throw error;
    }
  }

  async start(handler: (message: QuestionRequestMessage) => Promise<void>): Promise<void> {
    this.setMessageHandler(handler);
    await this.connect();
    await this.subscribe();
    await this.startConsuming();
  }
}

export const questionConsumer = new QuestionConsumer();
