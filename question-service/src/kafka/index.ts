import { questionConsumer } from './consumer.js';
import { questionProducer } from './producer.js';
import { handleQuestionRequest } from './messageHandler.js';

export * from './types.js';
export * from './consumer.js';
export * from './producer.js';
export * from './messageHandler.js';

export async function startKafkaServices(): Promise<void> {
  try {
    console.log('🚀 Starting Kafka services for question-service...');

    // Connect producer first
    await questionProducer.connect();
    console.log('✅ Producer connected');

    // Start consumer with message handler
    await questionConsumer.start(handleQuestionRequest);
    console.log('✅ Consumer started and listening for question requests');

    console.log('🎉 All Kafka services started successfully');
  } catch (error) {
    console.error('❌ Failed to start Kafka services:', error);
    throw error;
  }
}

export async function stopKafkaServices(): Promise<void> {
  try {
    console.log('🛑 Stopping Kafka services...');

    await questionConsumer.disconnect();
    await questionProducer.disconnect();

    console.log('✅ All Kafka services stopped');
  } catch (error) {
    console.error('❌ Error stopping Kafka services:', error);
    throw error;
  }
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n⚠️ Received SIGINT, shutting down gracefully...');
  await stopKafkaServices();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Received SIGTERM, shutting down gracefully...');
  await stopKafkaServices();
  process.exit(0);
});
