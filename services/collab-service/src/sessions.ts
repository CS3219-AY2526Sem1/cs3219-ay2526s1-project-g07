// In-memory store of authorised rooms and their matched users (FROM KAFKA)
const sessions: Map<string, Map<string, string>> = new Map();
sessions.set("dummy-session-id", 
  new Map([
    ["user1", "user1"], 
    ["user2", "user2"],
    ["questionId", "dummy-question-id"],
    ["title", "dummy-title"],
    ["question", "dummy-question"],
    ["difficulty", "dummy-difficulty"],
    ["categories", "dummy-category"],
  ])); //Example

export const addSession = (sessionId: string, sessionDetails: Map<string, string>) => {
  sessions.set(sessionId, sessionDetails);
};

export const removeSession = (sessionId: string) => {
  sessions.delete(sessionId);
};

export const checkSessionAndUsers = (sessionId: string, userId: string) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }
  return session?.get("user1") === userId || session.get("user2") === userId;
};

export const getSessionDetails = (sessionId: string) => {
  return sessions.get(sessionId);
};
