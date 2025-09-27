export interface UserMatchingRequest {
  userId: number;
  preferences: MatchPreference;
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
