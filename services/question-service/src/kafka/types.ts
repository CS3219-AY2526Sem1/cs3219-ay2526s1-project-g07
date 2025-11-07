// Kafka message types for question service

// Message received from matching-service on matching-success topic
export interface MatchingSuccessMessage {
  userId: { id: string } | string;  // user1 - can be object or string
  peerId: { id: string } | string;  // user2 - can be object or string
  preferences: {
    topic: string;
    difficulty: string;
  };
}

// Message sent to question-success topic
export interface QuestionSuccessMessage {
  userId: string;  // Actual ID string extracted from object
  peerId: string;  // Actual ID string extracted from object
  questionId: string;
  title: string;
  question: string;
  difficulty: string;
  topic: string;
  timestamp: number;
}

export interface QuestionErrorMessage {
  userId: string;  // Actual ID string extracted from object
  peerId: string;  // Actual ID string extracted from object
  error: string;
  timestamp: number;
}
