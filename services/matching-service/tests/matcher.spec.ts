import { Matcher } from '../src/matcher.ts';
import { RedisClient } from '../src/redis/client.ts';
import { type UserMatchingRequest } from '../src/types.ts';

describe('Matcher', () => {
  let matcher: Matcher;
  let redisClient: RedisClient;

  beforeEach(() => {
    redisClient = RedisClient.createClient() as unknown as RedisClient;
    matcher = new Matcher(redisClient as any);

    function mockSetInterval() {
      return 1;
    }
    // Mock setInterval to prevent actual intervals during tests
    spyOn(global, 'setInterval').and.callFake(mockSetInterval as any);
  });

  describe('enqueue', () => {
    it('should enqueue a user matching request', async () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(1);
      expect(queue[0].userId).toBe(1);
      expect(queue[0].preferences.topic).toBe('Math');
      expect(queue[0].preferences.difficulty).toBe('Easy');
    });

    it('should handle multiple enqueues', async () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.enqueue(2, { topic: 'Science', difficulty: 'Medium' });
      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(2);
    });

    it('should not enqueue duplicate user IDs', async () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.enqueue(1, { topic: 'Science', difficulty: 'Medium' });
      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue[0].preferences.topic).toBe('Science');
    });
  });

  describe('dequeue', () => {
    it('should dequeue a user matching request', async () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.dequeue(1);
      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(0);
    });

    it('should handle dequeueing a non-existent user ID gracefully', async () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.dequeue(2);
      const queue: UserMatchingRequest[] = await matcher['queue'];
      expect(queue.length).toBe(1); 
    });
  });

  describe('findMatch', () => {
    it('should find a match based on preferences', async () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.enqueue(2, { topic: 'Math', difficulty: 'Easy' });
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
  
});
