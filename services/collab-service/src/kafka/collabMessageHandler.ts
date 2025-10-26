import type { EachMessagePayload } from 'kafkajs';
import { TOPICS_COLLAB, TOPICS_SUBSCRIBED } from './utils.js';
import { addSession } from '../sessions.js';
import type { CollabSessionReadyEvent } from './events.js';
// import { kafkaClient } from '../index.js'; //TODO uncomment once index.ts uncomments kafkaClient

export class CollabMessageHandler { 
    async handleMessage(payload: EachMessagePayload) {
        const {topic, partition, message} = payload;
        if (!message.value) {
            console.warn(`Received message with empty value on topic ${topic}, partition ${partition}`);
            return;
        }

        const value = message.value.toString();
        switch (topic) {
            case TOPICS_SUBSCRIBED.QUESTION_SUCCESS:
                this.processMatchingSessionWithQuestion(value);
                break;
            default:
                console.log(`Received message on unknown topic ${topic}: ${message.value?.toString()}`);
        }
    }


    private async processMatchingSessionWithQuestion(value: string) {
        console.log(`Preparing collab session for matching session found...`);

        //Extract details from message
        const { requestId, userIdOne, userIdTwo, questionId, title, question, difficulty, categories, timestamp } = JSON.parse(value);

        // Do not proceed if there are any missing values
        const isThereMissingValue = !requestId || !userIdOne || !userIdTwo || !questionId || !title || !question || !difficulty || !categories || !timestamp;
        if (isThereMissingValue) {
            console.error(`Invalid message format for matching session with question`);
            return;
        }
        
        // Setup collab session from the information received
        const collabSessionId = "dummy-session-id"; //TODO placeholder; generate collabSessionId?
        const sessionDetails = new Map<string, string>(
            [
                ["user1", userIdOne], 
                ["user2", userIdTwo],
                ["questionId", questionId],
                ["title", title],
                ["question", question],
                ["difficulty", difficulty],
                ["categories", categories.join(",")],
            ]
        );
        addSession(collabSessionId, sessionDetails);

        console.log(
            `Collab session ready for users ${userIdOne} and ${userIdTwo}, questionId: ${questionId}, timestamp: ${timestamp} \n
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
        //TODO uncomment once kafkaClient is setup in index.ts
        // await kafkaClient.getProducer().publishEvent(collabSessionReadyEvent);
    }
}
