// Kafka message types for question service

// Message received from matching-service on matching-success topic
export interface MatchingSuccessMessage {
  user1: string;
  user2: string;
  preferences: {
    topic: string;
    difficulty: string;
  };
}

// Message sent to question-success topic
export interface QuestionSuccessMessage {
  user1: string;
  user2: string;
  questionId: string;
  title: string;
  question: string;
  difficulty: string;
  topic: string;
  timestamp: number;
}

export interface QuestionErrorMessage {
  user1: string;
  user2: string;
  error: string;
  timestamp: number;
}
