import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuestionProducer } from '../../../src/kafka/producer.js';
import type { QuestionSuccessMessage, QuestionErrorMessage } from '../../../src/kafka/types.js';
import { Kafka } from 'kafkajs';

// Mock the Kafka module
vi.mock('kafkajs', () => {
  const mockProducer = {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    send: vi.fn().mockResolvedValue([{ topicName: 'test', partition: 0, errorCode: 0 }]),
    sendBatch: vi.fn(),
    transaction: vi.fn(),
    on: vi.fn(),
    events: {},
  };

  const MockKafka = vi.fn().mockImplementation(() => ({
    producer: vi.fn(() => mockProducer),
    consumer: vi.fn(),
    admin: vi.fn(),
  }));

  return {
    Kafka: MockKafka,
  };
});

describe('QuestionProducer', () => {
  let questionProducer: QuestionProducer;
  let mockProducer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    questionProducer = new QuestionProducer(['localhost:9094']);
    // Get the mock producer instance
    const KafkaConstructor = Kafka as any;
    const kafkaInstance = new KafkaConstructor();
    mockProducer = kafkaInstance.producer();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await questionProducer.connect();

      expect(mockProducer.connect).toHaveBeenCalledTimes(1);
    });

    it('should not connect if already connected', async () => {
      await questionProducer.connect();
      await questionProducer.connect();

      expect(mockProducer.connect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection failed');
      mockProducer.connect.mockRejectedValueOnce(error);

      const newProducer = new QuestionProducer(['localhost:9094']);
      await expect(newProducer.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await questionProducer.connect();
      await questionProducer.disconnect();

      expect(mockProducer.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should not disconnect if not connected', async () => {
      await questionProducer.disconnect();

      expect(mockProducer.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('sendQuestionSuccess', () => {
    it('should send question success message', async () => {
      await questionProducer.connect();

      const message: QuestionSuccessMessage = {
        userId: 'user-123',
        peerId: 'user-456',
        questionId: 'q1',
        title: 'Two Sum',
        question: 'Question text...',
        difficulty: 'Easy',
        topic: 'Array',
        timestamp: Date.now(),
      };

      await questionProducer.sendQuestionSuccess(message);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'question-success',
        messages: [
          {
            key: 'user-123',
            value: JSON.stringify(message),
            timestamp: expect.any(String),
          },
        ],
      });
    });

    it('should throw error if not connected', async () => {
      const message: QuestionSuccessMessage = {
        userId: 'user-123',
        peerId: 'user-456',
        questionId: 'q1',
        title: 'Two Sum',
        question: 'Question text...',
        difficulty: 'Easy',
        topic: 'Array',
        timestamp: Date.now(),
      };

      const newProducer = new QuestionProducer(['localhost:9094']);
      await expect(newProducer.sendQuestionSuccess(message)).rejects.toThrow(
        'Producer is not connected. Call connect() first.'
      );
    });

    it('should handle send error', async () => {
      const error = new Error('Send failed');
      mockProducer.send.mockRejectedValueOnce(error);

      await questionProducer.connect();

      const message: QuestionSuccessMessage = {
        userId: 'user-123',
        peerId: 'user-456',
        questionId: 'q1',
        title: 'Two Sum',
        question: 'Question text...',
        difficulty: 'Easy',
        topic: 'Array',
        timestamp: Date.now(),
      };

      await expect(questionProducer.sendQuestionSuccess(message)).rejects.toThrow('Send failed');
    });
  });

  describe('sendQuestionError', () => {
    it('should send question error message', async () => {
      await questionProducer.connect();

      const message: QuestionErrorMessage = {
        userId: 'user-123',
        peerId: 'user-456',
        error: 'No matching question found',
        timestamp: Date.now(),
      };

      await questionProducer.sendQuestionError(message);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'question-failure',
        messages: [
          {
            key: 'user-123',
            value: JSON.stringify(message),
            timestamp: expect.any(String),
          },
        ],
      });
    });

    it('should throw error if not connected', async () => {
      const message: QuestionErrorMessage = {
        userId: 'user-123',
        peerId: 'user-456',
        error: 'No matching question found',
        timestamp: Date.now(),
      };

      const newProducer = new QuestionProducer(['localhost:9094']);
      await expect(newProducer.sendQuestionError(message)).rejects.toThrow(
        'Producer is not connected. Call connect() first.'
      );
    });

    it('should handle send error', async () => {
      const error = new Error('Send failed');
      mockProducer.send.mockRejectedValueOnce(error);

      await questionProducer.connect();

      const message: QuestionErrorMessage = {
        userId: 'user-123',
        peerId: 'user-456',
        error: 'No matching question found',
        timestamp: Date.now(),
      };

      await expect(questionProducer.sendQuestionError(message)).rejects.toThrow('Send failed');
    });
  });
});
