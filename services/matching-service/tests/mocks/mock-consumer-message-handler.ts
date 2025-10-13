import type { KafkaMessage } from "kafkajs";
import { MockMatcher } from "./mock-matcher.ts";
import { ConsumerMessageHandler } from "../../src/consumer-message-handler.ts";
import { TOPICS_MATCHING } from "../../src/utils.ts";

export class MockConsumerMessageHandler extends ConsumerMessageHandler {
  constructor(matcher: MockMatcher) {
    super(matcher);
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

  protected override processMatchingSuccess(value: string) {
    return; // No-op for testing
  }

  protected override processUnknownTopic(value: string) {
    return; // No-op for testing
  }
}
