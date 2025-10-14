import { MatchingServiceProducer } from "../src/matching-service-producer.ts";
import { Kafka, type Producer } from 'kafkajs';
import { MockMatcher } from "./mocks/mock-matcher.ts";
import { TOPICS_MATCHING } from "../src/utils.ts";
import type { MatchPreference, MatchResult } from "../src/types.ts";

describe('MatchingServiceProducer', () => {
  let msProducer: MatchingServiceProducer;
  let kafkaProducer: Producer;
  let mockMatcher: MockMatcher;
  const matchingSuccessTopic = TOPICS_MATCHING.MATCHING_SUCCESS;

  // Mock Kafka instance
  const mockKafka = {
    producer: jasmine.createSpy('producer').and.returnValue({
      connect: jasmine.createSpy('connect'),
      send: jasmine.createSpy('send'),
    }),
  } as unknown as Kafka;

  beforeEach(() => {
    mockMatcher = new MockMatcher();
    msProducer = new MatchingServiceProducer(mockKafka, mockMatcher);
    kafkaProducer = (msProducer as any).producer;
  });

  it('should initialize and connect the Kafka producer', async () => {
    await msProducer.init();
    expect(mockKafka.producer).toHaveBeenCalled();
    expect(kafkaProducer.connect).toHaveBeenCalled();
  });

  it('should send a message upon match found event', async () => {
    const preference: MatchPreference = { topic: 'Math', difficulty: 'easy' };
    const match = {
      firstUserId: 1,
      secondUserId: 2,
      preferences: preference
    };

    const sendSpy = spyOn(msProducer, 'send').and.callThrough();
    const produceMatchingSuccessSpy = spyOn(msProducer as any, 'produceMatchingSuccess').and.callThrough();

    await msProducer['produceMatchingSuccess'](
      match.firstUserId.toString(), 
      match.secondUserId.toString(), 
      match.preferences
    );
    expect(sendSpy).toHaveBeenCalledWith({ 
      topic: matchingSuccessTopic, 
      messages: [ { value: JSON.stringify({ 
        userId: match.firstUserId.toString(), 
        peerId: match.secondUserId.toString(), 
        preferences: match.preferences 
      })}]
    });
    expect(produceMatchingSuccessSpy).toHaveBeenCalled();
    expect(kafkaProducer.send).toHaveBeenCalled();
  });

  it('should handle match found event from matcher', async () => {
    const preference: MatchPreference = { topic: 'Science', difficulty: 'medium' };
    const match: MatchResult = {
      firstUserId: 3,
      secondUserId: 4,
      preferences: preference
    };

    const handleMatchFoundSpy = spyOn(msProducer as any, 'handleMatchFound').and.callThrough();
    mockMatcher.emitter.emit('matchFound', match);
    expect(handleMatchFoundSpy).toHaveBeenCalledWith(match);
    expect(kafkaProducer.send).toHaveBeenCalled();
  });
});
