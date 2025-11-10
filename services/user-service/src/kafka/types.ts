export const TOPICS_COLLAB = {
    USER_STATUS_UPDATE: 'user-status-update'
} as const;

interface BaseEvent {
    eventType: string;
    timestamp: string;
}

export interface UserStatusUpdateEvent extends BaseEvent {
    eventType: typeof TOPICS_COLLAB['USER_STATUS_UPDATE'];
    data: {
        userId: string;
        collabSessionId: string | null; // null if user leaves collab session
    }
}
