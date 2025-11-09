import { questionRepository } from '../repositories/questionRepository.js';

interface CreateQuestionData {
  title: string;
  question: string;
  difficulty: string;
  topics: string[];
}

export const questionService = {
  async createQuestion(data: CreateQuestionData) {
    // Validate input
    if (!data.title?.trim()) {
      throw new Error('Title is required');
    }
    
    if (!data.question?.trim()) {
      throw new Error('Question description is required');
    }
    
    if (!data.difficulty?.trim()) {
      throw new Error('Difficulty is required');
    }
    
    if (!data.topics || data.topics.length === 0) {
      throw new Error('At least one topic is required');
    }
    
    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(data.difficulty)) {
      throw new Error('Invalid difficulty. Must be Easy, Medium, or Hard');
    }
    
    return await questionRepository.createQuestion(data);
  },

  async getAllQuestions() {
    return await questionRepository.getAllQuestions();
  },

  async getQuestionById(id: string) {
    if (!id?.trim()) {
      throw new Error('Question ID is required');
    }
    
    return await questionRepository.getQuestionById(id);
  },

  async updateQuestion(id: string, data: Partial<CreateQuestionData>) {
    if (!id?.trim()) {
      throw new Error('Question ID is required');
    }
    
    // Validate difficulty if provided
    if (data.difficulty) {
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (!validDifficulties.includes(data.difficulty)) {
        throw new Error('Invalid difficulty. Must be Easy, Medium, or Hard');
      }
    }
    
    return await questionRepository.updateQuestion(id, data);
  },

  async deleteQuestion(id: string) {
    if (!id?.trim()) {
      throw new Error('Question ID is required');
    }
    
    return await questionRepository.deleteQuestion(id);
  },

  // From ChatGPT
  async findMatchingQuestion(difficulty: string, topics: string[]) {
    if (!difficulty?.trim()) {
      throw new Error('Difficulty is required');
    }
    
    if (!topics || topics.length === 0) {
      throw new Error('At least one topic is required');
    }
    
    return await questionRepository.findMatchingQuestion(difficulty, topics);
  }
};