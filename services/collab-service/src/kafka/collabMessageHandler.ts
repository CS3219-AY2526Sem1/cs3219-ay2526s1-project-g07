import type { EachMessagePayload } from 'kafkajs';
import { TOPICS_COLLAB, TOPICS_SUBSCRIBED } from './utils.js';

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


    private processMatchingSessionWithQuestion(value: string) {
        console.log(`Preparing collab session for matching session found...`);

        //TODO verify the kafka message keys
        const { userIdOne, userIdTwo, sessionId, questionId, questionDetails } = JSON.parse(value);

        /*
        question-success
            QuestionId
            UserId1
            UserId2
            title
            question
            difficulty
            categories (array)
        */
        
        //TODO: Setup collab session from the information received
        

        //TODO: Publish to collab-session-ready topic
        console.log(`Collab session ready for sessionId: ${sessionId}, questionId: ${questionId} \n 
            Publishing to topic ${TOPICS_COLLAB.COLLAB_SESSION_READY}`);
        
        
    }
}
