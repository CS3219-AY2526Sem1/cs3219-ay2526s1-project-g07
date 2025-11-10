import type { KafkaMessage } from "kafkajs";
import { ConsumerMessageHandler } from "../src/consumer-message-handler";
import { TOPICS_MATCHING } from "../../../shared/kafka-topics";
import { MockMatcher } from "./mocks/mock-matcher";
import { RedisClient } from '../../../redis/src/client';
import { MatchingWS } from "../src/matching-ws";

describe('ConsumerMessageHandler', () => {
  let mockMatcher: MockMatcher;
  let messageHandler: ConsumerMessageHandler;
  let redisClient: RedisClient;

  beforeAll(async () => {
    redisClient = new RedisClient();
    await redisClient.init();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  beforeEach(async () => {
    mockMatcher = new MockMatcher();
    const webSocket = new MatchingWS(undefined as any, mockMatcher);
    spyOn(webSocket, 'init').and.callFake(() => Promise.resolve());
    messageHandler = new ConsumerMessageHandler(mockMatcher, webSocket);
  });

  it('should handle collab session ready topic messages', async () => {
    const collabSessionReadyTopic = TOPICS_MATCHING.COLLAB_SESSION_READY;
    const mockMessage = { 
      value: Buffer.from(JSON.stringify({ 
        userId: '1', 
        peerId: '2', 
        sessionId: 'session-123', 
        preferences: { topic: 'Math', difficulty: 'easy' } 
      })) 
    } as KafkaMessage;
    const processCollabSessionReadySpy = spyOn(messageHandler as any, 'processCollabSessionReady').and.callThrough();

    messageHandler.handleMessage(mockMessage, collabSessionReadyTopic);
    expect(processCollabSessionReadySpy).toHaveBeenCalledWith(mockMessage);
  });

  it('should handle unknown topic messages', async () => {
    const unknownTopic = 'kdjsaiwmcaosm';
    const mockMessage = { 
      value: Buffer.from('Some random message') 
    } as KafkaMessage;
    const processUnknownTopicSpy = spyOn(messageHandler as any, 'processUnknownTopic').and.callThrough();

    messageHandler.handleMessage(mockMessage, unknownTopic);
    expect(processUnknownTopicSpy).toHaveBeenCalledWith(mockMessage);
  });
});
