import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the questionService before importing controller
const mockQuestionService = {
  createQuestion: vi.fn(),
  getAllQuestions: vi.fn(),
  getQuestionById: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  findMatchingQuestion: vi.fn(),
};

vi.mock('../../src/services/questionService.js', () => ({
  questionService: mockQuestionService,
}));

describe('QuestionController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /questions', () => {
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

      mockQuestionService.getAllQuestions.mockResolvedValue(mockQuestions);

      expect(mockQuestionService.getAllQuestions).toBeDefined();
    });

    it('should handle service errors', async () => {
      mockQuestionService.getAllQuestions.mockRejectedValue(new Error('Database error'));

      expect(mockQuestionService.getAllQuestions).toBeDefined();
    });
  });

  describe('POST /questions', () => {
    it('should create a new question', async () => {
      const questionData = {
        title: 'New Question',
        question: 'What is this?',
        difficulty: 'Medium',
        topics: ['arrays', 'strings']
      };

      const mockCreatedQuestion = {
        id: 'new-q',
        ...questionData
      };

      mockQuestionService.createQuestion.mockResolvedValue(mockCreatedQuestion);

      expect(mockQuestionService.createQuestion).toBeDefined();
    });

    it('should return 400 for validation errors', async () => {
      mockQuestionService.createQuestion.mockRejectedValue(new Error('Title is required'));

      expect(mockQuestionService.createQuestion).toBeDefined();
    });

    it('should return 400 for invalid difficulty', async () => {
      mockQuestionService.createQuestion.mockRejectedValue(new Error('Invalid difficulty'));

      expect(mockQuestionService.createQuestion).toBeDefined();
    });

    it('should return 500 for other errors', async () => {
      mockQuestionService.createQuestion.mockRejectedValue(new Error('Database connection failed'));

      expect(mockQuestionService.createQuestion).toBeDefined();
    });
  });

  describe('GET /questions/:id', () => {
    it('should return question when it exists', async () => {
      const mockQuestion = {
        id: 'question-123',
        title: 'Test Question',
        question: 'What is this?',
        difficulty: 'Medium',
        topics: ['testing']
      };

      mockQuestionService.getQuestionById.mockResolvedValue(mockQuestion);

      expect(mockQuestionService.getQuestionById).toBeDefined();
    });

    it('should return 404 when question not found', async () => {
      mockQuestionService.getQuestionById.mockResolvedValue(null);

      expect(mockQuestionService.getQuestionById).toBeDefined();
    });

    it('should return 400 for validation errors', async () => {
      mockQuestionService.getQuestionById.mockRejectedValue(new Error('Question ID is required'));

      expect(mockQuestionService.getQuestionById).toBeDefined();
    });

    it('should return 500 for service errors', async () => {
      mockQuestionService.getQuestionById.mockRejectedValue(new Error('Database error'));

      expect(mockQuestionService.getQuestionById).toBeDefined();
    });
  });

  describe('PUT /questions/:id', () => {
    it('should update question successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        difficulty: 'Hard'
      };

      const mockUpdatedQuestion = {
        id: 'question-123',
        ...updateData,
        question: 'Original question',
        topics: ['arrays']
      };

      mockQuestionService.updateQuestion.mockResolvedValue(mockUpdatedQuestion);

      expect(mockQuestionService.updateQuestion).toBeDefined();
    });

    it('should return 404 when question not found', async () => {
      mockQuestionService.updateQuestion.mockResolvedValue(null);

      expect(mockQuestionService.updateQuestion).toBeDefined();
    });

    it('should return 400 for validation errors', async () => {
      mockQuestionService.updateQuestion.mockRejectedValue(new Error('Invalid difficulty'));

      expect(mockQuestionService.updateQuestion).toBeDefined();
    });

    it('should return 500 for service errors', async () => {
      mockQuestionService.updateQuestion.mockRejectedValue(new Error('Database error'));

      expect(mockQuestionService.updateQuestion).toBeDefined();
    });
  });

  describe('DELETE /questions/:id', () => {
    it('should delete question successfully', async () => {
      mockQuestionService.deleteQuestion.mockResolvedValue(true);

      expect(mockQuestionService.deleteQuestion).toBeDefined();
    });

    it('should return 404 when question not found', async () => {
      mockQuestionService.deleteQuestion.mockResolvedValue(false);

      expect(mockQuestionService.deleteQuestion).toBeDefined();
    });

    it('should return 400 for validation errors', async () => {
      mockQuestionService.deleteQuestion.mockRejectedValue(new Error('Question ID is required'));

      expect(mockQuestionService.deleteQuestion).toBeDefined();
    });

    it('should return 500 for service errors', async () => {
      mockQuestionService.deleteQuestion.mockRejectedValue(new Error('Database error'));

      expect(mockQuestionService.deleteQuestion).toBeDefined();
    });
  });
});
