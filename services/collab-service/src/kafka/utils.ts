export const TOPICS_COLLAB = {
    COLLAB_SESSION_READY: 'collab-session-ready',
    AI_QUESTION_RESPONSE: 'ai-question-response', //Response to TOPICS_SUBSCRIBED.AI_QUESTION_HINT_REQUEST
    USER_STATUS_UPDATE: 'user-status-update', // Produced by collab-service when user enters or leaves a collab session
} as const;

export const TOPICS_SUBSCRIBED = {
    QUESTION_SUCCESS: 'question-success', // Produced by question service from matching service event
    AI_QUESTION_HINT_REQUEST: 'ai-question-hint-request', // Produced by ai-service when user requests hint
}
