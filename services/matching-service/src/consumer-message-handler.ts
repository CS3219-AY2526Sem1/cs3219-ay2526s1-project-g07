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
    const { eventType, data, eventId } = JSON.parse(value);
    console.log(`Processing collaboration session ready: ${data.userIdOne}, ${data.userIdTwo}, ${data.collabSessionId}`);
    this.webSocket?.emitCollabSessionReady(data.userIdOne, data.userIdTwo, data.collabSessionId);
  }

  protected processUnknownTopic(value: string) {
    console.log(`Processing unknown topic message: ${value}`);
  }
}
