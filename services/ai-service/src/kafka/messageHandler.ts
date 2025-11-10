import type { EachMessagePayload } from 'kafkajs';
import { TOPICS_SUBSCRIBED } from './utils.js';



export class MessageHandler {
    private pendingReplies: Map<string, {
        resolve: (data: any) => void;
        reject: (error: any) => void;
        timer: NodeJS.Timeout;
    }>;

    constructor() {
        this.pendingReplies = new Map();
    }

    createPendingRequest(correlationId: string): Promise<any> {
        const timeoutMs = 3000;
        return new Promise<any>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingReplies.delete(correlationId);
                reject(new Error(`Request timeout after ${timeoutMs}ms`));
            }, timeoutMs);

            this.pendingReplies.set(correlationId, { resolve, reject, timer });
        });
    }

    clearAllPending(): void {
        this.pendingReplies.forEach((entry) => {
            clearTimeout(entry.timer);
            entry.reject(new Error('MessageHandler is shutting down'));
        });
        this.pendingReplies.clear();
    }

    async handleMessage(payload: EachMessagePayload): Promise<void> {
        const {topic, partition, message} = payload;
        if (!message.value) {
            console.warn(`Received message with empty value on topic ${topic}, partition ${partition}`);
            return;
        }
        const value = message.value.toString();
        let event;
        try {
            event = JSON.parse(value);
        } catch (err) {
            console.error(`Failed to parse JSON message on topic ${topic}, partition ${partition}:`, value, err);
            return;
        }
        switch (topic) {
            case TOPICS_SUBSCRIBED.COLLAB_QUESTION_RESPONSE:
                await this.processQuestion(message, event);
                break;
            default:
                console.log(`Received message on unknown topic ${topic}: ${message.value?.toString()}`);
        }
    }

    private async processQuestion(message:any, event: any): Promise<void> {
        console.log('Processing question event:', event);
        const correlationId = event?._meta?.correlationId || event?.correlationId;
        
        if (!correlationId) {
            console.warn('Question response without correlationId');
            return;
        } else if (!this.pendingReplies.has(correlationId)) {
            console.error(`No correlation Id in pending replies for correlationId`);
            return;
        }

        // Reply to pending request
        const entry = this.pendingReplies.get(correlationId)!;
        clearTimeout(entry.timer);

        const {collabSessionId, userId, question} = event?.data;

        if (!collabSessionId || !userId || !question) {
            console.error('Invalid event data:', event);
            entry.reject(new Error('Invalid event data'));
            this.pendingReplies.delete(correlationId);
            return;
        }

        entry.resolve(event.data); //Sends data back
        this.pendingReplies.delete(correlationId);
        console.log(`Resolved pending request for correlationId ${correlationId}`);
    }
}
