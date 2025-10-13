import { Matcher } from '../src/matcher.ts';

describe('Matcher', () => {
  let matcher: Matcher;

  beforeEach(() => {
    matcher = new Matcher();
    function mockSetInterval() {
      return 1;
    }
    spyOn(global, 'setInterval').and.callFake(mockSetInterval as any);
  });

  describe('enqueue', () => {
    it('should enqueue a user matching request', () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      expect(matcher.queue.length).toBe(1);
      expect(matcher.queue[0].userId).toBe(1);
      expect(matcher.queue[0].preferences.topic).toBe('Math');
      expect(matcher.queue[0].preferences.difficulty).toBe('Easy');
    });

    it('should handle multiple enqueues', () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.enqueue(2, { topic: 'Science', difficulty: 'Medium' });
      expect(matcher.queue.length).toBe(2);
    });

    it('should not enqueue duplicate user IDs', () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.enqueue(1, { topic: 'Science', difficulty: 'Medium' });
      expect(matcher.queue.length).toBe(1);
      expect(matcher.queue[0].preferences.topic).toBe('Science');
    });
  });

  describe('dequeue', () => {
    it('should dequeue a user matching request', () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.dequeue(1);
      expect(matcher.queue.length).toBe(0);
    });

    it('should handle dequeueing a non-existent user ID gracefully', () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.dequeue(2);
      expect(matcher.queue.length).toBe(1);
    });
  });

  describe('findMatch', () => {
    it('should find a match based on preferences', () => {
      matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
      matcher.enqueue(2, { topic: 'Math', difficulty: 'Easy' });
      // Ensure the private method is called
      const spyFindMatch = spyOn(matcher as any, 'findMatch').and.callThrough();

      // Call the private method
      const match = matcher['findMatch'](); 
      expect(spyFindMatch).toHaveBeenCalled();
      expect(match).not.toBeNull();

      const ids = [match?.firstUserId, match?.secondUserId];
      expect(ids).toContain(1);
      expect(ids).toContain(2);
    });
  });
  
});
