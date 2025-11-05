import { TOPICS_AI } from "./utils.js";

export interface BaseEvent {
    eventId: string;
    eventType: string;
}

export interface AIQuestionHintRequestEvent extends BaseEvent {
    eventType: (typeof TOPICS_AI)['AI_QUESTION_HINT_REQUEST'];
    data: {
        collabSessionId: string;
        userId: string;
    }
}

export type EventType = AIQuestionHintRequestEvent;
