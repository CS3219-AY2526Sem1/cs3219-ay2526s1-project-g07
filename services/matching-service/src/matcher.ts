import type { UserMatchingRequest, Difficulty, MatchResult, UserId } from '../../../shared/types/matching-types.ts';
import { EventEmitter } from 'events';
import { MatchCriteria } from './match-criteria.ts';
import { type RedisClientType } from 'redis';
import { randomUUID } from 'crypto';
import { RedisClient } from '../../../redis/client.ts';

export class Matcher {
  private readonly redisClient: RedisClientType;
  static readonly redisCacheKey = 'matching_queue';
  matchInterval = 5000; // Interval to check for matches in milliseconds
  timeOutDuration = 120000; // Timeout duration for user requests in milliseconds
  emitter: EventEmitter;

  constructor(redisClient: RedisClientType) {
    this.emitter = new EventEmitter();
    this.redisClient = redisClient;
    setInterval(() => {
      this.tryFindMatch();
      this.tryTimeOut();
    }, this.matchInterval);
  }

  async enqueue(userId: UserId, preferences: { topic: string; difficulty: Difficulty }) {
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

    await this.redisClient.rPush(Matcher.redisCacheKey, JSON.stringify(userRequest));

    console.log(`User ${userId} with preference ${preferences.topic} and ${preferences.difficulty} added to the matching queue.`);
  }

  async dequeue(userId: UserId) {
    const lockKey = 'dequeue_lock';
    // Unique value for this lock instance, preventing accidental releases by other processes
    const lockValue = randomUUID();

    const acquired = await this.redisClient.set(lockKey, lockValue, {
      NX: true,
      PX: 5000,
    });

    if (!acquired) {
      await new Promise(res => setTimeout(res, 50));
      console.log(`Retrying dequeue for user ${userId}`);
      return this.dequeue(userId);
    }

    try {
      const userRequests = await this.queue;
      const filteredRequests = userRequests.filter(r => r.userId.id !== userId.id);

      await this.redisClient.del(Matcher.redisCacheKey);
      for (const r of filteredRequests) {
        await this.redisClient.rPush(Matcher.redisCacheKey, JSON.stringify(r));
      }

      console.log(`✅ User ${userId} removed from the matching queue.`);
    } finally {
      // Release lock safely
      const releaseLockLuaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await this.redisClient.eval(releaseLockLuaScript, {
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
    const timedOutRaw: string[] = await this.redisClient.eval(getTimedOutLuaScript, {
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
    await RedisClient.quit();
    console.log('Matcher cleanup completed.');
  }

  private get queue(): Promise<UserMatchingRequest[]> {
    return this.redisClient.lRange(Matcher.redisCacheKey, 0, -1)
      .then(requests => requests.map(request => JSON.parse(request) as UserMatchingRequest));
  }
}
