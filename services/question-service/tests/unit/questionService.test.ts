import { describe, it, expect, vi, beforeEach } from 'vitest';
import { questionRepository } from '../../src/repositories/questionRepository.js';
import { questionService } from '../../src/services/questionService.js';

// Mock the repository
vi.mock('../../src/repositories/questionRepository.js', () => ({
  questionRepository: {
    createQuestion: vi.fn(),
    getAllQuestions: vi.fn(),
    getQuestionById: vi.fn(),
    updateQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    findMatchingQuestion: vi.fn(),
  },
}));

describe('QuestionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQuestion', () => {
    const validQuestionData = {
      title: 'Test Question',
      question: 'What is the answer?',
      difficulty: 'Easy',
      topics: ['arrays', 'strings']
    };

    it('should create a question with valid data', async () => {
      const mockQuestion = {
        id: 'question-123',
        ...validQuestionData
      };

      vi.mocked(questionRepository.createQuestion).mockResolvedValue(mockQuestion);

      const result = await questionService.createQuestion(validQuestionData);

      expect(result).toEqual(mockQuestion);
      expect(questionRepository.createQuestion).toHaveBeenCalledWith(validQuestionData);
      expect(questionRepository.createQuestion).toHaveBeenCalledTimes(1);
    });

    it('should throw error when title is missing', async () => {
      const invalidData = { ...validQuestionData, title: '' };

      await expect(questionService.createQuestion(invalidData)).rejects.toThrow('Title is required');
      expect(questionRepository.createQuestion).not.toHaveBeenCalled();
    });

    it('should throw error when question description is missing', async () => {
      const invalidData = { ...validQuestionData, question: '   ' };

      await expect(questionService.createQuestion(invalidData)).rejects.toThrow('Question description is required');
      expect(questionRepository.createQuestion).not.toHaveBeenCalled();
    });

    it('should throw error when difficulty is missing', async () => {
      const invalidData = { ...validQuestionData, difficulty: '' };

      await expect(questionService.createQuestion(invalidData)).rejects.toThrow('Difficulty is required');
      expect(questionRepository.createQuestion).not.toHaveBeenCalled();
    });

    it('should throw error when topics array is empty', async () => {
      const invalidData = { ...validQuestionData, topics: [] };

      await expect(questionService.createQuestion(invalidData)).rejects.toThrow('At least one topic is required');
      expect(questionRepository.createQuestion).not.toHaveBeenCalled();
    });

    it('should throw error when difficulty is invalid', async () => {
      const invalidData = { ...validQuestionData, difficulty: 'SuperHard' };

      await expect(questionService.createQuestion(invalidData)).rejects.toThrow('Invalid difficulty');
      expect(questionRepository.createQuestion).not.toHaveBeenCalled();
    });

    it('should accept Easy difficulty', async () => {
      const data = { ...validQuestionData, difficulty: 'Easy' };
      const mockQuestion = { id: 'q1', ...data };
      
      vi.mocked(questionRepository.createQuestion).mockResolvedValue(mockQuestion);

      await questionService.createQuestion(data);
      expect(questionRepository.createQuestion).toHaveBeenCalled();
    });

    it('should accept Medium difficulty', async () => {
      const data = { ...validQuestionData, difficulty: 'Medium' };
      const mockQuestion = { id: 'q2', ...data };
      
      vi.mocked(questionRepository.createQuestion).mockResolvedValue(mockQuestion);

      await questionService.createQuestion(data);
      expect(questionRepository.createQuestion).toHaveBeenCalled();
    });

    it('should accept Hard difficulty', async () => {
      const data = { ...validQuestionData, difficulty: 'Hard' };
      const mockQuestion = { id: 'q3', ...data };
      
      vi.mocked(questionRepository.createQuestion).mockResolvedValue(mockQuestion);

      await questionService.createQuestion(data);
      expect(questionRepository.createQuestion).toHaveBeenCalled();
    });
  });

  describe('getAllQuestions', () => {
    it('should return all questions', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          title: 'Question 1',
          question: 'Description 1',
          difficulty: 'Easy',
          topics: ['arrays']
        },
        {
          id: 'q2',
          title: 'Question 2',
          question: 'Description 2',
          difficulty: 'Hard',
          topics: ['graphs']
        }
      ];

      vi.mocked(questionRepository.getAllQuestions).mockResolvedValue(mockQuestions);

      const result = await questionService.getAllQuestions();

      expect(result).toEqual(mockQuestions);
      expect(result).toHaveLength(2);
      expect(questionRepository.getAllQuestions).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no questions exist', async () => {
      vi.mocked(questionRepository.getAllQuestions).mockResolvedValue([]);

      const result = await questionService.getAllQuestions();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate errors from repository', async () => {
      const error = new Error('Database error');
      vi.mocked(questionRepository.getAllQuestions).mockRejectedValue(error);

      await expect(questionService.getAllQuestions()).rejects.toThrow('Database error');
    });
  });

  describe('getQuestionById', () => {
    it('should return question when it exists', async () => {
      const mockQuestion = {
        id: 'question-123',
        title: 'Test Question',
        question: 'What is this?',
        difficulty: 'Medium',
        topics: ['testing']
      };

      vi.mocked(questionRepository.getQuestionById).mockResolvedValue(mockQuestion);

      const result = await questionService.getQuestionById('question-123');

      expect(result).toEqual(mockQuestion);
      expect(questionRepository.getQuestionById).toHaveBeenCalledWith('question-123');
    });

    it('should return null when question does not exist', async () => {
      vi.mocked(questionRepository.getQuestionById).mockResolvedValue(null);

      const result = await questionService.getQuestionById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error when ID is empty', async () => {
      await expect(questionService.getQuestionById('')).rejects.toThrow('Question ID is required');
      expect(questionRepository.getQuestionById).not.toHaveBeenCalled();
    });

    it('should throw error when ID is whitespace', async () => {
      await expect(questionService.getQuestionById('   ')).rejects.toThrow('Question ID is required');
      expect(questionRepository.getQuestionById).not.toHaveBeenCalled();
    });
  });

  describe('updateQuestion', () => {
    it('should update question with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        difficulty: 'Hard'
      };
      const mockUpdatedQuestion = {
        id: 'question-123',
        title: 'Updated Title',
        question: 'Original question',
        difficulty: 'Hard',
        topics: ['arrays']
      };

      vi.mocked(questionRepository.updateQuestion).mockResolvedValue(mockUpdatedQuestion);

      const result = await questionService.updateQuestion('question-123', updateData);

      expect(result).toEqual(mockUpdatedQuestion);
      expect(questionRepository.updateQuestion).toHaveBeenCalledWith('question-123', updateData);
    });

    it('should return null when question does not exist', async () => {
      vi.mocked(questionRepository.updateQuestion).mockResolvedValue(null);

      const result = await questionService.updateQuestion('non-existent', { title: 'New' });

      expect(result).toBeNull();
    });

    it('should throw error when ID is empty', async () => {
      await expect(questionService.updateQuestion('', { title: 'New' })).rejects.toThrow('Question ID is required');
      expect(questionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it('should throw error when difficulty is invalid', async () => {
      await expect(
        questionService.updateQuestion('q1', { difficulty: 'Impossible' })
      ).rejects.toThrow('Invalid difficulty');
      expect(questionRepository.updateQuestion).not.toHaveBeenCalled();
    });

    it('should allow updating without difficulty validation when not provided', async () => {
      const updateData = { title: 'New Title' };
      const mockQuestion = { id: 'q1', title: 'New Title', question: 'Q', difficulty: 'Easy', topics: [] };
      
      vi.mocked(questionRepository.updateQuestion).mockResolvedValue(mockQuestion);

      await questionService.updateQuestion('q1', updateData);
      expect(questionRepository.updateQuestion).toHaveBeenCalledWith('q1', updateData);
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question successfully', async () => {
      vi.mocked(questionRepository.deleteQuestion).mockResolvedValue(true);

      const result = await questionService.deleteQuestion('question-123');

      expect(result).toBe(true);
      expect(questionRepository.deleteQuestion).toHaveBeenCalledWith('question-123');
    });

    it('should return false when question does not exist', async () => {
      vi.mocked(questionRepository.deleteQuestion).mockResolvedValue(false);

      const result = await questionService.deleteQuestion('non-existent');

      expect(result).toBe(false);
    });

    it('should throw error when ID is empty', async () => {
      await expect(questionService.deleteQuestion('')).rejects.toThrow('Question ID is required');
      expect(questionRepository.deleteQuestion).not.toHaveBeenCalled();
    });
  });

  describe('findMatchingQuestion', () => {
    it('should find matching question', async () => {
      const mockQuestion = {
        id: 'q1',
        title: 'Array Question',
        question: 'Sort an array',
        difficulty: 'Medium',
        topics: ['arrays', 'sorting']
      };

      vi.mocked(questionRepository.findMatchingQuestion).mockResolvedValue(mockQuestion);

      const result = await questionService.findMatchingQuestion('Medium', ['arrays']);

      expect(result).toEqual(mockQuestion);
      expect(questionRepository.findMatchingQuestion).toHaveBeenCalledWith('Medium', ['arrays']);
    });

    it('should return null when no matching question found', async () => {
      vi.mocked(questionRepository.findMatchingQuestion).mockResolvedValue(null);

      const result = await questionService.findMatchingQuestion('Easy', ['rare-topic']);

      expect(result).toBeNull();
    });

    it('should throw error when difficulty is empty', async () => {
      await expect(
        questionService.findMatchingQuestion('', ['arrays'])
      ).rejects.toThrow('Difficulty is required');
      expect(questionRepository.findMatchingQuestion).not.toHaveBeenCalled();
    });

    it('should throw error when topics array is empty', async () => {
      await expect(
        questionService.findMatchingQuestion('Easy', [])
      ).rejects.toThrow('At least one topic is required');
      expect(questionRepository.findMatchingQuestion).not.toHaveBeenCalled();
    });
  });
});
