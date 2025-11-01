import type { MatchingSuccessMessage } from './types.js';
import { questionProducer } from './producer.js';
import { questionService } from '../services/questionService.js';

export async function handleMatchingSuccess(message: MatchingSuccessMessage): Promise<void> {
  const { user1, user2, preferences } = message;
  const { difficulty, topic } = preferences;

  try {
    console.log(`🔍 Processing matching success for users: ${user1} & ${user2}`);
    console.log(`   Difficulty: ${difficulty}`);
    console.log(`   Topic: ${topic}`);

    // Find a matching question based on difficulty and topic (category)
    const question = await questionService.findMatchingQuestion(difficulty, [topic]);

    if (!question) {
      // No question found - send error
      await questionProducer.sendQuestionError({
        user1,
        user2,
        error: 'No matching question found for the specified criteria',
        timestamp: Date.now()
      });
      console.log(`⚠️ No question found for users: ${user1} & ${user2}`);
      return;
    }

    // Question found - send success
    await questionProducer.sendQuestionSuccess({
      user1,
      user2,
      questionId: question.id,
      title: question.title,
      question: question.question,
      difficulty: question.difficulty,
      categories: question.categories,
      timestamp: Date.now()
    });

    console.log(`✅ Sent question response`);
    console.log(`   Question: ${question.title} (${question.id})`);
    console.log(`   For users: ${user1} & ${user2}`);
  } catch (error) {
    console.error(`❌ Error handling matching success for ${user1} & ${user2}:`, error);

    // Send error message
    try {
      await questionProducer.sendQuestionError({
        user1,
        user2,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      });
    } catch (producerError) {
      console.error(`❌ Failed to send error message for ${user1} & ${user2}:`, producerError);
    }
  }
}
