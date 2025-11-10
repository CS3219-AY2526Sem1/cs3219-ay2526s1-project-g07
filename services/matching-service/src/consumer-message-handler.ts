import type { KafkaMessage } from "kafkajs";
import { Matcher } from "./matcher";
import { TOPICS_MATCHING } from "../../../shared/kafka-topics";
import { MatchingWS } from "./matching-ws";

export class ConsumerMessageHandler {
  matcher: Matcher;
  webSocket: MatchingWS;

  constructor(matcher: Matcher, webSocket: MatchingWS) {
    this.matcher = matcher;
    this.webSocket = webSocket;
  }

  handleMessage(message: KafkaMessage, topic: string) {
    switch (topic) {
      case TOPICS_MATCHING.COLLAB_SESSION_READY:
        this.processCollabSessionReady(message);
        break;

      default:
        this.processUnknownTopic(message);
        break;
    }
  }

  protected processCollabSessionReady(message: KafkaMessage) {
    try {
      if (!message.value) {
        console.error(`Received empty message for collab session ready: ${message}`);
        return;
      }

      const collabSessionReadyEvent = JSON.parse(message.value?.toString() || '');
      const { collabSessionId, userIdOne, userIdTwo } = collabSessionReadyEvent.data;

      console.log(`Processing collaboration session ready: ${userIdOne}, ${userIdTwo}, ${collabSessionId}`);

      this.webSocket?.emitCollabSessionReady(userIdOne, userIdTwo, collabSessionId);

      // Clean up
      this.matcher.dequeue({ id: userIdOne });
      this.matcher.dequeue({ id: userIdTwo });
    } catch (err) {
      console.error(`Failed to process collab session ready message:`, message, err);
    }
  }

  protected processUnknownTopic(message: KafkaMessage) {
    console.log(`Processing unknown topic message: ${message.value?.toString() || ''}`);
  }
}
