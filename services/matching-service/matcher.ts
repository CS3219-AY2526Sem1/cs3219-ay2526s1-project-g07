import type { UserMatchingRequest, Difficulty, MatchResult } from './types.ts';
import { EventEmitter } from 'events';
import { MatchCriteria } from './match-criteria.ts';

export class Matcher {
  queue: UserMatchingRequest[];
  matchInterval = 5000; // Interval to check for matches in milliseconds
  timeOutDuration = 120000; // Timeout duration for user requests in milliseconds
  emitter: EventEmitter;

  constructor() {
    this.queue = [];
    this.emitter = new EventEmitter();
    setInterval(() => {
      this.tryFindMatch();
      this.tryTimeOut();
    }, this.matchInterval);
  }

  enqueue(userId: number, preferences: { topic: string; difficulty: string }) {
    const userRequest: UserMatchingRequest = {
      userId: userId,
      preferences: {
        topic: preferences.topic,
        difficulty: preferences.difficulty as Difficulty
      },
      timestamp: Date.now()
    };
    this.queue.push(userRequest);
    console.log(`User ${userId} with preference ${preferences.topic} and ${preferences.difficulty} added to the matching queue.`);
  }

  dequeue(userId: number) {
    this.queue = this.queue.filter(request => request.userId !== userId);
    console.log(`User ${userId} removed from the matching queue.`);
  }

  private tryTimeOut() {
    const timedOutRequests = this.queue.filter(request => !this.isTimedOut(request.timestamp));

    if (timedOutRequests.length > 0) {
      this.queue = this.queue.filter(request => !this.isTimedOut(request.timestamp));
      timedOutRequests.forEach(request => {
        console.log(`User ${request.userId} request timed out.`);
        // Use web-socket to notify user of timeout.
      });
    }
  }

  private isTimedOut(requestTimestamp: number): boolean {
    return (Date.now() - requestTimestamp) >= this.timeOutDuration;
  }

  private tryFindMatch() {
    const match = this.findMatch();
    if (match) {
      this.handleMatchFound(match);
    } else {
      this.handleNoMatch();
    }
  }

  private handleMatchFound(match: MatchResult) {
    const { firstUserId, secondUserId, preferences: {topic, difficulty} } = match;
    this.emitter.emit('matchFound', match);
    console.log(`Match found between users ${firstUserId} and ${secondUserId} with topic ${topic} and difficulty ${difficulty}`);
  }

  private handleNoMatch() {
    console.log('No suitable match found at this time.');
  }

  private findMatch(): MatchResult | null {
    if (this.queue.length < 2) {
      return null; // Not enough users to match
    }

    const firstUser = this.queue[0];
    for (let i = 1; i < this.queue.length; i++) {
      const potentialMatch = this.queue[i];
      if (MatchCriteria.isMatch(firstUser, potentialMatch)) {
        // Found a match
        this.dequeue(firstUser.userId);
        this.dequeue(potentialMatch.userId);
        console.log(`Matched users ${firstUser.userId} and ${potentialMatch.userId}`);
        return {
          firstUserId: firstUser.userId,
          secondUserId: potentialMatch.userId,
          preferences: firstUser.preferences
        };
      }
    }
    return null; // No match found
  }
}
