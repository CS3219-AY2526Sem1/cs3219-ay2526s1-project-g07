import { Kafka, type Producer } from 'kafkajs';

export class MatchingServiceProducer {
  producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'matching-service',
      brokers: ['localhost:9094']
    });
    this.producer = kafka.producer();
  }

  async init() {
    await this.connect();
  }

  private async connect() {
    await this.producer.connect();
    console.log('Matching service producer connected to Kafka');
  }

  async produceMatchingSuccess(userId: string, peerId: string, sessionId: string) {
    await this.send({
      topic: 'matching-success',
      messages: [ { value: JSON.stringify({ userId, peerId, sessionId }) }]
    });
    console.log(`Produced matching success for userId: ${userId}, peerId: ${peerId}, sessionId: ${sessionId}`);
  }

  async send({ topic, messages }: { topic: string; messages: { value: string }[] }) {
    await this.producer.send({ topic, messages });
  }
}
