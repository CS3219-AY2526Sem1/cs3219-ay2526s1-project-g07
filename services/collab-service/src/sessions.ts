/*
AI Assistance Disclosure:
Tool: ChatGPT (model: GPT-4.1), date: 2025‑10‑24
Scope: Generated implementation of the Sessions.
Author review: I validated correctness of the functions, removed unnecessary code, and modified the code to fit the requirements.
*/

import { v4 as uuidv4 } from 'uuid';
import type { SessionDetails } from './types.js';


// In-memory store of authorised rooms and their matched users (FROM KAFKA)
const sessions: Map<string, SessionDetails> = new Map();
const dummySessionDetails: SessionDetails = {
  user1: "user1",
  user2: "user2",
  questionId: "dummy-question-id",
  title: "dummy-title",
  question: "dummy-question",
  difficulty: "dummy-difficulty",
  categories: "dummy-category",
};

sessions.set("dummyId", dummySessionDetails);

export const addSession = (sessionId: string, sessionDetails: SessionDetails) => {
  sessions.set(sessionId, sessionDetails);
  console.log("Added session:", sessionId, "Details:", sessionDetails);
  console.log("Current sessions:", sessions);
};

export const removeSession = (sessionId: string) => {
  sessions.delete(sessionId);
};

export const checkSessionAndUsers = (sessionId: string, userId: string) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }
  return session?.user1 === userId || session.user2 === userId;
};

export const generateRandomSessionId = (): string => {
  return uuidv4();
}

export const getSessionDetails = (sessionId: string) => {
  return sessions.get(sessionId);
};

export const getSessions = () => {
  return sessions;
}

