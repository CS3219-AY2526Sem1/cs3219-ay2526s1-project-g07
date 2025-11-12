import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleMatchingSuccess } from '../../../src/kafka/messageHandler.js';
import { questionProducer } from '../../../src/kafka/producer.js';
import { questionService } from '../../../src/services/questionService.js';
import type { MatchingSuccessMessage } from '../../../src/kafka/types.js';

vi.mock('../../../src/kafka/producer', () => ({
  questionProducer: {
    sendQuestionSuccess: vi.fn(),
    sendQuestionError: vi.fn(),
  },
}));

vi.mock('../../../src/services/questionService', () => ({
  questionService: {
    findMatchingQuestion: vi.fn(),
  },
}));

describe('MessageHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleMatchingSuccess', () => {
    it('should handle matching success with userId/peerId as objects', async () => {
      const mockQuestion = {
        id: 'q1',
        title: 'Two Sum',
        question: 'Question text...',
        difficulty: 'Easy',
        topics: ['Array', 'Hash Table'],
      };

      vi.mocked(questionService.findMatchingQuestion).mockResolvedValue(mockQuestion);

      const message: MatchingSuccessMessage = {
        userId: { id: 'user-123' },
        peerId: { id: 'user-456' },
        preferences: {
          topic: 'Array',
          difficulty: 'Easy',
        },
      };

      await handleMatchingSuccess(message);

      expect(questionService.findMatchingQuestion).toHaveBeenCalledWith('Easy', ['Array']);
      expect(questionProducer.sendQuestionSuccess).toHaveBeenCalledWith({
        userId: 'user-123',
        peerId: 'user-456',
        questionId: 'q1',
        title: 'Two Sum',
        question: 'Question text...',
        difficulty: 'Easy',
        topic: 'Array',
        timestamp: expect.any(Number),
      });
      expect(questionProducer.sendQuestionError).not.toHaveBeenCalled();
    });

    it('should handle matching success with userId/peerId as strings', async () => {
      const mockQuestion = {
        id: 'q2',
        title: 'Valid Parentheses',
        question: 'Question text...',
        difficulty: 'Medium',
        topics: ['Stack', 'String'],
      };

      vi.mocked(questionService.findMatchingQuestion).mockResolvedValue(mockQuestion);

      const message: MatchingSuccessMessage = {
        userId: 'user-789',
        peerId: 'user-012',
        preferences: {
          topic: 'Stack',
          difficulty: 'Medium',
        },
      };

      await handleMatchingSuccess(message);

      expect(questionService.findMatchingQuestion).toHaveBeenCalledWith('Medium', ['Stack']);
      expect(questionProducer.sendQuestionSuccess).toHaveBeenCalledWith({
        userId: 'user-789',
        peerId: 'user-012',
        questionId: 'q2',
        title: 'Valid Parentheses',
        question: 'Question text...',
        difficulty: 'Medium',
        topic: 'Stack',
        timestamp: expect.any(Number),
      });
    });

    it('should send error when no question found', async () => {
      vi.mocked(questionService.findMatchingQuestion).mockResolvedValue(null);

      const message: MatchingSuccessMessage = {
        userId: { id: 'user-123' },
        peerId: { id: 'user-456' },
        preferences: {
          topic: 'Unknown Topic',
          difficulty: 'Hard',
        },
      };

      await handleMatchingSuccess(message);

      expect(questionService.findMatchingQuestion).toHaveBeenCalledWith('Hard', ['Unknown Topic']);
      expect(questionProducer.sendQuestionError).toHaveBeenCalledWith({
        userId: 'user-123',
        peerId: 'user-456',
        error: 'No matching question found for the specified criteria',
        timestamp: expect.any(Number),
      });
      expect(questionProducer.sendQuestionSuccess).not.toHaveBeenCalled();
    });

    it('should handle service error and send error message', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(questionService.findMatchingQuestion).mockRejectedValue(error);

      const message: MatchingSuccessMessage = {
        userId: { id: 'user-123' },
        peerId: { id: 'user-456' },
        preferences: {
          topic: 'Array',
          difficulty: 'Easy',
        },
      };

      await handleMatchingSuccess(message);

      expect(questionService.findMatchingQuestion).toHaveBeenCalledWith('Easy', ['Array']);
      expect(questionProducer.sendQuestionError).toHaveBeenCalledWith({
        userId: 'user-123',
        peerId: 'user-456',
        error: 'Database connection failed',
        timestamp: expect.any(Number),
      });
      expect(questionProducer.sendQuestionSuccess).not.toHaveBeenCalled();
    });

    it('should handle unknown error type', async () => {
      vi.mocked(questionService.findMatchingQuestion).mockRejectedValue('Unknown error');

      const message: MatchingSuccessMessage = {
        userId: 'user-123',
        peerId: 'user-456',
        preferences: {
          topic: 'String',
          difficulty: 'Medium',
        },
      };

      await handleMatchingSuccess(message);

      expect(questionProducer.sendQuestionError).toHaveBeenCalledWith({
        userId: 'user-123',
        peerId: 'user-456',
        error: 'Unknown error occurred',
        timestamp: expect.any(Number),
      });
    });

    it('should handle error when sending error message fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const serviceError = new Error('Service error');
      const producerError = new Error('Producer error');
      
      vi.mocked(questionService.findMatchingQuestion).mockRejectedValue(serviceError);
      vi.mocked(questionProducer.sendQuestionError).mockRejectedValue(producerError);

      const message: MatchingSuccessMessage = {
        userId: { id: 'user-123' },
        peerId: { id: 'user-456' },
        preferences: {
          topic: 'Array',
          difficulty: 'Easy',
        },
      };

      await handleMatchingSuccess(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error handling matching success'),
        serviceError
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send error message'),
        producerError
      );

      consoleSpy.mockRestore();
    });
  });
});
