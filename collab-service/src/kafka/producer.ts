import { type Producer, type RecordMetadata } from 'kafkajs';
import type { EventType } from './events.js';
import { v4 as uuidv4 } from 'uuid';

export class CollabProducer {
    private producer: Producer;

    constructor(producer: Producer) {
        this.producer = producer;
    }

    getProducer(): Producer {
        return this.producer;
    }

    async publishEvent<T extends EventType>(event: Omit<T, 'eventId'>, key?: string, topic?: string): Promise<RecordMetadata[]> {
        try {
            const fullEvent: T = {
                ...event,
                eventId: uuidv4(), // Different from collabSessionId in CollabSessionReadyEvent
            } as T;
            
            const messages = [{
                key: key || fullEvent.eventId,
                value: JSON.stringify(fullEvent),
            }] //timestamp defaults to Date.now()

            const result = await this.producer.send({
                topic: topic || fullEvent.eventType, //Unless specified, topic is the same as eventType
                messages: messages,
            });

            console.log(`Event published to topic ${topic}:`, fullEvent);
            return result;
        } catch (err) {
            console.error('Error publishing event:', err);
            throw err;
        }
    }
}
