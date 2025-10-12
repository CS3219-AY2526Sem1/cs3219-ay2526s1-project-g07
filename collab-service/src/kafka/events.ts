import { TOPICS_COLLAB } from '../utils.js';

export interface BaseEvent {
    eventId: string;
    eventType: string;
}

export interface CollabSessionReadyEvent extends BaseEvent {
    eventType: (typeof TOPICS_COLLAB)['COLLAB_SESSION_READY'];
    data: {
        collabSessionId: string;
    }
}

export type EventType = CollabSessionReadyEvent; // Add collab-related kafka event topics here as needed after defining