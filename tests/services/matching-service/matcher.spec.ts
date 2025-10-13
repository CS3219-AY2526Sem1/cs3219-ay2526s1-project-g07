import { Matcher } from '../../../services/matching-service/matcher.ts';

describe('Matcher', () => {
  let matcher: Matcher;

  beforeEach(() => {
    matcher = new Matcher();
  });

  it('should enqueue a user matching request', () => {
    matcher.enqueue(1, { topic: 'Math', difficulty: 'Easy' });
    expect(matcher.queue.length).toBe(1);
    expect(matcher.queue[0].userId).toBe(1);
    expect(matcher.queue[0].preferences.topic).toBe('Math');
    expect(matcher.queue[0].preferences.difficulty).toBe('Easy');
  });
  
});
