import { Matcher } from '../../src/matcher.ts';
import redis from 'redis';

export class MockMatcher extends Matcher {
  constructor(redisClient: redis.RedisClientType) {
    super(redisClient);
  }
}
