import { type Consumer, type EachMessagePayload } from 'kafkajs';
import type { EventType } from './events.js';
import { CollabMessageHandler } from './collabMessageHandler.js';

export type EventHandler<T extends EventType> = (event: T) => Promise<void>;

export class CollabConsumer {
    private consumer: Consumer;
    private handler: CollabMessageHandler;

    constructor(consumer: Consumer) {
        this.consumer = consumer;
        this.handler = new CollabMessageHandler();
    }

    getConsumer(): Consumer {
        return this.consumer;
    }

    async subscribe(topics: string[]): Promise<void> {
        try {
            await this.consumer.subscribe({ topics: topics, fromBeginning: true });
            console.log(`Subscribed to topics: ${topics.join(', ')}`);
        } catch (err) {
            console.error('Error subscribing to topics:', err);
            throw err;
        }
    }

    async startConsuming(): Promise<void> {
        try {
            await this.consumer.run({
                eachMessage: async (payload: EachMessagePayload) => {
                    await this.handler.handleMessage(payload);
                }
            });
        } catch (err) {
            console.error('Error starting consumer:', err);
            throw err;
        }
    }
}
