/*
AI Assistance Disclosure:
Tool: ChatGPT (model: GPT-4.1), date: 2025‑11-10
Scope: Generated Test code for Sessions.
Author review: I validated correctness of the functions, removed unnecessary code, and modified the code to fit the requirements.
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mock External Dependencies
// Mock the 'sessions' module and its function 'getSessionDetails'
vi.mock('../../src/sessions.js', () => ({
  getSessionDetails: vi.fn(),
}));

// 2. Import the Actual Routers (now that dependencies are mocked)
import sessionRouter from '../../src/routes/sessions.js';
import { getSessionDetails } from '../../src/sessions.js';
import type { SessionDetails } from '../../src/types.js';

// --- Setup Data ---
const TEST_SESSION_ID = 'test-session-123';
const TEST_USER_ID = 'user-alice';

const MOCK_QUESTION = {
  id: 'q-101',
  text: 'What are the three core principles of OOP?',
};

const MOCK_SESSION_DETAILS: SessionDetails = {
  user1: TEST_USER_ID,
  user2: 'user-bob',
  questionId: MOCK_QUESTION.id,
  title: 'OOP Principles',
  question: MOCK_QUESTION.text,
  difficulty: 'Medium',
  categories: 'Algorithms',
};

describe('API Routes', () => {

  beforeEach(() => {
    // Clear mock history before each test
    vi.clearAllMocks();
  });
  describe('Session Router (GET /:sessionId/question)', () => {
    it('should return the question details on successful lookup (200)', async () => {
      // Mock the dependency to return data
      vi.mocked(getSessionDetails).mockReturnValue(MOCK_SESSION_DETAILS);

      // 1. Simulate the GET request
      const response = await sessionRouter.request(
        `/${TEST_SESSION_ID}/question`,
        {
          method: 'GET',
        }
      );

      // 2. Assertions
      expect(response.status).toBe(200);

      const json = await response.json();
      // The route returns sessionDetails
      expect(json).toEqual({title: MOCK_SESSION_DETAILS.title, question: MOCK_SESSION_DETAILS.question });

      // 3. Verify the dependency was called correctly
      expect(vi.mocked(getSessionDetails)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(getSessionDetails)).toHaveBeenCalledWith(TEST_SESSION_ID);
    });

    it('should return a 404 error if the session is not found', async () => {
      // Mock the dependency to return undefined (Not Found)
      vi.mocked(getSessionDetails).mockReturnValue(undefined);

      // 1. Simulate the GET request
      const response = await sessionRouter.request(
        `/${TEST_SESSION_ID}/question`,
        {
          method: 'GET',
        }
      );

      // 2. Assertions
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json).toEqual({
        message: `Session with sessionId: ${TEST_SESSION_ID} not found`
      });

      // 3. Verify the dependency was called
      expect(vi.mocked(getSessionDetails)).toHaveBeenCalledTimes(1);
    });
  });
});