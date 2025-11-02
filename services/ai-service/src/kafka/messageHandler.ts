import type { EachMessagePayload } from 'kafkajs';
import { TOPICS_SUBSCRIBED } from './utils.js';



export class MessageHandler {
    async handleMessage(payload: EachMessagePayload): Promise<void> {
        const {topic, partition, message} = payload;
        if (!message.value) {
            console.warn(`Received message with empty value on topic ${topic}, partition ${partition}`);
            return;
        }
        const value = message.value.toString();
        const event = JSON.parse(value);
        switch (topic) {
            case TOPICS_SUBSCRIBED.COLLAB_QUESTION_RESPONSE:
                //TODO integrate into /hint endpoint
                await this.processQuestion(event);
                break;
            default:
                console.log(`Received message on unknown topic ${topic}: ${message.value?.toString()}`);
        }
    }

    private async processQuestion(event: any): Promise<Map<string, string> | void> {
        console.log('Processing question event:', event);
        const {collabSessionId, userId, question} = event?.data;

        if (!collabSessionId || !userId || !question) {
            console.error('Invalid event data:', event);
            return new Map<string, string>();
        }

        return new Map<string, string>([
            ["collabSessionId", collabSessionId],
            ["userId", userId],
            ["question", question]
        ]);
    }

}