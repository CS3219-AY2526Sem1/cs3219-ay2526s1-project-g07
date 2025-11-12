import { EachMessagePayload } from 'kafkajs';
import { TOPICS_SUBSCRIBED } from './utils.js';
import { userRepository } from '../repositories/userRepository.js';
import type { UserStatusUpdateEvent } from './types.js';

export class MessageHandler {
    async handleMessage(payload: EachMessagePayload) {
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
            console.error(`Failed to parse message value as JSON on topic ${topic}, partition ${partition}:`, value, err);
            return;
        }
        switch (topic) {
            case TOPICS_SUBSCRIBED.USER_STATUS_UPDATE:
                await this.processUserStatusUpdate(event);
                break;
            default:
                console.log(`Received message on unknown topic ${topic}: ${message.value?.toString()}`);
        }
    }

    private async processUserStatusUpdate(event: UserStatusUpdateEvent) {
        console.log('Received kafka event on User-status-update:', event);

        const { userId, collabSessionId } = event.data;
        console.log(`User ${userId} status updated to ${collabSessionId ? 'collaborating' : 'available'}`);

        if (!userId) {
            console.error(`Missing userId in user status update message`);
            return;
        }

        try {
            // Update the user's collab_id in the database
            // null means user is available (not in any collab session)
            // otherwise, collabSessionId contains the session they're in
            await userRepository.updateUserCollabId(userId, collabSessionId);
            console.log(`✅ Updated user ${userId} collab_id to ${collabSessionId || 'null'} in the database`);
        } catch (error) {
            console.error(`❌ Failed to update user ${userId} collab_id:`, error);
        }
    }
}
