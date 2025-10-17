import type { UserMatchingRequest } from "./types.ts"

export class MatchCriteria {
  static isMatch(firstUser: UserMatchingRequest, potentialMatch: UserMatchingRequest): boolean {
      return firstUser.preferences.topic === potentialMatch.preferences.topic &&
            firstUser.preferences.difficulty === potentialMatch.preferences.difficulty
  }
}