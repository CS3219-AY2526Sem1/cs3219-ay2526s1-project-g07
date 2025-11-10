"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingServiceProducer = void 0;
const matcher_1 = require("./matcher");
const kafka_topics_1 = require("../../../shared/kafka-topics");
class MatchingServiceProducer {
    constructor(kafka, matcher) {
        this.producer = kafka.producer();
        this.matcher = matcher;
        this.subscribe();
    }
    async init() {
        await this.connect();
    }
    async connect() {
        await this.producer.connect();
        console.log('Matching service producer connected to Kafka');
    }
    subscribe() {
        // Listen for match found events from the matcher
        this.matcher.emitter.on(matcher_1.MatcherEvents.EVENT_MATCH_FOUND, async (match) => this.handleMatchFound(match));
    }
    async handleMatchFound(match) {
        const { firstUserId, secondUserId, preferences } = match;
        await this.produceMatchingSuccess(firstUserId.id, secondUserId.id, preferences);
    }
    async produceMatchingSuccess(userId, peerId, preferences) {
        await this.send({
            topic: kafka_topics_1.TOPICS_MATCHING.MATCHING_SUCCESS,
            messages: [{ value: JSON.stringify({ userId, peerId, preferences }) }]
        });
        console.log(`Produced matching success for userId: ${JSON.stringify(userId)}, peerId: ${JSON.stringify(peerId)}`);
    }
    async send({ topic, messages }) {
        await this.producer.send({ topic, messages });
    }
}
exports.MatchingServiceProducer = MatchingServiceProducer;
