export interface UserMatchingRequest {
  userId: UserId;
  preferences: MatchPreference;
  timestamp: number;
}

export interface UserMatchingCancelRequest {
  userId: UserId;
}

export interface MatchingResponse {
  firstUserId: UserId;
  secondUserId: UserId;
  collabSessionId: string;
}

export interface MatchPreference {
  topic: string;
  difficulty: Difficulty;
}

export interface MatchResult {
  firstUserId: UserId;
  secondUserId: UserId;
  preferences: MatchPreference;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface UserId {
  id: string;
}