"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const match_criteria_1 = require("../src/match-criteria");
describe('MatchCriteria', () => {
    it('should return true for matching preferences', () => {
        const user1 = {
            userId: { id: '1' },
            preferences: { topic: 'Math', difficulty: 'easy' },
            timestamp: Date.now()
        };
        const user2 = {
            userId: { id: '2' },
            preferences: { topic: 'Math', difficulty: 'easy' },
            timestamp: Date.now()
        };
        expect(match_criteria_1.MatchCriteria.isMatch(user1, user2)).toBeTrue();
    });
    it('should return false for non-matching preferences', () => {
        const user1 = {
            userId: { id: '1' },
            preferences: { topic: 'Math', difficulty: 'easy' },
            timestamp: Date.now()
        };
        const user2 = {
            userId: { id: '2' },
            preferences: { topic: 'Science', difficulty: 'medium' },
            timestamp: Date.now()
        };
        expect(match_criteria_1.MatchCriteria.isMatch(user1, user2)).toBeFalse();
    });
});
