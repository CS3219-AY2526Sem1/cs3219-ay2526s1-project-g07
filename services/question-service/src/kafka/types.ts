// Kafka message types for question service

// Message received from matching-service on matching-success topic
export interface MatchingSuccessMessage {
  userId: string;  // user1
  peerId: string;  // user2
  preferences: {
    topic: string;
    difficulty: string;
  };
}

// Message sent to question-success topic
export interface QuestionSuccessMessage {
  userId: string;
  peerId: string;
  questionId: string;
  title: string;
  question: string;
  difficulty: string;
  topic: string;
  timestamp: number;
}

export interface QuestionErrorMessage {
  userId: string;
  peerId: string;
  error: string;
  timestamp: number;
}
