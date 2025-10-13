export interface UserMatchingRequest {
  userId: number;
  preferences: MatchPreference;
  timestamp: number;
}

export interface MatchPreference {
  topic: string;
  difficulty: Difficulty;
}

export interface MatchResult {
  firstUserId: number;
  secondUserId: number;
  preferences: MatchPreference;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
