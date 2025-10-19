import type { UserMatchingRequest, Difficulty, MatchResult } from './types.ts';
import { EventEmitter } from 'events';
import { MatchCriteria } from './match-criteria.ts';
import Redis from 'redis';

export class Matcher {
  private readonly redisClient: Redis.RedisClientType;
  static readonly redisCacheKey = 'matching_queue';
  matchInterval = 5000; // Interval to check for matches in milliseconds
  timeOutDuration = 120000; // Timeout duration for user requests in milliseconds
  emitter: EventEmitter;

  constructor(redisClient: Redis.RedisClientType) {
    this.emitter = new EventEmitter();
    this.redisClient = redisClient;
    setInterval(() => {
      this.tryFindMatch();
      this.tryTimeOut();
    }, this.matchInterval);
  }

  async enqueue(userId: number, preferences: { topic: string; difficulty: string }) {
    const userRequest: UserMatchingRequest = {
      userId: userId,
      preferences: {
        topic: preferences.topic,
        difficulty: preferences.difficulty as Difficulty
      },
      timestamp: Date.now()
    };

    // Avoid duplicate entries for the same user
    await this.dequeue(userId);
    this.redisClient.rPush(Matcher.redisCacheKey, JSON.stringify(userRequest));
    console.log(`User ${userId} with preference ${preferences.topic} and ${preferences.difficulty} added to the matching queue.`);
  }

  async dequeue(userId: number) {
    const userRequests = await this.queue;

    const filteredRequests = userRequests.filter(request => {
      return request.userId !== userId;
    });

    await this.redisClient.del(Matcher.redisCacheKey);

    for (const request of filteredRequests) {
      await this.redisClient.rPush(Matcher.redisCacheKey, JSON.stringify(request));
    }

    console.log(`User ${userId} removed from the matching queue.`);
  }

  private async tryTimeOut() {
    const userRequests = await this.queue;
    const validRequests: UserMatchingRequest[] = [];
    const timedOutRequests: UserMatchingRequest[] = [];

    for (const req of userRequests) {
      if (this.isTimedOut(req.timestamp)) {
        timedOutRequests.push(req);
      } else {
        validRequests.push(req);
      }
    }

    if (timedOutRequests.length > 0) {
      // Replace the queue with only valid requests
      await this.redisClient.del(Matcher.redisCacheKey);
      if (validRequests.length > 0) {
        await this.redisClient.rPush(Matcher.redisCacheKey, validRequests.map(r => JSON.stringify(r)));
      }

      // Notify timed-out users
      for (const req of timedOutRequests) {
        console.log(`⏱️ User ${req.userId} request timed out.`);
        // e.g., this.webSocket.emitToUser(req.userId, { event: 'timeout' });
      }
    }
  }

  private isTimedOut(requestTimestamp: number): boolean {
    return (Date.now() - requestTimestamp) >= this.timeOutDuration;
  }

  private async tryFindMatch() {
    const match = await this.findMatch();
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

  private async findMatch(): Promise<MatchResult | null> {
    const userRequests = await this.queue;
    if (userRequests.length < 2) {
      return null; // Not enough users to match
    }

    const firstUser = userRequests[0];
    for (let i = 1; i < userRequests.length; i++) {
      const potentialMatch = userRequests[i];
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

  private get queue(): Promise<UserMatchingRequest[]> {
    return this.redisClient.lRange(Matcher.redisCacheKey, 0, -1)
      .then(requests => requests.map(request => JSON.parse(request) as UserMatchingRequest));
  }
}
