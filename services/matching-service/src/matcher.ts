import type { UserMatchingRequest, Difficulty, MatchResult, UserId } from '../../../shared/types/matching-types';
import { EventEmitter } from 'events';
import { MatchCriteria } from './match-criteria';
import { RedisClient } from '../../../redis/src/client';
import { randomUUID } from 'crypto';

export class Matcher {
  private readonly redisClient: RedisClient;
  static readonly redisCacheKey = 'matching_queue';
  matchInterval = 5000; // Interval to check for matches in milliseconds
  timeOutDuration = 120000; // Timeout duration for user requests in milliseconds
  emitter: EventEmitter;

  constructor(redisClient: RedisClient) {
    this.emitter = new EventEmitter();
    this.redisClient = redisClient;
    setInterval(() => {
      this.tryFindMatch();
      this.tryTimeOut();
    }, this.matchInterval);
  }

  async enqueue(userId: UserId, preferences: { topic: string; difficulty: Difficulty }): Promise<void> {
    const userRequest: UserMatchingRequest = {
      userId: userId,
      preferences: {
        topic: preferences.topic,
        difficulty: preferences.difficulty
      },
      timestamp: Date.now()
    };

    const queue = await this.queue;
    if (queue.some(request => request.userId.id === userId.id)) {
      await this.dequeue(userId);
    }

    await this.redisClient.instance.rPush(Matcher.redisCacheKey, JSON.stringify(userRequest));

    console.log(`User ${userId.id} with preference ${preferences.topic} and ${preferences.difficulty} added to the matching queue.`);
  }

  async dequeue(userId: UserId): Promise<void> {
    // For cases where dequeue is called after redis client is closed
    if (!this.redisClient?.instance?.isOpen) {
      return Promise.resolve();
    }

    if (!userId) {
      console.error('dequeue called with invalid userId');
      return Promise.resolve();
    }

    const lockKey = 'dequeue_lock';
    // Unique value for this lock instance, preventing accidental releases by other processes
    const lockValue = randomUUID();

    const acquired = await this.redisClient.instance.set(lockKey, lockValue, {
      NX: true,
      PX: 5000,
    });

    if (!acquired) {
      await new Promise(res => setTimeout(res, 50));
      console.log(`Retrying dequeue for user ${userId.id}`);
      return this.dequeue(userId);
    }

    try {
      const userRequests = await this.queue;
      const filteredRequests = userRequests.filter(r => r.userId.id !== userId.id);

      await this.redisClient.instance.del(Matcher.redisCacheKey);
      for (const r of filteredRequests) {
        await this.redisClient.instance.rPush(Matcher.redisCacheKey, JSON.stringify(r));
      }

      console.log(`✅ User ${userId.id} removed from the matching queue.`);

      this.emitter.emit(MatcherEvents.EVENT_USER_DEQUEUED, userId);
    } finally {
      // Release lock safely
      const releaseLockLuaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await this.redisClient.instance.eval(releaseLockLuaScript, {
        keys: [lockKey],
        arguments: [lockValue],
      });
    }
  }

  private async tryTimeOut() {
    const getTimedOutLuaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local timeout = tonumber(ARGV[2])
      local requests = redis.call('LRANGE', key, 0, -1)
      local valid = {}
      local timedout = {}
      for i, v in ipairs(requests) do
        local ok, req = pcall(cjson.decode, v)
        if ok and req and req.timestamp then
          if (now - req.timestamp) >= timeout then
            table.insert(timedout, v)
          else
            table.insert(valid, v)
          end
        end
      end
      redis.call('DEL', key)
      if #valid > 0 then
        redis.call('RPUSH', key, unpack(valid))
      end
      return timedout
    `;
    const now = Date.now();
    const timeout = this.timeOutDuration;
    // @ts-ignore: redisClient.eval typing may vary
    const timedOutRaw: string[] = await this.redisClient.instance.eval(getTimedOutLuaScript, {
      keys: [Matcher.redisCacheKey],
      arguments: [now.toString(), timeout.toString()]
    });
    if (timedOutRaw && timedOutRaw.length > 0) {
      const timedOutRequests: UserMatchingRequest[] = timedOutRaw.map(request => JSON.parse(request) as UserMatchingRequest);

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
    this.emitter.emit(MatcherEvents.EVENT_MATCH_FOUND, match);
    console.log(`Match found between users ${firstUserId.id} and ${secondUserId.id} with topic ${topic} and difficulty ${difficulty}`);
  }

  private async handleNoMatch() {
    console.log('No suitable match found at this time.');
    console.log(JSON.stringify(await this.queue));
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
        // Found a match, dequeue when a collab session is ready
        console.log(`Matched users ${firstUser.userId.id} and ${potentialMatch.userId.id}`);
        return {
          firstUserId: firstUser.userId,
          secondUserId: potentialMatch.userId,
          preferences: firstUser.preferences
        };
      }
    }
    return null; // No match found
  }

  async cleanUp() {
    await this.redisClient.quit();
    console.log('Matcher cleanup completed.');
  }

  private get queue(): Promise<UserMatchingRequest[]> {
    return this.redisClient.instance.lRange(Matcher.redisCacheKey, 0, -1)
      .then(requests => requests.map(request => JSON.parse(request as string) as UserMatchingRequest));
  }
}

export enum MatcherEvents {
  EVENT_USER_DEQUEUED = 'userDequeued',
  EVENT_MATCH_FOUND = 'matchFound',
}
