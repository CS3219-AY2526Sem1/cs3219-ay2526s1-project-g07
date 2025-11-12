import { Kafka } from 'kafkajs';
import { QuestionConsumer } from './consumer.js';
import { questionProducer } from './producer.js';

export interface KafkaConfig {
    clientId: string;
    brokers: string[];
    retry?: {
        initialRetryTime?: number;
        retries?: number;
    };
}

export class KafkaClient {
    private kafka: Kafka;
    private consumer: QuestionConsumer;

    constructor(config: KafkaConfig) {
        // Initialize Kafka client
        this.kafka = new Kafka({
            clientId: config.clientId,
            brokers: config.brokers,
            retry: config.retry || { initialRetryTime: 300, retries: 10 },
        });

        this.consumer = new QuestionConsumer(config.brokers);
    }

    getConsumer(): QuestionConsumer {
        return this.consumer;
    }

    async connect(): Promise<void> {
        try {
            // Connect producer
            await questionProducer.connect();
            console.log('✅ Question Producer connected successfully');

            // Connect and start consumer
            await this.consumer.connect();
            await this.consumer.subscribe();
            
            console.log('✅ Kafka Client connected successfully');
        } catch (err) {
            console.error('❌ Error connecting to Kafka:', err);
            throw err;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.consumer.disconnect();
            await questionProducer.disconnect();

            console.log('✅ Kafka Client disconnected successfully');
        } catch (err) {
            console.error('❌ Error disconnecting from Kafka:', err);
            throw err;
        }
    }
}
