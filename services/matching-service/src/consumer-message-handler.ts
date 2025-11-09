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
    const value = message.value?.toString() || '';
    switch (topic) {
      case TOPICS_MATCHING.COLLAB_SESSION_READY:
        this.processCollabSessionReady(value);
        break;

      default:
        this.processUnknownTopic(value);
        break;
    }
  }

  protected processCollabSessionReady(value: string) {
    const { sessionId, userId, peerId } = JSON.parse(value);
    console.log(`Processing collaboration session ready: ${userId}, ${peerId}, ${sessionId}`);
    this.webSocket.emitCollabSessionReady(userId, peerId, sessionId);
  }

  protected processUnknownTopic(value: string) {
    console.log(`Processing unknown topic message: ${value}`);
  }
}
