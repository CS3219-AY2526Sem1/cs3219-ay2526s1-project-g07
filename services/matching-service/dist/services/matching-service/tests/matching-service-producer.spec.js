"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matching_service_producer_1 = require("../src/matching-service-producer");
const mock_matcher_1 = require("./mocks/mock-matcher");
const kafka_topics_1 = require("../../../shared/kafka-topics");
const client_1 = require("@peerprep/redis/client");
describe('MatchingServiceProducer', () => {
    let msProducer;
    let kafkaProducer;
    let mockMatcher;
    const matchingSuccessTopic = kafka_topics_1.TOPICS_MATCHING.MATCHING_SUCCESS;
    let redisClient;
    // Mock Kafka instance
    const mockKafka = {
        producer: jasmine.createSpy('producer').and.returnValue({
            connect: jasmine.createSpy('connect'),
            send: jasmine.createSpy('send'),
        }),
    };
    beforeAll(async () => {
        redisClient = new client_1.RedisClient();
        await redisClient.init();
    });
    afterAll(async () => {
        await redisClient.quit();
    });
    beforeEach(() => {
        mockMatcher = new mock_matcher_1.MockMatcher(redisClient);
        msProducer = new matching_service_producer_1.MatchingServiceProducer(mockKafka, mockMatcher);
        kafkaProducer = msProducer.producer;
    });
    it('should initialize and connect the Kafka producer', async () => {
        await msProducer.init();
        expect(mockKafka.producer).toHaveBeenCalled();
        expect(kafkaProducer.connect).toHaveBeenCalled();
    });
    it('should send a message upon match found event', async () => {
        const preference = { topic: 'Math', difficulty: 'easy' };
        const match = {
            firstUserId: 1,
            secondUserId: 2,
            preferences: preference
        };
        const sendSpy = spyOn(msProducer, 'send').and.callThrough();
        const produceMatchingSuccessSpy = spyOn(msProducer, 'produceMatchingSuccess').and.callThrough();
        await msProducer['produceMatchingSuccess'](match.firstUserId.toString(), match.secondUserId.toString(), match.preferences);
        expect(sendSpy).toHaveBeenCalledWith({
            topic: matchingSuccessTopic,
            messages: [{ value: JSON.stringify({
                        userId: match.firstUserId.toString(),
                        peerId: match.secondUserId.toString(),
                        preferences: match.preferences
                    }) }]
        });
        expect(produceMatchingSuccessSpy).toHaveBeenCalled();
        expect(kafkaProducer.send).toHaveBeenCalled();
    });
    it('should handle match found event from matcher', async () => {
        const preference = { topic: 'Science', difficulty: 'medium' };
        const match = {
            firstUserId: { id: '3' },
            secondUserId: { id: '4' },
            preferences: preference
        };
        const handleMatchFoundSpy = spyOn(msProducer, 'handleMatchFound').and.callThrough();
        mockMatcher.emitter.emit('matchFound', match);
        expect(handleMatchFoundSpy).toHaveBeenCalledWith(match);
        expect(kafkaProducer.send).toHaveBeenCalled();
    });
});
