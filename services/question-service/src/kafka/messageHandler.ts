import type { MatchingSuccessMessage } from './types.js';
import { questionProducer } from './producer.js';
import { questionService } from '../services/questionService.js';

export async function handleMatchingSuccess(message: MatchingSuccessMessage): Promise<void> {
  const { userId: userIdRaw, peerId: peerIdRaw, preferences } = message;
  const { topic, difficulty } = preferences;

  // Extract actual ID strings (handle both object and string formats)
  const userId = typeof userIdRaw === 'string' ? userIdRaw : userIdRaw.id;
  const peerId = typeof peerIdRaw === 'string' ? peerIdRaw : peerIdRaw.id;

  try {
    console.log(`🔍 Processing matching success`);
    console.log(`   Users: ${userId} & ${peerId}`);
    console.log(`   Difficulty: ${difficulty}`);
    console.log(`   Topic: ${topic}`);

    // Find a matching question based on difficulty and topic
    const question = await questionService.findMatchingQuestion(difficulty, [topic]);

    if (!question) {
      // No question found - send error
      await questionProducer.sendQuestionError({
        userId,
        peerId,
        error: 'No matching question found for the specified criteria',
        timestamp: Date.now()
      });
      console.log(`⚠️ No question found for users: ${userId} & ${peerId}`);
      return;
    }

    // Question found - send success
    await questionProducer.sendQuestionSuccess({
      userId,
      peerId,
      questionId: question.id,
      title: question.title,
      question: question.question,
      difficulty: question.difficulty,
      topic,
      timestamp: Date.now()
    });

    console.log(`✅ Sent question response`);
    console.log(`   Question: ${question.title} (${question.id})`);
    console.log(`   For users: ${userId} & ${peerId}`);
  } catch (error) {
    console.error(`❌ Error handling matching success for users ${userId} & ${peerId}:`, error);

    // Send error message
    try {
      await questionProducer.sendQuestionError({
        userId,
        peerId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      });
    } catch (producerError) {
      console.error(`❌ Failed to send error message for users ${userId} & ${peerId}:`, producerError);
    }
  }
}
