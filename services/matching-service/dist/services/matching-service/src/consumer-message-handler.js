"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerMessageHandler = void 0;
const matcher_1 = require("./matcher");
const kafka_topics_1 = require("../../../shared/kafka-topics");
class ConsumerMessageHandler {
    constructor(matcher, webSocket) {
        this.matcher = matcher;
        this.webSocket = webSocket;
    }
    async handleMessage(message, topic) {
        switch (topic) {
            case kafka_topics_1.TOPICS_MATCHING.COLLAB_SESSION_READY:
                await this.processCollabSessionReady(message);
                break;
            default:
                this.processUnknownTopic(message);
                break;
        }
    }
    async processCollabSessionReady(message) {
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
            await this.matcher.dequeue({ id: userIdOne }, true, matcher_1.Matcher.REDIS_KEY_SUCCESSFUL_MATCHES);
            await this.matcher.dequeue({ id: userIdTwo }, true, matcher_1.Matcher.REDIS_KEY_SUCCESSFUL_MATCHES);
        }
        catch (err) {
            console.error(`Failed to process collab session ready message:`, message, err);
        }
    }
    processUnknownTopic(message) {
        console.log(`Processing unknown topic message: ${message.value?.toString() || ''}`);
    }
}
exports.ConsumerMessageHandler = ConsumerMessageHandler;
