const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'test-producer',
  brokers: ['localhost:9094'],
});

const producer = kafka.producer();

async function sendTestMessage() {
  await producer.connect();
  console.log('✅ Producer connected');

  // Test message with a user entering a collab session
  const messageWithSession = {
    eventType: 'user-status-update',
    timestamp: new Date().toISOString(),
    data: {
      userId: 'qkkmDv1uPORuVp8xX4VgrD02BBhf3rQl',
      collabSessionId: 'collab-session-456'
    }
  };

  // Send message
  await producer.send({
    topic: 'user-status-update',
    messages: [
      {
        value: JSON.stringify(messageWithSession)
      }
    ]
  });

  console.log('📤 Sent message:', messageWithSession);
  console.log('---');

  // Wait a bit, then send a message with null (user leaving session)
  await new Promise(resolve => setTimeout(resolve, 2000));

  const messageWithoutSession = {
    eventType: 'user-status-update',
    timestamp: new Date().toISOString(),
    data: {
      userId: 'qkkmDv1uPORuVp8xX4VgrD02BBhf3rQl',
      collabSessionId: null
    }
  };

  // await producer.send({
  //   topic: 'user-status-update',
  //   messages: [
  //     {
  //       value: JSON.stringify(messageWithoutSession)
  //     }
  //   ]
  // });

  // console.log('📤 Sent message:', messageWithoutSession);

  await producer.disconnect();
  console.log('✅ Producer disconnected');
}

sendTestMessage().catch(console.error);
