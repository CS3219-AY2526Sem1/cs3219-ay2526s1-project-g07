import { Kafka, type Consumer } from 'kafkajs';
import { TOPICS } from './utils.ts';
import { ConsumerMessageHandler } from './consumer-message-handler.ts';

export class MatchingServiceConsumer {
  consumer: Consumer;
  topics: string[] = [TOPICS.MATCHING_REQUEST, TOPICS.MATCHING_SUCCESS];

  constructor() {
    const kafka = new Kafka({
      clientId: 'matching-service',
      brokers: ['localhost:9094']
    });
    this.consumer = kafka.consumer({ groupId: 'matching-group' });
  }

  async init() {
    await this.connectAndSubscribe();
    await this.run();
  }

  private async connectAndSubscribe() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: this.topics, fromBeginning: true });
    console.log('Matching service consumer connected to Kafka');
  }

  private async run() {
    await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            ConsumerMessageHandler.handleMessage(message, topic);
          }
        });
  }
}
