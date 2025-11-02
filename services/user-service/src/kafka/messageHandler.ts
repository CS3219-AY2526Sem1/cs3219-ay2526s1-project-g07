import { EachMessagePayload } from 'kafkajs';
import { TOPICS_SUBSCRIBED } from './utils.js';

export class MessageHandler {
    async handleMessage(payload: EachMessagePayload) {
        const {topic, partition, message} = payload;
        if (!message.value) {
            console.warn(`Received message with empty value on topic ${topic}, partition ${partition}`);
            return;
        }

        const value = message.value.toString();
        const event = JSON.parse(value);
        switch (topic) {
            case TOPICS_SUBSCRIBED.USER_STATUS_UPDATE:
                await this.processUserStatusUpdate(event);
                break;
            default:
                console.log(`Received message on unknown topic ${topic}: ${message.value?.toString()}`);
        }
    }

    private async processUserStatusUpdate(event: any) {
        console.log('Received kafka event on User-status-update:', event);

        const { userId, status } = event.data;
        console.log(`User ${userId} status updated to ${status}`);

        if (!userId || !status) {
            console.error(`Missing userId or status in user status update message`);
            return;
        }

        //TODO Update the user's status in the database

        console.log(`Updated user ${userId} status to ${status} in the database`);

    }
}
