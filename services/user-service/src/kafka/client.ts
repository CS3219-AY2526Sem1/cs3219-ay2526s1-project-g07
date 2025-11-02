import { Kafka} from 'kafkajs';
import { UserConsumer } from './consumer.js';
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
    private consumer: UserConsumer;

    constructor(config: KafkaConfig) {
        //Initialize Kafka client
        this.kafka = new Kafka({
            clientId: config.clientId,
            brokers: config.brokers,
            retry: config.retry || { initialRetryTime: 300, retries: 10 },
        });

        this.consumer = new UserConsumer(
            this.kafka.consumer({ 
                groupId: `${config.clientId}-group`,
                sessionTimeout: 30000,
                heartbeatInterval: 10000,
            })
        );
        this.consumer.subscribe(Object.values(TOPICS_SUBSCRIBED));
    }

    getConsumer(): UserConsumer {
        return this.consumer;
    }

    async connect(): Promise<void> {
        try {
            await this.consumer.getConsumer().connect();
            await this.consumer.startConsuming();

            console.log('Kafka Client connected successfully');
        } catch (err) {
            console.error('Error connecting to Kafka:', err);
            throw err;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.consumer.getConsumer().disconnect();

            console.log('Kafka Client disconnected successfully');
        }  catch (err) {
            console.error('Error disconnecting from Kafka:', err);
            throw err;
        }
    }
}
