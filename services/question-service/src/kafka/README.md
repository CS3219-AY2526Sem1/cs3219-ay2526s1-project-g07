# Question Service Kafka Integration

This document describes the Kafka integration for the Question Service, which consumes question requests and produces question responses.

## Overview

The Question Service integrates with Kafka to:
- **Consume** from the `question-request` topic
- **Produce** to the `question-success` topic

## Architecture

```
[Matching Service] --> question-request --> [Question Service] --> question-success --> [Collaboration Service]
                      (userId1, userId2)                          (question details)
```

### Message Flow

1. Matching Service matches two users and publishes a question request to `question-request` topic with userId1 and userId2
2. Question Service consumer receives the request
3. Question Service finds a matching question from the database based on difficulty and categories
4. Question Service produces the result to `question-success` topic with user IDs and question details

## Topics

### question-request (Consumer)

The service listens for question requests on this topic. Messages are sent by the matching service after two users are matched.

**Message Format:**
```typescript
{
  requestId: string;      // Unique request identifier
  userId1: string;        // First matched user ID
  userId2: string;        // Second matched user ID
  difficulty: string;     // "Easy", "Medium", or "Hard"
  categories: string[];   // Array of category names
  timestamp: number;      // Unix timestamp
}
```

**Example:**
```json
{
  "requestId": "req-123-abc",
  "userId1": "user-001",
  "userId2": "user-002",
  "difficulty": "Medium",
  "categories": ["Array", "Hash Table"],
  "timestamp": 1697011200000
}
```

### question-success (Producer)

The service publishes question results to this topic.

**Success Message Format:**
```typescript
{
  requestId: string;      // Original request ID
  userId1: string;        // First matched user ID
  userId2: string;        // Second matched user ID
  questionId: string;     // Selected question ID
  title: string;          // Question title
  question: string;       // Question description/content
  difficulty: string;     // Question difficulty level
  categories: string[];   // Question categories
  timestamp: number;      // Unix timestamp
}
```

**Success Example:**
```json
{
  "requestId": "req-123-abc",
  "userId1": "user-001",
  "userId2": "user-002",
  "questionId": "q-456-def",
  "title": "Two Sum",
  "question": "Given an array of integers...",
  "difficulty": "Easy",
  "categories": ["Array", "Hash Table"],
  "timestamp": 1697011201000
}
```

**Error Message Format:**
```typescript
{
  requestId: string;      // Original request ID
  userId1: string;        // First matched user ID
  userId2: string;        // Second matched user ID
  error: string;          // Error description
  timestamp: number;      // Unix timestamp
}
```

**Error Example:**
```json
{
  "requestId": "req-123-abc",
  "userId1": "user-001",
  "userId2": "user-002",
  "error": "No matching question found for the specified criteria",
  "timestamp": 1697011201000
}
```

## File Structure

```
src/kafka/
├── index.ts           # Main entry point, exports all Kafka functionality
├── types.ts           # TypeScript interfaces for messages
├── consumer.ts        # Kafka consumer for question-request topic
├── producer.ts        # Kafka producer for question-success topic
└── messageHandler.ts  # Business logic for handling requests
```

## Configuration

### Environment Variables

```bash
# Kafka broker (optional, defaults to localhost:9094)
KAFKA_BROKERS=localhost:9094

# Service port
PORT=5001
```

### Kafka Connection

The service connects to Kafka with these settings:

- **Client ID**: `question-service-producer` / `question-service-consumer`
- **Consumer Group**: `question-service-group`
- **Brokers**: `localhost:9094` (default)

## Usage

### Starting the Service

The Kafka services start automatically when you run the question service:

```bash
npm run dev    # Development
npm start      # Production
```

### Logs

The service provides detailed logs:

```
🚀 Starting Kafka services for question-service...
✅ Producer connected
✅ Question Consumer connected to Kafka
✅ Subscribed to question-request topic
✅ Question Consumer started consuming messages
🎉 All Kafka services started successfully
```

When processing messages:

```
📥 Received question request: {
  requestId: 'req-123',
  difficulty: 'Easy',
  categories: ['Array'],
  topic: 'question-request',
  partition: 0,
  offset: '42'
}
🔍 Processing question request: req-123
   Difficulty: Easy
   Categories: Array
✅ Sent question response for request: req-123
   Question: Two Sum
```

