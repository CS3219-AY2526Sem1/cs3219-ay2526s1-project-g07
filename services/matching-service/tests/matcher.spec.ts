import { Matcher } from '../src/matcher.ts';
import { RedisClient } from '../src/redis/client.ts';
import { type UserMatchingRequest } from '../src/types.ts';
import redis from 'redis';

describe('Matcher', () => {
  let matcher: Matcher;
  let redisClient: redis.RedisClientType;
  const cacheKey = Matcher.redisCacheKey;

  beforeAll(async () => {
    redisClient = await RedisClient.createClient() as redis.RedisClientType;
  });

  beforeEach(async () => {
    await redisClient.del(cacheKey);

    matcher = new Matcher(redisClient);

    function mockSetInterval() {
      return 1;
    }
    // Mock setInterval to prevent actual intervals during tests
    spyOn(global, 'setInterval').and.callFake(mockSetInterval as any);
  });

  afterAll(async () => {
    await matcher.cleanUp();
  });

  describe('enqueue', () => {
    it('should enqueue a user matching request', async () => {
      await matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' });

      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(1);
      expect(queue[0].userId).toBe(1);
      expect(queue[0].preferences.topic).toBe('Math');
      expect(queue[0].preferences.difficulty).toBe('easy');
    });

    it('should handle multiple enqueues', async () => {
      await matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' });
      await matcher.enqueue(2, { topic: 'BST', difficulty: 'medium' });

      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(2);
    });

    it('should not enqueue duplicate user IDs', async () => {
      await matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' });
      await matcher.enqueue(1, { topic: 'BST', difficulty: 'medium' });

      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue[0].preferences.topic).toBe('BST');
    });

    it('should handle concurrent enqueues correctly', async () => {
      const enqueuePromises = [
        matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' }),
        matcher.enqueue(2, { topic: 'BST', difficulty: 'medium' }),
        matcher.enqueue(3, { topic: 'Array', difficulty: 'hard' }),
        matcher.enqueue(4, { topic: 'Shell', difficulty: 'easy' }),
        matcher.enqueue(5, { topic: 'Dynamic Programming', difficulty: 'medium' }),
      ];
      await Promise.all(enqueuePromises);

      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(5);
    });
  });

  describe('dequeue', () => {
    it('should dequeue a user matching request', async () => {
      await matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' });
      await matcher.dequeue(1);

      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(0);
    });

    it('should handle dequeueing a non-existent user ID gracefully', async () => {
      await matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' });
      await matcher.dequeue(2);

      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(1); 
      expect(queue[0].userId).toBe(1);
    });

    it('should handle concurrent dequeues correctly', async () => {
      await matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' });
      await matcher.enqueue(2, { topic: 'BST', difficulty: 'medium' });
      await matcher.enqueue(3, { topic: 'Array', difficulty: 'hard' });
      await matcher.enqueue(4, { topic: 'Shell', difficulty: 'easy' });
      await matcher.enqueue(5, { topic: 'Dynamic Programming', difficulty: 'medium' });

      const dequeuePromises = [
        matcher.dequeue(1),
        matcher.dequeue(2),
        matcher.dequeue(3),
        matcher.dequeue(4),
        matcher.dequeue(5),
      ];
      await Promise.all(dequeuePromises);

      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(0);
    });
  });

  describe('findMatch', () => {
    it('should find a match based on preferences', async () => {
      await matcher.enqueue(1, { topic: 'Math', difficulty: 'easy' });
      await matcher.enqueue(2, { topic: 'Math', difficulty: 'easy' });
      // Ensure the private method is called
      const spyFindMatch = spyOn(matcher as any, 'findMatch').and.callThrough();

      // Call the private method
      const match = await matcher['findMatch'](); 
      expect(spyFindMatch).toHaveBeenCalled();
      expect(match).not.toBeNull();

      const ids = [match?.firstUserId, match?.secondUserId];
      expect(ids).toContain(1);
      expect(ids).toContain(2);
    });
  });

  describe('timedOut', () => {
    describe('isTimedOut', () => {
      it('should return true for boundary timed out requests', () => {
        const pastTimestamp = Date.now() - matcher.timeOutDuration; // Right on the boundary of timeout
        const result = matcher['isTimedOut'](pastTimestamp);

        expect(result).toBeTrue();
      });

      it('should return true for clearly timed out requests', () => {
        const pastTimestamp = Date.now() - (matcher.timeOutDuration + 1000); // Beyond the timeout duration
        const result = matcher['isTimedOut'](pastTimestamp);
        expect(result).toBeTrue();
      });

      it('should return false for non-timed out requests', () => {
        const recentTimestamp = Date.now() - (matcher.timeOutDuration / 2); // Well within the timeout duration
        const result = matcher['isTimedOut'](recentTimestamp);
        expect(result).toBeFalse();
      });

      it('should return false for boundary non-timed out requests', () => {
        const recentTimestamp = Date.now() - (matcher.timeOutDuration - 1); // Just within the timeout duration
        const result = matcher['isTimedOut'](recentTimestamp);
        expect(result).toBeFalse();
      });
    });

    describe('tryTimeOut', () => {
      it('should remove timed out requests from the queue', async () => {
        const tryTimedOutSpy = spyOn(matcher as any, 'tryTimeOut').and.callThrough();

        const pastOffset = matcher.timeOutDuration + 1000;
        const pastTimestamp = Date.now() - pastOffset;
        const currentTimestamp = Date.now();
        const timedOutRequest: UserMatchingRequest = {
          userId: 1,
          preferences: { topic: 'Math', difficulty: 'easy' },
          timestamp: pastTimestamp,
        };
        const validRequest: UserMatchingRequest = {
          userId: 2,
          preferences: { topic: 'Science', difficulty: 'medium' },
          timestamp: currentTimestamp,
        };

        await redisClient.rPush(cacheKey, JSON.stringify(timedOutRequest));
        await redisClient.rPush(cacheKey, JSON.stringify(validRequest));
        await matcher['tryTimeOut']();

        expect(tryTimedOutSpy).toHaveBeenCalled();
        const queue: UserMatchingRequest[] = await matcher['queue'];
        expect(queue.length).toBe(1);
        expect(queue[0].userId).toBe(2);
      });

      it('should not remove valid requests from the queue', async () => {
        const tryTimedOutSpy = spyOn(matcher as any, 'tryTimeOut').and.callThrough();
        const currentTimestamp = Date.now();
        const validRequest1: UserMatchingRequest = {
          userId: 1,
          preferences: { topic: 'Math', difficulty: 'easy' },
          timestamp: currentTimestamp,
        };
        const validRequest2: UserMatchingRequest = {
          userId: 2,
          preferences: { topic: 'Science', difficulty: 'medium' },
          timestamp: currentTimestamp,
        };

        await redisClient.rPush(cacheKey, JSON.stringify(validRequest1));
        await redisClient.rPush(cacheKey, JSON.stringify(validRequest2));
        await matcher['tryTimeOut']();
        expect(tryTimedOutSpy).toHaveBeenCalled();

        const queue: UserMatchingRequest[] = await matcher['queue'];
        expect(queue.length).toBe(2);
      });
    });
  });
});
