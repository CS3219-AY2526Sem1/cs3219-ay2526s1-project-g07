import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mock External Dependencies
// Mock the 'rooms' module and its function 'removeActiveRoom'
vi.mock('../../src/rooms.js', () => ({
  removeActiveRoom: vi.fn()
}));

// 2. Import the Actual Routers (now that dependencies are mocked)
import roomRouter from '../../src/routes/room.js';
import { removeActiveRoom } from '../../src/rooms.js';

// --- Setup Data ---
const TEST_SESSION_ID = 'test-session-123';
const TEST_USER_ID = 'user-alice';


describe('API Routes', () => {
  beforeEach(() => {
    // Clear mock history before each test
    vi.clearAllMocks();
  });

  describe('Room Router (DELETE /:sessionId)', () => {
    it('should call removeActiveRoom and return a success message (200)', async () => {
      // 1. Simulate the DELETE request
      const response = await roomRouter.request(
        `/${TEST_SESSION_ID}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: TEST_USER_ID }),
        }
      );

      // 2. Assertions
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json).toEqual({
        message: `User ${TEST_USER_ID} removed from room with sessionId: ${TEST_SESSION_ID}`
      });

      // 3. Verify the dependency was called correctly
      expect(vi.mocked(removeActiveRoom)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(removeActiveRoom)).toHaveBeenCalledWith(TEST_SESSION_ID, TEST_USER_ID);
    });
  });
});