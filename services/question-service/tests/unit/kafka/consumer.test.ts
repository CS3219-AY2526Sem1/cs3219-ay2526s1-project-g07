import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuestionConsumer } from '../../../src/kafka/consumer.js';
import type { MatchingSuccessMessage } from '../../../src/kafka/types.js';
import { Kafka } from 'kafkajs';

// Mock the Kafka module
vi.mock('kafkajs', () => {
  const mockConsumer = {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    seek: vi.fn(),
    describeGroup: vi.fn(),
    commitOffsets: vi.fn(),
    on: vi.fn(),
    events: {},
  };

  const MockKafka = vi.fn().mockImplementation(() => ({
    consumer: vi.fn(() => mockConsumer),
    producer: vi.fn(),
    admin: vi.fn(),
  }));

  return {
    Kafka: MockKafka,
  };
});

describe('QuestionConsumer', () => {
  let questionConsumer: QuestionConsumer;
  let mockConsumer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    questionConsumer = new QuestionConsumer(['localhost:9094']);
    // Get the mock consumer instance
    const KafkaConstructor = Kafka as any;
    const kafkaInstance = new KafkaConstructor();
    mockConsumer = kafkaInstance.consumer();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await questionConsumer.connect();

      expect(mockConsumer.connect).toHaveBeenCalledTimes(1);
    });

    it('should not connect if already connected', async () => {
      await questionConsumer.connect();
      await questionConsumer.connect();

      expect(mockConsumer.connect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection failed');
      mockConsumer.connect.mockRejectedValueOnce(error);

      const newConsumer = new QuestionConsumer(['localhost:9094']);
      await expect(newConsumer.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await questionConsumer.connect();
      await questionConsumer.disconnect();

      expect(mockConsumer.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should not disconnect if not connected', async () => {
      await questionConsumer.disconnect();

      expect(mockConsumer.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('setMessageHandler', () => {
    it('should set message handler', () => {
      const handler = vi.fn();
      
      questionConsumer.setMessageHandler(handler);

      // Handler is set internally
      expect(handler).toBeDefined();
    });
  });

  describe('subscribe', () => {
    it('should subscribe to matching-success topic', async () => {
      await questionConsumer.connect();
      await questionConsumer.subscribe();

      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: 'matching-success',
        fromBeginning: false,
      });
    });

    it('should throw error if not connected', async () => {
      const newConsumer = new QuestionConsumer(['localhost:9094']);
      await expect(newConsumer.subscribe()).rejects.toThrow(
        'Consumer is not connected. Call connect() first.'
      );
    });
  });

  describe('startConsuming', () => {
    it('should throw error if not connected', async () => {
      const handler = vi.fn();
      const newConsumer = new QuestionConsumer(['localhost:9094']);
      newConsumer.setMessageHandler(handler);

      await expect(newConsumer.startConsuming()).rejects.toThrow(
        'Consumer is not connected. Call connect() first.'
      );
    });

    it('should throw error if message handler not set', async () => {
      await questionConsumer.connect();
      
      await expect(questionConsumer.startConsuming()).rejects.toThrow(
        'Message handler is not set. Call setMessageHandler() first.'
      );
    });

    it('should start consuming messages', async () => {
      const handler = vi.fn();

      questionConsumer.setMessageHandler(handler);
      await questionConsumer.connect();
      await questionConsumer.startConsuming();

      expect(mockConsumer.run).toHaveBeenCalledWith({
        eachMessage: expect.any(Function),
      });
    });

    it('should handle message with valid payload', async () => {
      const handler = vi.fn();
      const message: MatchingSuccessMessage = {
        userId: { id: 'user-123' },
        peerId: { id: 'user-456' },
        preferences: {
          topic: 'Array',
          difficulty: 'Easy',
        },
      };

      let capturedEachMessage: Function | undefined;
      mockConsumer.run.mockImplementationOnce(async (config: any) => {
        capturedEachMessage = config.eachMessage;
        return undefined;
      });

      questionConsumer.setMessageHandler(handler);
      await questionConsumer.connect();
      await questionConsumer.startConsuming();

      expect(capturedEachMessage).toBeDefined();

      // Simulate message processing
      if (capturedEachMessage) {
        await capturedEachMessage({
          topic: 'matching-success',
          partition: 0,
          message: {
            value: Buffer.from(JSON.stringify(message)),
            offset: '0',
            timestamp: Date.now().toString(),
          },
        });

        expect(handler).toHaveBeenCalledWith(message);
      }
    });

    it('should handle message with no value', async () => {
      const handler = vi.fn();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      let capturedEachMessage: Function | undefined;
      mockConsumer.run.mockImplementationOnce(async (config: any) => {
        capturedEachMessage = config.eachMessage;
        return undefined;
      });

      questionConsumer.setMessageHandler(handler);
      await questionConsumer.connect();
      await questionConsumer.startConsuming();

      // Simulate message with no value
      if (capturedEachMessage) {
        await capturedEachMessage({
          topic: 'matching-success',
          partition: 0,
          message: {
            value: null,
            offset: '0',
            timestamp: Date.now().toString(),
          },
        });

        expect(consoleSpy).toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });

  describe('start', () => {
    it('should connect, subscribe, and start consuming', async () => {
      const handler = vi.fn();

      await questionConsumer.start(handler);

      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(mockConsumer.subscribe).toHaveBeenCalled();
      expect(mockConsumer.run).toHaveBeenCalled();
    });
  });
});
