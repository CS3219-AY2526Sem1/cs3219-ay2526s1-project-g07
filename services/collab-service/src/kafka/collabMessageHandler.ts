import type { EachMessagePayload } from 'kafkajs';
import { TOPICS_COLLAB, TOPICS_SUBSCRIBED } from './utils.js';
import { addSession, generateRandomSessionId, getSessionDetails } from '../sessions.js';
import type { AIQuestionResponseEvent, CollabSessionReadyEvent } from './events.js';
import { kafkaClient } from '../index.js';

export class CollabMessageHandler { 
    async handleMessage(payload: EachMessagePayload) {
        const {topic, partition, message} = payload;
        if (!message.value) {
            console.warn(`Received message with empty value on topic ${topic}, partition ${partition}`);
            return;
        }

        const value = message.value.toString();
        let event;
        try {
            event = JSON.parse(value);
        } catch (err) {
            console.error(`Failed to parse message value as JSON on topic ${topic}, partition ${partition}:`, value, err);
            return;
        }
        switch (topic) {
            case TOPICS_SUBSCRIBED.QUESTION_SUCCESS:
                await this.processMatchingSessionWithQuestion(event);
                break;
            case TOPICS_SUBSCRIBED.AI_QUESTION_HINT_REQUEST:
                await this.processAiServiceHintRequest(event);
                break;
            default:
                console.log(`Received message on unknown topic ${topic}: ${message.value?.toString()}`);
        }
    }

    private async processAiServiceHintRequest(event: any) {
        console.log(`Processing AI service hint request...`);

        console.log('Received kafka event on Ai-question-hint-request:', event);
        //Extract details from message
        const { userId, collabSessionId } = event.data;

        if (!userId || !collabSessionId) {
            console.error(`Missing userId or collabSessionId in AI hint request message`);
            return;
        }

        //Retrieve session details
        const sessionDetails = getSessionDetails(collabSessionId);
        if (!sessionDetails) {
            console.error(`No session details found for collabSessionId: ${collabSessionId}`);
            return;
        }

        const questionDetails = (sessionDetails.get("title") ?? "") +
            '\n' + 
            (sessionDetails.get("question") ?? "");

        const aiQuestionResponseEvent: Omit<AIQuestionResponseEvent, 'eventId'> = {
            eventType: TOPICS_COLLAB.AI_QUESTION_RESPONSE,
            data: {
                collabSessionId: collabSessionId,
                userId: userId,
                question: questionDetails
            }
        };

        await kafkaClient.getProducer().publishEvent(aiQuestionResponseEvent);

    }

    private async processMatchingSessionWithQuestion(event: any) {
        console.log(`Preparing collab session for matching session found...`);

        //Extract details from message
        const { requestId, userIdOne, userIdTwo, questionId, title, question, difficulty, categories, timestamp } = event.data;

        // Do not proceed if there are any missing values
        const requiredFields = { requestId, userIdOne, userIdTwo, questionId, title, question, difficulty, categories, timestamp };
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))
            .map(([key]) => key);
        if (missingFields.length > 0) {
            console.error(`Invalid message format for matching session with question. Missing fields: ${missingFields.join(', ')}`);
            return;
        }
        
        // Setup collab session from the information received
        const collabSessionId: string = generateRandomSessionId();
        const sessionDetails = new Map<string, string>(
            [
                ["user1", userIdOne], 
                ["user2", userIdTwo],
                ["questionId", questionId],
                ["title", title],
                ["question", question],
                ["difficulty", difficulty],
                ["categories", Array.isArray(categories) ? categories.join(",") : String(categories)],
            ]
        );
        addSession(collabSessionId, sessionDetails);

        console.log(
            `Collab session ready for users ${userIdOne} and ${userIdTwo}, questionId: ${questionId}, timestamp: ${timestamp}, collabSessionId: ${collabSessionId} \n
            Publishing to topic ${TOPICS_COLLAB.COLLAB_SESSION_READY}`
        );

        // Publish CollabSessionReadyEvent to kafka
        const collabSessionReadyEvent: Omit<CollabSessionReadyEvent, 'eventId'> = {
            eventType: TOPICS_COLLAB.COLLAB_SESSION_READY,
            data: {
                collabSessionId: collabSessionId,
                userIdOne: userIdOne,
                userIdTwo: userIdTwo
            }
        };

        await kafkaClient.getProducer().publishEvent(collabSessionReadyEvent);
    }
}
