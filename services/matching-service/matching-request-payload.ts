export interface MatchingRequestPayload {
  userId: string;
  preferences: {
    topic: string;
    difficulty: Difficulty;
  };
}

enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}
