import { questionRepository } from '../repositories/questionRepository.js';

interface CreateQuestionData {
  title: string;
  question: string;
  difficulty: string;
  categories: string[];
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
    
    if (!data.categories || data.categories.length === 0) {
      throw new Error('At least one category is required');
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
  async findMatchingQuestion(difficulty: string, categories: string[]) {
    if (!difficulty?.trim()) {
      throw new Error('Difficulty is required');
    }
    
    if (!categories || categories.length === 0) {
      throw new Error('At least one category is required');
    }
    
    return await questionRepository.findMatchingQuestion(difficulty, categories);
  }
};