import type { QuestionRequestMessage } from './types.js';
import { questionProducer } from './producer.js';
import { questionService } from '../services/questionService.js';

export async function handleQuestionRequest(message: QuestionRequestMessage): Promise<void> {
  const { requestId, userId1, userId2, difficulty, categories } = message;

  try {
    console.log(`🔍 Processing question request: ${requestId}`);
    console.log(`   Users: ${userId1} & ${userId2}`);
    console.log(`   Difficulty: ${difficulty}`);
    console.log(`   Categories: ${categories.join(', ')}`);

    // Find a matching question based on difficulty and categories
    const question = await questionService.findMatchingQuestion(difficulty, categories);

    if (!question) {
      // No question found - send error
      await questionProducer.sendQuestionError({
        requestId,
        userId1,
        userId2,
        error: 'No matching question found for the specified criteria',
        timestamp: Date.now()
      });
      console.log(`⚠️ No question found for request: ${requestId}`);
      return;
    }

    // Question found - send success with flattened structure
    await questionProducer.sendQuestionSuccess({
      requestId,
      userId1,
      userId2,
      questionId: question.id,
      title: question.title,
      question: question.question,
      difficulty: question.difficulty,
      categories: question.categories,
      timestamp: Date.now()
    });

    console.log(`✅ Sent question response for request: ${requestId}`);
    console.log(`   Question: ${question.title} (${question.id})`);
    console.log(`   For users: ${userId1} & ${userId2}`);
  } catch (error) {
    console.error(`❌ Error handling question request ${requestId}:`, error);

    // Send error message
    try {
      await questionProducer.sendQuestionError({
        requestId,
        userId1,
        userId2,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      });
    } catch (producerError) {
      console.error(`❌ Failed to send error message for request ${requestId}:`, producerError);
    }
  }
}
