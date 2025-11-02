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

        const { userId, collabSessionId } = event.data;
        console.log(`User ${userId} status updated to ${collabSessionId ? 'collaborating' : 'available'}`);

        if (!userId) {
            console.error(`Missing userId in user status update message`);
            return;
        }

        //TODO Update the user's status in the database based on collabSessionId - null means available, otherwise collaborating

        //TODO DB to store both status and collabSessionId - new attributes

        console.log(`Updated user ${userId} status to ${collabSessionId ? 'collaborating' : 'available'} in the database`);
    }
}
