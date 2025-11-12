import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addActiveRoom,
  removeActiveRoom,
  disconnectSocketFromRoom,
  getActiveRooms,
  canJoinRoom,
  getActiveRoom,
} from '../../src/rooms.js';

// --- Setup Mock WebSocket ---
// We need a mock implementation for WebSocket since it's a browser/runtime global
// and the provided code interacts with its 'readyState' and 'close' methods.

const mockWebSocket = () => ({
  readyState: 1, // 1 = WebSocket.OPEN
  close: vi.fn(),
  send: vi.fn(),
});

// Create a type for our mocked WebSocket instances
type MockWebSocket = ReturnType<typeof mockWebSocket>;

vi.mock('../../src/sessions.js', () => ({
  removeSession: vi.fn(),
}));

vi.mock('../../src/index.js', () => ({
  kafkaClient: {
    getProducer: () => ({
      publishEvent: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// 2. Import the actual mocked function to assert against it.
import { removeSession } from '../../src/sessions.js';


// --- Testing Suite ---

describe('Room Management Functions', () => {
  // Clear the state before each test to ensure isolation
  beforeEach(() => {
    // Manually clear the activeRooms map using the function that exposes it (for testing purposes)
    const activeRooms = getActiveRooms();
    activeRooms.clear();

    // Reset all mocks (especially the close function)
    vi.clearAllMocks();
  });

  const SESSION_ID = 'sess-123';
  const USER_ID_A = 'user-alice';
  const USER_ID_B = 'user-bob';

  describe('addActiveRoom', () => {
    it('should create a new room and add the first user', () => {
      const wsA = mockWebSocket();
      addActiveRoom(SESSION_ID, USER_ID_A, wsA as any);

      const activeRooms = getActiveRooms();
      expect(activeRooms.size).toBe(1);
      expect(activeRooms.get(SESSION_ID)?.size).toBe(1);
      expect(activeRooms.get(SESSION_ID)?.get(USER_ID_A)).toBe(wsA);
      expect(wsA.close).not.toHaveBeenCalled();
    });

    it('should add a second user to an existing room', () => {
      const wsA = mockWebSocket();
      const wsB = mockWebSocket();

      addActiveRoom(SESSION_ID, USER_ID_A, wsA as any);
      addActiveRoom(SESSION_ID, USER_ID_B, wsB as any);

      const activeRooms = getActiveRooms();
      const room = activeRooms.get(SESSION_ID);

      expect(activeRooms.size).toBe(1);
      expect(room?.size).toBe(2);
      expect(room?.get(USER_ID_A)).toBe(wsA);
      expect(room?.get(USER_ID_B)).toBe(wsB);
    });

    it('should replace an existing user connection and close the old socket', () => {
      const oldWsA = mockWebSocket();
      const newWsA = mockWebSocket();
      const DUPLICATE_SESSION_CLOSE_CODE = 4001; // Defined in original file

      // 1. Add initial connection
      addActiveRoom(SESSION_ID, USER_ID_A, oldWsA as any);

      // 2. Add replacement connection
      addActiveRoom(SESSION_ID, USER_ID_A, newWsA as any);

      const room = getActiveRooms().get(SESSION_ID);

      // Verify the old socket was closed
      expect(oldWsA.close).toHaveBeenCalledTimes(1);
      expect(oldWsA.close).toHaveBeenCalledWith(DUPLICATE_SESSION_CLOSE_CODE, 'Duplicate user session');

      // Verify the new socket replaced the old one
      expect(room?.size).toBe(1);
      expect(room?.get(USER_ID_A)).toBe(newWsA);
      expect(newWsA.close).not.toHaveBeenCalled();
    });
  });

  describe('removeActiveRoom', () => {
    it('should remove the user, close their socket, and keep the room if not empty', async () => {
      const wsA = mockWebSocket();
      const wsB = mockWebSocket();
      const USER_REMOVED_CLOSE_CODE = 4000;

      addActiveRoom(SESSION_ID, USER_ID_A, wsA as any);
      addActiveRoom(SESSION_ID, USER_ID_B, wsB as any);

      // Remove User A
      await removeActiveRoom(SESSION_ID, USER_ID_A);

      const activeRooms = getActiveRooms();
      const room = activeRooms.get(SESSION_ID);

      // Verify User A's socket was closed
      expect(wsA.close).toHaveBeenCalledTimes(1);
      expect(wsA.close).toHaveBeenCalledWith(USER_REMOVED_CLOSE_CODE, 'User removed from room');

      // Verify User A was removed from the room
      expect(room?.size).toBe(1);
      expect(room?.has(USER_ID_A)).toBe(false);

      // Verify the room still exists
      expect(activeRooms.size).toBe(1);
      expect(removeSession).not.toHaveBeenCalled(); // Room is not empty
    });

    it('should remove the user and the room if it becomes empty, calling removeSession', async () => {
      const wsA = mockWebSocket();
      addActiveRoom(SESSION_ID, USER_ID_A, wsA as any);

      // Remove User A (the last user)
      await removeActiveRoom(SESSION_ID, USER_ID_A);

      const activeRooms = getActiveRooms();

      // Verify the room was deleted
      expect(activeRooms.size).toBe(0);
      expect(activeRooms.has(SESSION_ID)).toBe(false);
      expect(removeSession).toHaveBeenCalledTimes(1);
      expect(removeSession).toHaveBeenCalledWith(SESSION_ID);
    });

    it('should not throw an error if the room or user does not exist', () => {
      // Should run without error
      expect(() => removeActiveRoom('non-existent-session', USER_ID_A)).not.toThrow();
    });
  });

  describe('disconnectSocketFromRoom', () => {
    it('should remove the user and room if the provided socket matches and is the last one, calling removeSession', async () => {
      const wsA = mockWebSocket();
      addActiveRoom(SESSION_ID, USER_ID_A, wsA as any);

      // Disconnect using the same socket instance
      await disconnectSocketFromRoom(SESSION_ID, USER_ID_A, wsA as any);

      const activeRooms = getActiveRooms();
      expect(activeRooms.size).toBe(0);
      expect(wsA.close).toHaveBeenCalledTimes(1); // Default close without custom code
      expect(removeSession).toHaveBeenCalledTimes(1);
      expect(removeSession).toHaveBeenCalledWith(SESSION_ID);
    });

    it('should remove the user but NOT call removeSession if other users remain', async () => {
      const wsA = mockWebSocket();
      const wsB = mockWebSocket();
      addActiveRoom(SESSION_ID, USER_ID_A, wsA as any);
      addActiveRoom(SESSION_ID, USER_ID_B, wsB as any);

      // Disconnect User A
      await disconnectSocketFromRoom(SESSION_ID, USER_ID_A, wsA as any);

      // Assertions
      expect(getActiveRooms().get(SESSION_ID)?.size).toBe(1);
      expect(removeSession).not.toHaveBeenCalled();
    });

    it('should NOT remove the user if the provided socket instance does not match the active one', async () => {
      const activeWs = mockWebSocket();
      const staleWs = mockWebSocket();

      addActiveRoom(SESSION_ID, USER_ID_A, activeWs as any);

      // Try to disconnect using a different socket instance
      await disconnectSocketFromRoom(SESSION_ID, USER_ID_A, staleWs as any);

      const activeRooms = getActiveRooms();
      expect(activeRooms.size).toBe(1);
      expect(activeRooms.get(SESSION_ID)?.size).toBe(1);
      expect(activeRooms.get(SESSION_ID)?.get(USER_ID_A)).toBe(activeWs);
      expect(activeWs.close).not.toHaveBeenCalled();
      expect(removeSession).not.toHaveBeenCalled();
    });

    it('should not throw error if room/user does not exist', async () => {
        const wsA = mockWebSocket();
        await expect(() => disconnectSocketFromRoom('non-existent-session', USER_ID_A, wsA as any)).not.toThrow();
    });
  });

  describe('canJoinRoom', () => {
    it('should return false if the room does not exist', () => {
      expect(canJoinRoom(SESSION_ID, USER_ID_A)).toBe(false);
    });

    it('should return false if the room has 1 user and the current user is new', () => {
      addActiveRoom(SESSION_ID, USER_ID_A, mockWebSocket() as any);
      expect(canJoinRoom(SESSION_ID, USER_ID_B)).toBe(false);
    });

    it('should return false if the room has 2 users but the current user is already one of them (reconnecting)', () => {
      addActiveRoom(SESSION_ID, USER_ID_A, mockWebSocket() as any);
      addActiveRoom(SESSION_ID, USER_ID_B, mockWebSocket() as any);
      // User A is attempting to join/check
      expect(canJoinRoom(SESSION_ID, USER_ID_A)).toBe(false);
    });

    it('should return true if the room has 2 users and the current user is new', () => {
      addActiveRoom(SESSION_ID, USER_ID_A, mockWebSocket() as any);
      addActiveRoom(SESSION_ID, USER_ID_B, mockWebSocket() as any);

      const USER_ID_C = 'user-charlie';
      expect(canJoinRoom(SESSION_ID, USER_ID_C)).toBe(true);
    });
  });

  describe('getActiveRoom', () => {
    it('should return the room map if it exists', () => {
        const wsA = mockWebSocket();
        addActiveRoom(SESSION_ID, USER_ID_A, wsA as any);
        const room = getActiveRoom(SESSION_ID);
        expect(room?.size).toBe(1);
        expect(room?.get(USER_ID_A)).toBe(wsA);
    });

    it('should return undefined if the room does not exist', () => {
        expect(getActiveRoom('non-existent')).toBeUndefined();
    });
  });
});