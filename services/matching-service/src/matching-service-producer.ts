import { Kafka, type Producer } from 'kafkajs';
import { Matcher } from './matcher.ts';
import { TOPICS_MATCHING } from './utils.ts';
import type { MatchPreference, MatchResult } from './types.ts';

export class MatchingServiceProducer {
  producer: Producer;
  matcher: Matcher;

  constructor(kafka: Kafka, matcher: Matcher) {
    this.producer = kafka.producer();
    this.matcher = matcher;

    this.subscribe();
  }

  async init() {
    await this.connect();
  }

  private async connect() {
    await this.producer.connect();
    console.log('Matching service producer connected to Kafka');
  }

  private subscribe() {
    // Listen for match found events from the matcher
    this.matcher.emitter.on('matchFound', async (match) => this.handleMatchFound(match));
  }

  private async handleMatchFound(match: MatchResult) {
    const { firstUserId, secondUserId, preferences } = match;
    await this.produceMatchingSuccess(firstUserId.toString(), secondUserId.toString(), preferences);
  }

  private async produceMatchingSuccess(userId: string, peerId: string, preferences: MatchPreference) {
    await this.send({
      topic: TOPICS_MATCHING.MATCHING_SUCCESS,
      messages: [ { value: JSON.stringify({ userId, peerId, preferences }) }]
    });
    console.log(`Produced matching success for userId: ${userId}, peerId: ${peerId}`);
  }

  async send({ topic, messages }: { topic: string; messages: { value: string }[] }) {
    await this.producer.send({ topic, messages });
  }
}
