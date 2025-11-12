"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingServiceConsumer = void 0;
const kafka_topics_1 = require("../../../shared/kafka-topics");
class MatchingServiceConsumer {
    constructor(kafka, messageHandler) {
        this.topics = [kafka_topics_1.TOPICS_MATCHING.COLLAB_SESSION_READY];
        this.consumer = kafka.consumer({ groupId: 'matching-group' });
        this.messageHandler = messageHandler;
    }
    async init() {
        await this.connectAndSubscribe();
        await this.run();
    }
    async connectAndSubscribe() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topics: this.topics, fromBeginning: true });
        console.log('Matching service consumer connected to Kafka');
    }
    async run() {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                await this.messageHandler.handleMessage(message, topic);
            }
        });
    }
}
exports.MatchingServiceConsumer = MatchingServiceConsumer;
