import { Kafka, type KafkaMessage, type Consumer } from 'kafkajs';
import { TOPICS_MATCHING } from '../src/utils.ts';
import { MatchingServiceConsumer } from '../src/matching-service-consumer.ts';
import { MockConsumerMessageHandler } from './mocks/mock-consumer-message-handler.ts';

describe('MatchingServiceConsumer', () => {
  let msConsumer: MatchingServiceConsumer;
  let kafkaConsumer: Consumer;
  let mockMessageHandler: jasmine.SpyObj<MockConsumerMessageHandler>;

  // Mock Kafka instance
  const mockKafka = {
      consumer: jasmine.createSpy('consumer').and.returnValue({
      connect: jasmine.createSpy('connect'),
      subscribe: jasmine.createSpy('subscribe'),
      run: jasmine.createSpy('run'),
    }),
  } as unknown as Kafka;
  const matchingSuccessTopic = TOPICS_MATCHING.MATCHING_SUCCESS;

  beforeEach(() => {
    mockMessageHandler = jasmine.createSpyObj('MockConsumerMessageHandler', ['handleMessage']);
    msConsumer = new MatchingServiceConsumer(mockKafka, mockMessageHandler);
    kafkaConsumer = (msConsumer as any).consumer;
  });

  it('should initialize and connect the Kafka consumer', async () => {
    await msConsumer.init();
    expect(mockKafka.consumer).toHaveBeenCalledWith({ groupId: 'matching-group' });
    expect(kafkaConsumer.connect).toHaveBeenCalled();
    expect(kafkaConsumer.subscribe).toHaveBeenCalledWith({ topics: [matchingSuccessTopic], fromBeginning: true });
    expect(kafkaConsumer.run).toHaveBeenCalled();
  });

  it('should handle messages using the message handler', async () => {
    const eachMessageHandler = (msConsumer['run'] as jasmine.Spy).calls.argsFor(0)[0].eachMessage;
    const mockMessage = { 
      value: Buffer.from(JSON.stringify({ 
        userId: '1', 
        peerId: '2', 
        sessionId: 'session-123', 
        preferences: { topic: 'Math', difficulty: 'easy' } 
      })) 
    } as KafkaMessage;
    await eachMessageHandler({ topic: matchingSuccessTopic, partition: 0, message: mockMessage });
    expect(kafkaConsumer.run).toHaveBeenCalled();
    expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(mockMessage, matchingSuccessTopic);
  });

  it('should handle empty message values gracefully', async () => {
    const eachMessageHandler = (msConsumer['run'] as jasmine.Spy).calls.argsFor(0)[0].eachMessage;
    const mockMessage = { value: null } as KafkaMessage;
    await eachMessageHandler({ topic: matchingSuccessTopic, partition: 0, message: mockMessage });
    expect(kafkaConsumer.run).toHaveBeenCalled();
    expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(mockMessage, matchingSuccessTopic);
  });
});
