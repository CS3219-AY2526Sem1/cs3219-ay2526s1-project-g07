// Keep track of connected clients per session
const activeRooms = new Map<string, Map<string, WebSocket>>(); // sessionId → Map of userIds to their WebSocket connections (max 2 users in one room)

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
      oldSocket.close(4001, "Duplicate user session"); // Disconnect existing connection for the same user
    }
  }

  console.log(`Adding user ${userId} to room ${sessionId}`);
  room.set(userId, ws);

  console.log('Current active rooms:', Array.from(activeRooms.keys()));
};

export const removeActiveRoom = (sessionId: string, userId: string) => {
  const room = activeRooms.get(sessionId);
  if (room) {
    const socket = room.get(userId);
    socket?.close();
    room.delete(userId);
    if (room.size === 0) {
      activeRooms.delete(sessionId);

      // Clean up empty session (Optional for now)
      // removeSession(sessionId);
    }
    console.log(`Removed user ${userId} from room ${sessionId}`);
  }
};

export const getActiveRooms = () => {
  return activeRooms;
}

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

