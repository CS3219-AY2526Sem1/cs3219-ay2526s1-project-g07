import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers: ['localhost:9094']
});

const admin = kafka.admin();

const createMatchingTopics = async () => {
  await admin.createTopics({
    topics: [
      { topic: 'matching-request' },
      { topic: 'matching-success' },
    ]
  });
  console.log('Matching topics created');
}

const createQuestionTopics = async () => {
  await admin.createTopics({
    topics: [
      { topic: 'question-request' },
      { topic: 'question-success' },
    ]
  });
  console.log('Question topics created');
}

const run = async () => {
  await admin.connect();
  console.log('Admin connected');

  createMatchingTopics();
  createQuestionTopics();
}

run();
