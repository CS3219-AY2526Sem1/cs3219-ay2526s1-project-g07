import { MatchCriteria } from '../src/match-criteria.ts';
import type { UserMatchingRequest } from '../../../shared/types/matching-types.ts';

describe('MatchCriteria', () => {
  it('should return true for matching preferences', () => {
    const user1: UserMatchingRequest = {
      userId: { id: '1' },
      preferences: { topic: 'Math', difficulty: 'easy' },
      timestamp: Date.now()
    };
    const user2: UserMatchingRequest = {
      userId: { id: '2' },
      preferences: { topic: 'Math', difficulty: 'easy' },
      timestamp: Date.now()
    };
    expect(MatchCriteria.isMatch(user1, user2)).toBeTrue();
  });

  it('should return false for non-matching preferences', () => {
    const user1: UserMatchingRequest = {
      userId: { id: '1' },
      preferences: { topic: 'Math', difficulty: 'easy' }, 
      timestamp: Date.now()
    };
    const user2: UserMatchingRequest = {
      userId: { id: '2' },
      preferences: { topic: 'Science', difficulty: 'medium' },
      timestamp: Date.now()
    };
    expect(MatchCriteria.isMatch(user1, user2)).toBeFalse();
  });
});
