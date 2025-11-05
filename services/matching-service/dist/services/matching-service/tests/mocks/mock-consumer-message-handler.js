"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockConsumerMessageHandler = void 0;
const consumer_message_handler_1 = require("../../src/consumer-message-handler");
const kafka_topics_1 = require("../../../../shared/kafka-topics");
class MockConsumerMessageHandler extends consumer_message_handler_1.ConsumerMessageHandler {
    constructor(matcher) {
        super(matcher);
    }
    handleMessage(message, topic) {
        const value = message.value?.toString() || '';
        switch (topic) {
            case kafka_topics_1.TOPICS_MATCHING.MATCHING_SUCCESS:
                this.processMatchingSuccess(value);
                break;
            default:
                this.processUnknownTopic(value);
                break;
        }
    }
    processMatchingSuccess(value) {
        return; // No-op for testing
    }
    processUnknownTopic(value) {
        return; // No-op for testing
    }
}
exports.MockConsumerMessageHandler = MockConsumerMessageHandler;
