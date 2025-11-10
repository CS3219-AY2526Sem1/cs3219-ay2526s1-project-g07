// AI Assistance Disclosure:
// Tool: GitHub Copilot (model: GPT-5), date: 2025-11-10
// Scope: Requested for assistance to integrate pendingReply for messageHandler
// Author review: I have ran the kafka component on this service and verified that messageHandler is being able to handle the pending requests.

import { type Consumer, type EachMessagePayload } from 'kafkajs';
import type { EventType } from './events.js';
import { MessageHandler } from './messageHandler.js';

export type EventHandler<T extends EventType> = (event: T) => Promise<void>;

export class AiKafkaConsumer {
    private consumer: Consumer;
    private handler: MessageHandler;

    constructor(consumer: Consumer) {
        this.consumer = consumer;
        this.handler = new MessageHandler();
    }

    getConsumer(): Consumer {
        return this.consumer;
    }

    getHandler(): MessageHandler {
        return this.handler;
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

    async addPendingReply(correlationId: string): Promise<any> {
        return this.handler.createPendingRequest(correlationId);
    }
}
