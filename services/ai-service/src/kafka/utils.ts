export const TOPICS_AI = {
    AI_QUESTION_HINT_REQUEST: 'ai-question-hint-request', // For requesting question details for collab session
} as const;

export const TOPICS_SUBSCRIBED = {
    COLLAB_QUESTION_RESPONSE: 'ai-question-response', // Produced by collab-service in response to AI_QUESTION_HINT_REQUEST
}
