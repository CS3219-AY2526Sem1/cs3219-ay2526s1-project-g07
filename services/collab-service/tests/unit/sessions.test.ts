import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid'; // Import v4 for mocking purposes
import {
  addSession,
  removeSession,
  checkSessionAndUsers,
  generateRandomSessionId,
  getSessionDetails,
  getSessions, // New function for testing access
} from '../../src/sessions.js';
import type { SessionDetails } from '../../src/types.js';

// --- Setup Mocks for uuid ---
// Mocking the 'uuid' library to return a predictable value for generateRandomSessionId
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234'),
}));

const DUMMY_SESSION_DETAILS: SessionDetails = {
    user1: 'test-user-a',
    user2: 'test-user-b',
    questionId: 'q-1',
    title: 'Test Title',
    question: 'Test Question',
    difficulty: 'Easy',
    categories: 'Algorithms',
};

// Define the initial state (the "dummyId" session) for re-initialization
const INITIAL_SESSION_ID = 'dummyId';
const INITIAL_SESSION_DETAILS: SessionDetails = {
    user1: "user1",
    user2: "user2",
    questionId: "dummy-question-id",
    title: "dummy-title",
    question: "dummy-question",
    difficulty: "dummy-difficulty",
    categories: "dummy-category",
};

describe('Session Management Unit Tests', () => {

  // CRITICAL: Reset the global state before each test
  beforeEach(() => {
    // 1. Clear all current sessions
    const sessions = getSessions();
    sessions.clear();

    // 2. Restore the required initial state
    sessions.set(INITIAL_SESSION_ID, INITIAL_SESSION_DETAILS);
    
    // 3. Reset the uuid mock for predictable ID generation
    vi.mocked(uuidv4).mockClear();
    vi.mocked(uuidv4).mockReturnValue('mock-uuid-1234' as any);
  });

  describe('addSession and getSessions', () => {
    it('should add a new session and increase the session count', () => {
      // Starting state should have 1 session (dummyId)
      expect(getSessions().size).toBe(1);

      addSession('new-sess-1', DUMMY_SESSION_DETAILS);

      // Verify the count increased
      const sessions = getSessions();
      expect(sessions.size).toBe(2);
      
      // Verify the new session exists and has correct details
      const newSession = sessions.get('new-sess-1');
      expect(newSession).toBeDefined();
      expect(newSession?.title).toBe('Test Title');
    });

    it('should overwrite an existing session if addSession is called with the same ID', () => {
        const OVERWRITE_DETAILS: SessionDetails = {
            user1: 'overwritten-user',
            user2: 'user2',
            questionId: 'dummy-question-id',
            title: 'dummy-title',
            question: 'dummy-question',
            difficulty: 'dummy-difficulty',
            categories: 'dummy-category',
        };
        
        // Overwrite the initial 'dummyId' session
        addSession(INITIAL_SESSION_ID, OVERWRITE_DETAILS);
        
        const sessions = getSessions();
        
        // Total size should still be 1
        expect(sessions.size).toBe(1);
        
        // Details should be the new overwritten ones
        expect(sessions.get(INITIAL_SESSION_ID)?.user1).toBe('overwritten-user');
    });
  });

  describe('getSessionDetails', () => {
    it('should retrieve session details correctly by ID', () => {
      const session = getSessionDetails(INITIAL_SESSION_ID);
      expect(session).toBeDefined();
      expect(session?.user2).toBe('user2');
      expect(session?.difficulty).toBe('dummy-difficulty');
    });

    it('should return undefined for a non-existent session ID', () => {
      expect(getSessionDetails('non-existent')).toBeUndefined();
    });
  });

  describe('removeSession', () => {
    it('should remove an existing session', () => {
      // Pre-condition: session exists
      expect(getSessions().has(INITIAL_SESSION_ID)).toBe(true);
      expect(getSessions().size).toBe(1);

      removeSession(INITIAL_SESSION_ID);
      
      // Post-condition: session is gone
      expect(getSessions().has(INITIAL_SESSION_ID)).toBe(false);
      expect(getSessions().size).toBe(0);
    });
    
    it('should do nothing if the session does not exist', () => {
        // Should not throw an error and size should remain 1
        removeSession('definitely-not-here');
        expect(getSessions().size).toBe(1);
        expect(getSessions().has(INITIAL_SESSION_ID)).toBe(true);
    });
  });

  describe('checkSessionAndUsers', () => {
    it('should return true if the userId matches user1', () => {
      expect(checkSessionAndUsers(INITIAL_SESSION_ID, 'user1')).toBe(true);
    });

    it('should return true if the userId matches user2', () => {
      expect(checkSessionAndUsers(INITIAL_SESSION_ID, 'user2')).toBe(true);
    });

    it('should return false for a user not in the session', () => {
      expect(checkSessionAndUsers(INITIAL_SESSION_ID, 'test-user-c')).toBe(false);
    });

    it('should return false for a non-existent session', () => {
      expect(checkSessionAndUsers('non-existent-sess', 'user1')).toBe(false);
    });
  });

  describe('generateRandomSessionId', () => {
    it('should call uuidv4 and return the mocked ID', () => {
      const id = generateRandomSessionId();
      
      // Verify the mock was called
      expect(vi.mocked(uuidv4)).toHaveBeenCalledTimes(1);
      
      // Verify the predictable result
      expect(id).toBe('mock-uuid-1234');
    });
  });
});