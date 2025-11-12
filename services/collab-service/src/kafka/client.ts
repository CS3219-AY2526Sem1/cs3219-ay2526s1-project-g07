import { Kafka, type Admin} from 'kafkajs';
import { CollabProducer } from './producer.js';
import { CollabConsumer } from './consumer.js';
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
    private producer: CollabProducer;
    private consumer: CollabConsumer;
    // private admin: Admin;

    constructor(config: KafkaConfig) {
        //Initialize Kafka client
        this.kafka = new Kafka({
            clientId: config.clientId,
            brokers: config.brokers,
            retry: config.retry || { initialRetryTime: 300, retries: 10 },
        });

        //Setup Producer
        this.producer = new CollabProducer(
            this.kafka.producer({
                idempotent: true, // to ensure message deduplication
                transactionTimeout: 30000,
            })
        );

        //Setup Consumer
        this.consumer = new CollabConsumer(
            this.kafka.consumer({ 
                groupId: `${config.clientId}-group`,
                sessionTimeout: 30000,
                heartbeatInterval: 10000,
            })
        );

        // this.admin = this.kafka.admin();
    }

    getProducer(): CollabProducer {
        return this.producer;
    }

    getConsumer(): CollabConsumer {
        return this.consumer;
    }

    async connect(): Promise<void> {
        try {
            await this.producer.getProducer().connect();
            await this.consumer.getConsumer().connect();
            // await this.admin.connect();
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
            // await this.admin.disconnect();

            console.log('Kafka Client disconnected successfully');
        }  catch (err) {
            console.error('Error disconnecting from Kafka:', err);
            throw err;
        }
    }
}
