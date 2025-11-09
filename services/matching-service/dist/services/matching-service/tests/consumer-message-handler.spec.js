"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consumer_message_handler_1 = require("../src/consumer-message-handler");
const kafka_topics_1 = require("../../../shared/kafka-topics");
const mock_matcher_1 = require("./mocks/mock-matcher");
const client_1 = require("@peerprep/redis/client");
describe('ConsumerMessageHandler', () => {
    let mockMatcher;
    let messageHandler;
    let redisClient;
    beforeAll(async () => {
        redisClient = new client_1.RedisClient();
        await redisClient.init();
    });
    afterAll(async () => {
        await redisClient.quit();
    });
    beforeEach(async () => {
        mockMatcher = new mock_matcher_1.MockMatcher(redisClient);
        messageHandler = new consumer_message_handler_1.ConsumerMessageHandler(mockMatcher);
    });
    it('should handle matching success topic messages', async () => {
        const matchingSuccessTopic = kafka_topics_1.TOPICS_MATCHING.MATCHING_SUCCESS;
        const mockMessage = {
            value: Buffer.from(JSON.stringify({
                userId: '1',
                peerId: '2',
                sessionId: 'session-123',
                preferences: { topic: 'Math', difficulty: 'easy' }
            }))
        };
        const processMatchingSuccessSpy = spyOn(messageHandler, 'processMatchingSuccess').and.callThrough();
        messageHandler.handleMessage(mockMessage, matchingSuccessTopic);
        expect(processMatchingSuccessSpy).toHaveBeenCalledWith(mockMessage.value?.toString() || '');
    });
    it('should handle unknown topic messages', async () => {
        const unknownTopic = 'kdjsaiwmcaosm';
        const mockMessage = {
            value: Buffer.from('Some random message')
        };
        const processUnknownTopicSpy = spyOn(messageHandler, 'processUnknownTopic').and.callThrough();
        messageHandler.handleMessage(mockMessage, unknownTopic);
        expect(processUnknownTopicSpy).toHaveBeenCalledWith(mockMessage.value?.toString() || '');
    });
});
