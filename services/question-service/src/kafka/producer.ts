import { Kafka } from 'kafkajs';
import type { Producer, ProducerRecord } from 'kafkajs';
import type { QuestionSuccessMessage, QuestionErrorMessage } from './types.js';

export class QuestionProducer {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor(brokers: string[] = ['localhost:9094']) {
    this.kafka = new Kafka({
      clientId: 'question-service-producer',
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Question Producer connected to Kafka');
    } catch (error) {
      console.error('❌ Failed to connect Question Producer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('Question Producer disconnected from Kafka');
    } catch (error) {
      console.error('Error disconnecting Question Producer:', error);
      throw error;
    }
  }

  async sendQuestionSuccess(message: QuestionSuccessMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Producer is not connected. Call connect() first.');
    }

    const record: ProducerRecord = {
      topic: 'question-success',
      messages: [
        {
          key: message.userId,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        }
      ]
    };

    try {
      await this.producer.send(record);
      console.log(`✅ Sent question success for users: ${message.userId} & ${message.peerId}`);
    } catch (error) {
      console.error('❌ Failed to send question success message:', error);
      throw error;
    }
  }

  async sendQuestionError(message: QuestionErrorMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Producer is not connected. Call connect() first.');
    }

    const record: ProducerRecord = {
      topic: 'question-success', // Using same topic for errors, can be changed if needed
      messages: [
        {
          key: message.userId,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        }
      ]
    };

    try {
      await this.producer.send(record);
      console.log(`⚠️ Sent question error for users: ${message.userId} & ${message.peerId}`);
    } catch (error) {
      console.error('❌ Failed to send question error message:', error);
      throw error;
    }
  }
}

export const questionProducer = new QuestionProducer();
