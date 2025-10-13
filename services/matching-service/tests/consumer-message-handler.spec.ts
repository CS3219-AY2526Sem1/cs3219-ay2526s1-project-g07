import { type KafkaMessage } from "kafkajs";
import { ConsumerMessageHandler } from "../src/consumer-message-handler.ts";
import { TOPICS_MATCHING } from "../src/utils.ts";
import { MockMatcher } from "./mocks/mock-matcher.ts";

describe('ConsumerMessageHandler', () => {
  let mockMatcher: MockMatcher
  let messageHandler: ConsumerMessageHandler;

  beforeEach(() => {
    mockMatcher = new MockMatcher();
    messageHandler = new ConsumerMessageHandler(mockMatcher);
  });

  it('should handle matching success topic messages', async () => {
    const matchingSuccessTopic = TOPICS_MATCHING.MATCHING_SUCCESS;
    const mockMessage = { 
      value: Buffer.from(JSON.stringify({ 
        userId: '1', 
        peerId: '2', 
        sessionId: 'session-123', 
        preferences: { topic: 'Math', difficulty: 'easy' } 
      })) 
    } as KafkaMessage;
    const processMatchingSuccessSpy = spyOn(messageHandler as any, 'processMatchingSuccess').and.callThrough();

    messageHandler.handleMessage(mockMessage, matchingSuccessTopic);
    expect(processMatchingSuccessSpy).toHaveBeenCalledWith(mockMessage.value?.toString() || '');
  });

  it('should handle unknown topic messages', async () => {
    const unknownTopic = 'kdjsaiwmcaosm';
    const mockMessage = { 
      value: Buffer.from('Some random message') 
    } as KafkaMessage;
    const processUnknownTopicSpy = spyOn(messageHandler as any, 'processUnknownTopic').and.callThrough();

    messageHandler.handleMessage(mockMessage, unknownTopic);
    expect(processUnknownTopicSpy).toHaveBeenCalledWith(mockMessage.value?.toString() || '');
  });
});
