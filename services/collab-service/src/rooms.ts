// Keep track of connected clients per session
const activeRooms = new Map(); // sessionId → Set of connected userIds (max 2 users in one room)

const addActiveRoom = (sessionId: string, userId: string) => {
  const room = activeRooms.get(sessionId) || new Set();
  room.add(userId);
  activeRooms.set(sessionId, room);
};

const removeActiveRoom = (sessionId: string, userId: string) => {
  const room = activeRooms.get(sessionId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) activeRooms.delete(sessionId);
  }
};

// TODO: Active Room management logic (max 2 users per room)
