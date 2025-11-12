// AI Assistance Disclosure:
// Tool: GitHub Copilot (model: GPT-5), date: 2025-11-10
// Scope: Requested for assistance to be able to map a kakfa reponse back to a kafka request
// Author review: I have ran the kafka component for this service and verified that correlationId is being included.

import { TOPICS_AI } from "./utils.js";

export interface BaseEvent {
    eventId: string;
    eventType: string;
}

export interface EventMeta {
    correlationId: string;
}

export interface AIQuestionHintRequestEvent extends BaseEvent {
    eventType: (typeof TOPICS_AI)['AI_QUESTION_HINT_REQUEST'];
    data: {
        collabSessionId: string;
        userId: string;
    };
    _meta: EventMeta;
}

export type EventType = AIQuestionHintRequestEvent;
