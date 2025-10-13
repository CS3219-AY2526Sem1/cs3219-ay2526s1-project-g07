// Kafka message types for question service

export interface QuestionRequestMessage {
  requestId: string;
  userId1: string;
  userId2: string;
  difficulty: string;
  categories: string[];
  timestamp: number;
}

export interface QuestionSuccessMessage {
  requestId: string;
  userId1: string;
  userId2: string;
  questionId: string;
  title: string;
  question: string;
  difficulty: string;
  categories: string[];
  timestamp: number;
}

export interface QuestionErrorMessage {
  requestId: string;
  userId1: string;
  userId2: string;
  error: string;
  timestamp: number;
}
