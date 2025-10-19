// In-memory store of authorised rooms and their matched users (FROM KAFKA)
const sessions = new Map();
sessions.set("dummy-session-id", new Set(["user1", "user2"])); // Example session

export const addSession = (sessionId: string, userIds: string[]) => {
  sessions.set(sessionId, new Set(userIds));
};

export const removeSession = (sessionId: string) => {
  sessions.delete(sessionId);
};

export const checkSessionAndUsers = (sessionId: string, userId: string) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }
  return session.has(userId);
};
