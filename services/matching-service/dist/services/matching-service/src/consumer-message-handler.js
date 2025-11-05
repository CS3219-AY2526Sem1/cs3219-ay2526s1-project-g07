"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerMessageHandler = void 0;
const kafka_topics_js_1 = require("../../../shared/kafka-topics.js");
class ConsumerMessageHandler {
    constructor(matcher) {
        this.matcher = matcher;
    }
    handleMessage(message, topic) {
        const value = message.value?.toString() || '';
        switch (topic) {
            case kafka_topics_js_1.TOPICS_MATCHING.MATCHING_SUCCESS:
                this.processMatchingSuccess(value);
                break;
            default:
                this.processUnknownTopic(value);
                break;
        }
    }
    processMatchingSuccess(value) {
        const { userId, peerId, sessionId } = JSON.parse(value);
        console.log(`Processing matching success: ${userId}, ${peerId}, ${sessionId}`);
        // TODO: Implement logic to handle successful matching internally if needed
    }
    processUnknownTopic(value) {
        console.log(`Processing unknown topic message: ${value}`);
    }
}
exports.ConsumerMessageHandler = ConsumerMessageHandler;
