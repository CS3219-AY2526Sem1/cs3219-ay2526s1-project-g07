import { Kafka, type Consumer } from 'kafkajs';
import { TOPICS_MATCHING } from '../../../shared/kafka-topics';
import { ConsumerMessageHandler } from './consumer-message-handler';

export class MatchingServiceConsumer {
  consumer: Consumer;
  messageHandler: ConsumerMessageHandler;
  topics: string[] = [TOPICS_MATCHING.MATCHING_SUCCESS];

  constructor(kafka: Kafka, messageHandler: ConsumerMessageHandler) {
    this.consumer = kafka.consumer({ groupId: 'matching-group' });
    this.messageHandler = messageHandler;
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
            this.messageHandler.handleMessage(message, topic);
          }
        });
  }
}
