/*
AI Assistance Disclosure:
Tool: ChatGPT (model: GPT-4.1), date: 2025‑11-10
Scope: Generated Test code for Integration of room and session.
Author review: I validated correctness of the functions, removed unnecessary code, and modified the code to fit the requirements.
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { addActiveRoom, removeActiveRoom, disconnectSocketFromRoom, getActiveRooms } from '../../src/rooms.js';
import { addSession, getSessions } from '../../src/sessions.js'; // Import real sessions functions
import type { SessionDetails } from '../../src/types.js';

// --- Utility Mock Setup ---
const mockWebSocket = () => ({
  readyState: 1, // 1 = WebSocket.OPEN
  close: vi.fn(),
});

describe('Rooms and Sessions System Integration Tests', () => {
  const SESSION_ID = 'sess-789';
  const DUMMY_SESSION_DETAILS: SessionDetails = {
    user1: 'user-alpha',
    user2: 'user-beta',
    questionId: 'q-42',
    title: 'Integration Test Title',
    question: 'Integration Test Question',
    difficulty: 'Medium',
    categories: 'Data Structures',
  };
  const USER_ID_1 = 'user-alpha';
  const USER_ID_2 = 'user-beta';

  beforeEach(() => {
    // Clear state in both modules before each test
    getActiveRooms().clear();
    getSessions().clear();
  });

  describe('Integration with removeActiveRoom', () => {
    it('should clean up the room AND the session state when the last user is removed', () => {
      const ws1 = mockWebSocket();

      // SETUP: Simulate session creation and user entering the room
      addSession(SESSION_ID, DUMMY_SESSION_DETAILS); // Manually set session state
      addActiveRoom(SESSION_ID, USER_ID_1, ws1 as any);

      // Verify initial state
      expect(getActiveRooms().has(SESSION_ID)).toBe(true);
      expect(getSessions().has(SESSION_ID)).toBe(true); // Session is active

      // ACTION: Remove the last user
      removeActiveRoom(SESSION_ID, USER_ID_1);

      // ASSERTIONS:
      // 1. Room is cleaned up (rooms.js logic)
      expect(getActiveRooms().has(SESSION_ID)).toBe(false);
      // 2. Session is cleaned up (sessions.js logic, called via rooms.js)
      expect(getSessions().has(SESSION_ID)).toBe(false);
      // 3. Socket was closed
      expect(ws1.close).toHaveBeenCalled();
    });

    it('should NOT clean up the session state if the room is NOT empty', () => {
      // SETUP: Session is active, room has two users
      addSession(SESSION_ID, DUMMY_SESSION_DETAILS);
      addActiveRoom(SESSION_ID, USER_ID_1, mockWebSocket() as any);
      addActiveRoom(SESSION_ID, USER_ID_2, mockWebSocket() as any);

      // Verify initial state
      expect(getSessions().has(SESSION_ID)).toBe(true);

      // ACTION: Remove one user
      removeActiveRoom(SESSION_ID, USER_ID_1);

      // ASSERTIONS:
      // 1. Room still exists with one user
      expect(getActiveRooms().get(SESSION_ID)?.size).toBe(1);
      // 2. Session must NOT be cleaned up
      expect(getSessions().has(SESSION_ID)).toBe(true);
    });
  });

  describe('Integration with disconnectSocketFromRoom', () => {
    it('should clean up the room AND the session state when the last socket disconnects', () => {
      const ws2 = mockWebSocket();

      // SETUP: Session created, room has one user
      addSession(SESSION_ID, DUMMY_SESSION_DETAILS);
      addActiveRoom(SESSION_ID, USER_ID_2, ws2 as any);

      // Verify initial state
      expect(getSessions().has(SESSION_ID)).toBe(true);

      // ACTION: Disconnect the last socket
      disconnectSocketFromRoom(SESSION_ID, USER_ID_2, ws2 as any);

      // ASSERTIONS:
      // 1. Room is cleaned up
      expect(getActiveRooms().has(SESSION_ID)).toBe(false);
      // 2. Session is cleaned up
      expect(getSessions().has(SESSION_ID)).toBe(false);
    });
  });
});