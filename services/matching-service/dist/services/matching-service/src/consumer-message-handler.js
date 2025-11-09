"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerMessageHandler = void 0;
const kafka_topics_1 = require("../../../shared/kafka-topics");
class ConsumerMessageHandler {
    constructor(matcher, webSocket) {
        this.matcher = matcher;
        this.webSocket = webSocket;
    }
    handleMessage(message, topic) {
        const value = message.value?.toString() || '';
        switch (topic) {
            case kafka_topics_1.TOPICS_MATCHING.COLLAB_SESSION_READY:
                this.processCollabSessionReady(value);
                break;
            default:
                this.processUnknownTopic(value);
                break;
        }
    }
    processCollabSessionReady(value) {
        const { eventType, data, eventId } = JSON.parse(value);
        console.log(`Processing collaboration session ready: ${data.userIdOne}, ${data.userIdTwo}, ${data.collabSessionId}`);
        this.webSocket?.emitCollabSessionReady(data.userIdOne, data.userIdTwo, data.collabSessionId);
    }
    processUnknownTopic(value) {
        console.log(`Processing unknown topic message: ${value}`);
    }
}
exports.ConsumerMessageHandler = ConsumerMessageHandler;
