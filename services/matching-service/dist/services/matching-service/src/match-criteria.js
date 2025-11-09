"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchCriteria = void 0;
class MatchCriteria {
    static isMatch(firstUser, potentialMatch) {
        return firstUser.preferences.topic === potentialMatch.preferences.topic &&
            firstUser.preferences.difficulty === potentialMatch.preferences.difficulty;
    }
}
exports.MatchCriteria = MatchCriteria;
