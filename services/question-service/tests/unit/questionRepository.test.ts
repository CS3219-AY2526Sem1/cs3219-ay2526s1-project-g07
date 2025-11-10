import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../src/db/connection.js';
import { questionRepository } from '../../src/repositories/questionRepository.js';

// Mock the database connection
vi.mock('../../src/db/connection.js', () => ({
  db: {
    query: vi.fn(),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123'),
}));

describe('QuestionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('should create a question successfully', async () => {
      const questionData = {
        title: 'Test Question',
        question: 'What is the answer?',
        difficulty: 'Easy',
        topics: ['arrays', 'strings']
      };

      const mockCreatedQuestion = {
        id: 'test-uuid-123',
        ...questionData
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockCreatedQuestion],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.createQuestion(questionData);

      expect(result).toEqual(mockCreatedQuestion);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "question"'),
        [
          'test-uuid-123',
          questionData.title,
          questionData.question,
          questionData.difficulty,
          questionData.topics
        ]
      );
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(
        questionRepository.createQuestion({
          title: 'Test',
          question: 'Q',
          difficulty: 'Easy',
          topics: ['test']
        })
      ).rejects.toThrow('Failed to create question');
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
          topics: ['graphs', 'trees']
        }
      ];

      vi.mocked(db.query).mockResolvedValue({
        rows: mockQuestions,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.getAllQuestions();

      expect(result).toEqual(mockQuestions);
      expect(result).toHaveLength(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY title ASC')
      );
    });

    it('should return empty array when no questions exist', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.getAllQuestions();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(questionRepository.getAllQuestions()).rejects.toThrow('Failed to fetch questions');
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

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockQuestion],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.getQuestionById('question-123');

      expect(result).toEqual(mockQuestion);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        ['question-123']
      );
    });

    it('should return null when question does not exist', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.getQuestionById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database connection failed'));

      await expect(questionRepository.getQuestionById('q1')).rejects.toThrow('Failed to fetch question');
    });
  });

  describe('updateQuestion', () => {
    it('should update all fields', async () => {
      const updateData = {
        title: 'Updated Title',
        question: 'Updated question',
        difficulty: 'Hard',
        topics: ['new-topic']
      };

      const mockUpdatedQuestion = {
        id: 'q1',
        ...updateData
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockUpdatedQuestion],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.updateQuestion('q1', updateData);

      expect(result).toEqual(mockUpdatedQuestion);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "question"'),
        expect.arrayContaining([
          'Updated Title',
          'Updated question',
          'Hard',
          ['new-topic'],
          'q1'
        ])
      );
    });

    it('should update only title', async () => {
      const updateData = { title: 'New Title' };
      const mockUpdatedQuestion = {
        id: 'q1',
        title: 'New Title',
        question: 'Q',
        difficulty: 'Easy',
        topics: ['test']
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockUpdatedQuestion],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.updateQuestion('q1', updateData);

      expect(result).toEqual(mockUpdatedQuestion);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('title = $1'),
        expect.arrayContaining(['New Title', 'q1'])
      );
    });

    it('should update only difficulty', async () => {
      const updateData = { difficulty: 'Hard' };
      const mockUpdatedQuestion = {
        id: 'q1',
        title: 'Title',
        question: 'Q',
        difficulty: 'Hard',
        topics: ['test']
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockUpdatedQuestion],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await questionRepository.updateQuestion('q1', updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('difficulty = $1'),
        expect.arrayContaining(['Hard', 'q1'])
      );
    });

    it('should update only topics', async () => {
      const updateData = { topics: ['arrays', 'sorting'] };
      const mockUpdatedQuestion = {
        id: 'q1',
        title: 'Title',
        question: 'Q',
        difficulty: 'Easy',
        topics: ['arrays', 'sorting']
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockUpdatedQuestion],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await questionRepository.updateQuestion('q1', updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('topics = $1'),
        expect.arrayContaining([['arrays', 'sorting'], 'q1'])
      );
    });

    it('should return null when question does not exist', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.updateQuestion('non-existent', { title: 'New' });

      expect(result).toBeNull();
    });

    it('should throw error when no fields to update', async () => {
      await expect(questionRepository.updateQuestion('q1', {})).rejects.toThrow('Failed to update question');
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(
        questionRepository.updateQuestion('q1', { title: 'New' })
      ).rejects.toThrow('Failed to update question');
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question successfully', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'DELETE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.deleteQuestion('question-123');

      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM "question"'),
        ['question-123']
      );
    });

    it('should return false when question does not exist', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'DELETE',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.deleteQuestion('non-existent');

      expect(result).toBe(false);
    });

    it('should handle null rowCount', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'DELETE',
        rowCount: null,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.deleteQuestion('q1');

      expect(result).toBe(false);
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(questionRepository.deleteQuestion('q1')).rejects.toThrow('Failed to delete question');
    });
  });

  describe('findMatchingQuestion', () => {
    it('should find matching question by difficulty and topic', async () => {
      const mockQuestion = {
        id: 'q1',
        title: 'Array Question',
        question: 'Sort an array',
        difficulty: 'Medium',
        topics: ['arrays', 'sorting']
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockQuestion],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.findMatchingQuestion('Medium', ['arrays']);

      expect(result).toEqual(mockQuestion);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(difficulty) = LOWER($1)'),
        ['Medium', 'arrays']
      );
    });

    it('should return null when no matching question found', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await questionRepository.findMatchingQuestion('Easy', ['rare-topic']);

      expect(result).toBeNull();
    });

    it('should use case-insensitive matching', async () => {
      const mockQuestion = {
        id: 'q1',
        title: 'Test',
        question: 'Q',
        difficulty: 'easy',
        topics: ['ARRAYS']
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockQuestion],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await questionRepository.findMatchingQuestion('EASY', ['arrays']);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(difficulty)'),
        ['EASY', 'arrays']
      );
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(
        questionRepository.findMatchingQuestion('Easy', ['arrays'])
      ).rejects.toThrow('Failed to find matching question');
    });
  });
});
