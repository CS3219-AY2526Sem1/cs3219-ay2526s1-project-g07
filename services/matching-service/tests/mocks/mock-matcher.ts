import { RedisClient } from '@peerprep/redis/client.js';
import { Matcher } from '../../src/matcher.ts';

export class MockMatcher extends Matcher {
  constructor(redisClient: RedisClient) {
    super(redisClient);
  }
}
