import type { KafkaMessage } from "kafkajs";
import { Matcher } from "./matcher.ts";
import { TOPICS_MATCHING } from "../../../shared/kafka-topics.ts";

export class ConsumerMessageHandler {
  matcher: Matcher;

  constructor(matcher: Matcher) {
    this.matcher = matcher;
  }

  handleMessage(message: KafkaMessage, topic: string) {
    const value = message.value?.toString() || '';
    switch (topic) {
      case TOPICS_MATCHING.MATCHING_SUCCESS:
        this.processMatchingSuccess(value);
        break;

      default:
        this.processUnknownTopic(value);
        break;
    }
  }

  protected processMatchingSuccess(value: string) {
    const { userId, peerId, sessionId } = JSON.parse(value);
    console.log(`Processing matching success: ${userId}, ${peerId}, ${sessionId}`);
    // TODO: Implement logic to handle successful matching internally if needed

  }

  protected processUnknownTopic(value: string) {
    console.log(`Processing unknown topic message: ${value}`);
  }
}
