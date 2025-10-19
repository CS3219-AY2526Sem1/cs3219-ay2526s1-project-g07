// Keep track of connected clients per session
const activeRooms = new Map<string, Map<string, WebSocket>>(); // sessionId → Map of userIds to their WebSocket connections (max 2 users in one room)

export const addActiveRoom = (sessionId: string, userId: string, ws: WebSocket) => {
  let room = activeRooms.get(sessionId);
  if (!room) {
    room = new Map<string, WebSocket>();
    activeRooms.set(sessionId, room);
  }

  if (room.has(userId)) {
    room.get(userId)?.close(); // Disconnect existing connection for the same user
  }

  room.set(userId, ws);
};

export const removeActiveRoom = (sessionId: string, userId: string) => {
  const room = activeRooms.get(sessionId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) {
      activeRooms.delete(sessionId);

      // Clean up empty session (Optional for now)
      // removeSession(sessionId);

    }
  }
};

// Active Room management logic (max 2 users per room) --> might not be needed
export const getActiveRoom = (sessionId: string) => {
  return activeRooms.get(sessionId);
};

export const isRoomFull = (sessionId: string, userId: string) => {
  const room = activeRooms.get(sessionId);
  if (!room) {
    return false;
  }

  if (room.has(userId)) {
    return false;
  }

  return room.size >= 2;
};

