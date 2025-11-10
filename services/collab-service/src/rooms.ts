/*
AI Assistance Disclosure:
Tool: ChatGPT (model: GPT-4.1), date: 2025‑10‑24
Scope: Generated implementation of the Rooms.
Author review: I validated correctness of the functions, removed unnecessary code, and modified the code to fit the requirements.
*/

import { removeSession } from "./sessions.js";

// Keep track of connected clients per session
const activeRooms = new Map<string, Map<string, WebSocket>>(); // sessionId → Map of userIds to their WebSocket connections (max 2 users in one room)

const DUPLICATE_SESSION_CLOSE_CODE = 4001;
const USER_REMOVED_CLOSE_CODE = 4000;

export const addActiveRoom = (sessionId: string, userId: string, ws: WebSocket) => {
  let room = activeRooms.get(sessionId);
  if (!room) {
    room = new Map<string, WebSocket>();
    activeRooms.set(sessionId, room);
    console.log(`Created new room for ${sessionId}`);
  }

  if (room.has(userId)) {
    const oldSocket = room.get(userId);
    console.log(`User ${userId} already in room ${sessionId}, replacing existing connection`);
    if (oldSocket) {
      oldSocket.close(DUPLICATE_SESSION_CLOSE_CODE, "Duplicate user session"); // Disconnect existing connection for the same user
    }
  }

  console.log(`Adding user ${userId} to room ${sessionId}`);
  room.set(userId, ws);

  console.log('Current active rooms:', Array.from(activeRooms.keys()));
};

// Removes a specific user from a room, closes their socket, and cleans up empty sessions
export const removeActiveRoom = (sessionId: string, userId: string) => {
  const room = activeRooms.get(sessionId);
  if (room) {
    const socket = room.get(userId);
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      socket.close(USER_REMOVED_CLOSE_CODE, "User removed from room");
    }
    room.delete(userId);
    if (room.size === 0) {
      activeRooms.delete(sessionId);

      // Clean up empty session
      removeSession(sessionId);
    }
    console.log(`Removed user ${userId} from room ${sessionId}`);
  }
};

// Removes a specific user from a room only if the current WebSocket is disconnected
export const disconnectSocketFromRoom = (sessionId: string, userId: string, ws: WebSocket) => {
  const room = activeRooms.get(sessionId);
  if (room) {
    const socket = room.get(userId);
    if (socket === ws) {
      socket.close();
      room.delete(userId);
      if (room.size === 0) {
        activeRooms.delete(sessionId);

        // Clean up empty session
        removeSession(sessionId);
      }
      console.log(`Removed user socket of ${userId} from room ${sessionId}`);
    }
  }
};

export const getActiveRooms = () => {
  return activeRooms;
};

// Active Room management logic (max 2 users per room) --> might not be needed
export const getActiveRoom = (sessionId: string) => {
  return activeRooms.get(sessionId);
};

export const canJoinRoom = (sessionId: string, userId: string) => {
  const room = activeRooms.get(sessionId);
  if (!room) {
    return false;
  }

  if (room.has(userId)) {
    return false;
  }

  return room.size >= 2;
};

