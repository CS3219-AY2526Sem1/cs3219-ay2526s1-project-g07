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

  async handleMessage(message: KafkaMessage, topic: string) {
    switch (topic) {
      case TOPICS_MATCHING.COLLAB_SESSION_READY:
        await this.processCollabSessionReady(message);
        break;
      
      case TOPICS_MATCHING.QUESTION_FAILURE:
        await this.processQuestionFailure(message);
        break;

      default:
        this.processUnknownTopic(message);
        break;
    }
  }

  protected async processCollabSessionReady(message: KafkaMessage) {
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
      await this.matcher.dequeue({ id: userIdOne }, true, Matcher.REDIS_KEY_SUCCESSFUL_MATCHES);
      await this.matcher.dequeue({ id: userIdTwo }, true, Matcher.REDIS_KEY_SUCCESSFUL_MATCHES);
    } catch (err) {
      console.error(`Failed to process collab session ready message:`, message, err);
    }
  }

  protected async processQuestionFailure(message: KafkaMessage) {
    try {
      if (!message.value) {
        console.error(`Received empty message for question failure: ${message}`);
        return;
      }

      const questionFailureEvent = JSON.parse(message.value?.toString() || '');
      const { userId, peerId, error } = questionFailureEvent;
      console.log(`Processing question failure for user ${userId} & peer ${peerId} due to ${error}`);
      this.webSocket?.emitQuestionFailure(userId, error);
      this.webSocket?.emitQuestionFailure(peerId, error);

      // Clean up
      await this.matcher.dequeue({ id: userId }, true, Matcher.REDIS_KEY_SUCCESSFUL_MATCHES);
      await this.matcher.dequeue({ id: peerId }, true, Matcher.REDIS_KEY_SUCCESSFUL_MATCHES);
    } catch (err) {
      console.error(`Failed to process question failure message:`, message, err);
    }
  }

  protected processUnknownTopic(message: KafkaMessage) {
    console.log(`Processing unknown topic message: ${message.value?.toString() || ''}`);
  }
}
