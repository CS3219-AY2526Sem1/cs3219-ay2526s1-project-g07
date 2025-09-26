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

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}
