"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_topics_1 = require("../../../shared/kafka-topics");
const matching_service_consumer_1 = require("../src/matching-service-consumer");
describe('MatchingServiceConsumer', () => {
    let msConsumer;
    let kafkaConsumer;
    let mockMessageHandler;
    const matchingSuccessTopic = kafka_topics_1.TOPICS_MATCHING.MATCHING_SUCCESS;
    // Mock Kafka instance
    const mockKafka = {
        consumer: jasmine.createSpy('consumer').and.returnValue({
            connect: jasmine.createSpy('connect'),
            subscribe: jasmine.createSpy('subscribe'),
            run: jasmine.createSpy('run'),
        }),
    };
    beforeEach(() => {
        mockMessageHandler = jasmine.createSpyObj('MockConsumerMessageHandler', ['handleMessage']);
        msConsumer = new matching_service_consumer_1.MatchingServiceConsumer(mockKafka, mockMessageHandler);
        kafkaConsumer = msConsumer.consumer;
    });
    it('should initialize and connect the Kafka consumer', async () => {
        await msConsumer.init();
        expect(mockKafka.consumer).toHaveBeenCalledWith({ groupId: 'matching-group' });
        expect(kafkaConsumer.connect).toHaveBeenCalled();
        expect(kafkaConsumer.subscribe).toHaveBeenCalledWith({ topics: [matchingSuccessTopic], fromBeginning: true });
        expect(kafkaConsumer.run).toHaveBeenCalled();
    });
    it('should handle messages using the message handler', async () => {
        const mockMessage = {
            value: Buffer.from(JSON.stringify({
                userId: '1',
                peerId: '2',
                sessionId: 'session-123',
                preferences: { topic: 'Math', difficulty: 'easy' }
            }))
        };
        await msConsumer['run']();
        const runArgs = kafkaConsumer.run.calls.mostRecent().args[0];
        // Run message callback with mock message
        await runArgs.eachMessage({ topic: matchingSuccessTopic, partition: 0, message: mockMessage });
        expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(mockMessage, matchingSuccessTopic);
    });
    it('should handle empty message values gracefully', async () => {
        const mockMessage = { value: null };
        await msConsumer['run']();
        const runArgs = kafkaConsumer.run.calls.mostRecent().args[0];
        // Run message callback with null value
        await runArgs.eachMessage({ topic: matchingSuccessTopic, partition: 0, message: mockMessage });
        expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(mockMessage, matchingSuccessTopic);
    });
});
