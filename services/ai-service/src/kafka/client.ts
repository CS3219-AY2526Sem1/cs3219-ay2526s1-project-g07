// AI Assistance Disclosure:
// Tool: GitHub Copilot (model: GPT-5), date: 2025-11-09
// Scope: Requested for assistance to retrieve kafka response for API
// Author review: I have ran the kafka component on this service and verified that it is working as intended.

import {Kafka } from 'kafkajs';
import { AiKafkaProducer } from './producer.js';
import { AiKafkaConsumer } from './consumer.js';
import { TOPICS_AI, TOPICS_SUBSCRIBED } from './utils.js';
import { v4 as uuidv4 } from 'uuid';
import type { AIQuestionHintRequestEvent } from './events.js';

export interface KafkaConfig {
    clientId: string;
    brokers: string[];
    retry?: {
        initialRetryTime?: number;
        retries?: number;
    };
}

export class KafkaClient {
    private kafka : Kafka;
    private producer: AiKafkaProducer
    private consumer: AiKafkaConsumer;

    constructor(config: KafkaConfig) {
        //Initialize Kafka client
        this.kafka = new Kafka({
            clientId: config.clientId,
            brokers: config.brokers,
            retry: config.retry || { initialRetryTime: 300, retries: 10 },
        });
        //Setup Producer
        this.producer = new AiKafkaProducer(
            this.kafka.producer({
                idempotent: true, // to ensure message deduplication
                transactionTimeout: 30000,
                allowAutoTopicCreation: true,
            })
        );

        //Setup Consumer
        this.consumer = new AiKafkaConsumer(
            this.kafka.consumer({
                groupId: `${config.clientId}-group`,
                allowAutoTopicCreation: true,
            })
        );
    }

    getProducer(): AiKafkaProducer {
        return this.producer;
    }

    getConsumer(): AiKafkaConsumer {
        return this.consumer;
    }

    getClient(): Kafka {
        return this.kafka;
    }

    async connect(): Promise<void> {
        try {
            await this.producer.getProducer().connect();
            await this.consumer.getConsumer().connect();

            await this.consumer.subscribe(Object.values(TOPICS_SUBSCRIBED));
            await this.consumer.startConsuming();
            console.log('Kafka Client connected successfully');
        } catch (err) {
            console.error('Error connecting to Kafka:', err);
            throw err;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.producer.getProducer().disconnect();
            await this.consumer.getConsumer().disconnect();
            this.consumer.getHandler().clearAllPending();

            console.log('Kafka Client disconnected successfully');
        } catch (err) {
            console.error('Error disconnecting from Kafka:', err);
            throw err;
        }
    }

    async retrieveQuestionDetails(collabSessionId: string, userId: string): Promise<Map<string, string> | null> {
        const correlationId = uuidv4();

        //Add pending replies to message handler for retrieval
        const pendingReply = this.consumer.addPendingReply(correlationId);

        await this.producer.publishEvent<AIQuestionHintRequestEvent>({
            eventType: TOPICS_AI.AI_QUESTION_HINT_REQUEST,
            data: {
                collabSessionId,
                userId
            },
            _meta: {
                correlationId
            }
        });

        return pendingReply;
    }
}
