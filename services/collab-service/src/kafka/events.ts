import { TOPICS_COLLAB } from './utils.js';

export interface BaseEvent {
    eventId: string;
    eventType: string;
}

export interface CollabSessionReadyEvent extends BaseEvent {
    eventType: (typeof TOPICS_COLLAB)['COLLAB_SESSION_READY'];
    data: {
        collabSessionId: string;
        userIdOne: string;
        userIdTwo: string;
    }
}

export interface AIQuestionResponseEvent extends BaseEvent {
    eventType: (typeof TOPICS_COLLAB)['AI_QUESTION_RESPONSE'];
    data: {
        collabSessionId: string;
        userId: string;
        question: string; // question_title + '\n' + question_body
    }
}

export type EventType = CollabSessionReadyEvent | AIQuestionResponseEvent; // Add collab-related kafka event topics here as needed after defining