### Graceful Shutdown

The service handles SIGINT and SIGTERM signals gracefully:

```bash
# Press Ctrl+C or send SIGTERM
^C
⚠️ Received SIGINT, shutting down gracefully...
🛑 Stopping Kafka services...
Question Consumer disconnected from Kafka
Question Producer disconnected from Kafka
✅ All Kafka services stopped
```

## Question Matching Logic

The service finds questions using this criteria:

1. **Difficulty**: Must match exactly (case-sensitive)
2. **Categories**: At least one category must overlap
3. **Selection**: Random selection from matching questions

Database query:
```sql
SELECT * FROM "question"
WHERE difficulty = $1
  AND categories && $2  -- Array overlap operator
ORDER BY RANDOM()
LIMIT 1
```

## Error Handling

The service handles these error scenarios:

1. **No matching question**: Sends error message to `question-success`
2. **Database errors**: Logs error and sends error message
3. **Message parsing errors**: Logs error and continues processing
4. **Kafka connection errors**: Logs error and attempts reconnection

## Testing

### Manual Testing with Kafka

1. **Start Kafka** (if not already running):
```bash
cd services
docker compose up -d
```

2. **Produce a test message**:
```bash
docker exec -it kafka /opt/kafka/bin/kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic question-request \
  --property "parse.key=true" \
  --property "key.separator=:"

# Then enter:
req-test:{"requestId":"req-test","userId1":"user-001","userId2":"user-002","difficulty":"Easy","categories":["Array"],"timestamp":1697011200000}
```

3. **Consume responses**:
```bash
docker exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic question-success \
  --from-beginning \
  --property print.key=true
```

### Monitoring with Kafka UI

Access Kafka UI at http://localhost:8080 to:
- View topics and messages
- Monitor consumer groups
- Check partition offsets

## Integration Example

To integrate with the question service from another service:

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-service',
  brokers: ['localhost:9094']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'my-service-group' });

// Send question request (typically from matching service)
await producer.connect();
await producer.send({
  topic: 'question-request',
  messages: [{
    key: 'req-123',
    value: JSON.stringify({
      requestId: 'req-123',
      userId1: 'user-001',
      userId2: 'user-002',
      difficulty: 'Easy',
      categories: ['Array'],
      timestamp: Date.now()
    })
  }]
});

// Listen for response
await consumer.connect();
await consumer.subscribe({ topic: 'question-success' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const response = JSON.parse(message.value.toString());
    if (response.requestId === 'req-123') {
      console.log('Received question for users:', response.userId1, response.userId2);
      console.log('Question ID:', response.questionId);
      console.log('Question Title:', response.title);
    }
  }
});
```

## Troubleshooting

### Consumer not receiving messages

1. Check Kafka is running: `docker ps`
2. Verify topics exist:
   ```bash
   docker exec kafka /opt/kafka/bin/kafka-topics.sh \
     --list --bootstrap-server localhost:9092
   ```
3. Check consumer group status:
   ```bash
   docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
     --bootstrap-server localhost:9092 \
     --describe --group question-service-group
   ```

### Connection refused errors

- Ensure Kafka broker is accessible at `localhost:9094`
- Check `KAFKA_ADVERTISED_LISTENERS` in docker-compose.yaml
- Verify firewall rules allow connection

### Messages not being produced

1. Check producer connection in logs
2. Verify topic exists and has correct permissions
3. Check for errors in the message handler

## Performance Considerations

- **Message Processing**: Each message is processed sequentially
- **Database Queries**: Uses indexed columns for efficient matching
- **Random Selection**: O(1) with RANDOM() in PostgreSQL
- **Consumer Group**: Single consumer for now, can scale horizontally

## Future Enhancements

- [ ] Add message retry logic with dead letter queue
- [ ] Implement circuit breaker for database failures
- [ ] Add metrics and monitoring (Prometheus/Grafana)
- [ ] Support batch processing for multiple requests
- [ ] Add caching layer for frequently requested questions
- [ ] Implement priority queue for urgent requests
