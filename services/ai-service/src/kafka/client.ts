import {Kafka } from 'kafkajs';
import { AiKafkaProducer } from './producer.js';
import { AiKafkaConsumer } from './consumer.js';
import { TOPICS_SUBSCRIBED } from './utils.js';

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
            console.log('Kafka Client disconnected successfully');
        } catch (err) {
            console.error('Error disconnecting from Kafka:', err);
            throw err;
        }
    }
}
