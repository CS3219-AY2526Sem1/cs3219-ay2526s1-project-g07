import type { KafkaMessage } from "kafkajs";

export class ConsumerMessageHandler {
  static handleMessage(message: KafkaMessage, topic: string) {
    const value = message.value?.toString() || '';
    switch (topic) {
      case 'matching-request':
        this.processMatchingRequest(value);
        break;

      case 'matching-success':
        this.processMatchingSuccess(value);
        break;

      default:
        console.log(`Received message on unknown topic ${topic}: ${message.value?.toString()}`);
    }
  }

  private static processMatchingRequest(value: string) {
    console.log(`Processing matching request: ${value}`);
  }

  private static processMatchingSuccess(value: string) {
    console.log(`Processing matching success: ${value}`);
  }
}
