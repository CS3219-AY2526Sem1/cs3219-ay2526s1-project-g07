"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const kafkajs_1 = require("kafkajs");
const api_endpoints_1 = require("../../../shared/api-endpoints");
const matching_service_producer_1 = require("./matching-service-producer");
const matching_service_consumer_1 = require("./matching-service-consumer");
const matcher_js_1 = require("./matcher.js");
const consumer_message_handler_1 = require("./consumer-message-handler");
const matching_ws_1 = require("./matching-ws");
const client_1 = require("../../../redis/src/client");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
async function main() {
    // --- Middleware ---
    app.use((0, cors_1.default)({
        origin: "*",
    }));
    app.use(express_1.default.json());
    const kafka = new kafkajs_1.Kafka({
        clientId: 'matching-service',
        brokers: KAFKA_BROKERS,
    });
    // --- Core Components ---
    const redisClient = new client_1.RedisClient();
    await redisClient.init();
    const matcher = new matcher_js_1.Matcher(redisClient);
    // --- Websocket & Kafka Connections ---
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    const ws = new matching_ws_1.MatchingWS(io, matcher);
    const connectToWebSocket = () => {
        try {
            ws.init();
        }
        catch (error) {
            console.error('Error initializing WebSocket:', error);
        }
    };
    // Kafka Producer & Consumer
    const messageHandler = new consumer_message_handler_1.ConsumerMessageHandler(matcher, ws);
    const producer = new matching_service_producer_1.MatchingServiceProducer(kafka, matcher);
    const consumer = new matching_service_consumer_1.MatchingServiceConsumer(kafka, messageHandler);
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json(err.message);
    });
    const connectToKafka = async () => {
        try {
            await producer.init();
            await consumer.init();
        }
        catch (error) {
            console.error('Error connecting to Kafka:', error);
        }
    };
    // --- Server & Process Related Logic ---
    httpServer.listen(PORT, () => {
        connectToKafka();
        console.log(`Matching service listening on port ${PORT}`);
        connectToWebSocket();
        console.log('WebSocket server is ready for connections');
    });
    httpServer.on('close', async () => {
        await redisClient.quit();
    });
    process.on('SIGINT', async () => {
        console.log('\n🛑 Caught SIGINT. Shutting down...');
        await redisClient.quit();
        httpServer.close(() => process.exit(0));
    });
    process.on('SIGTERM', async () => {
        await redisClient.quit();
        httpServer.close(() => process.exit(0));
    });
    // --- API Endpoints ---
    // Health check endpoint for Docker
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'matching-service',
            uptime: process.uptime()
        });
    });
    app.post(api_endpoints_1.API_ENDPOINTS_MATCHING.MATCHING_REQUEST, async (req, res) => {
        const matchingRequest = req.body;
        console.log(`Received matching request for user id: ${matchingRequest.userId.id}`);
        matcher.enqueue(matchingRequest.userId, matchingRequest.preferences);
        return res.status(200).send({ message: `Matching service received session id: ${matchingRequest.userId.id}` });
    });
    app.post(api_endpoints_1.API_ENDPOINTS_MATCHING.MATCHING_CANCEL, async (req, res) => {
        const { userId } = req.body;
        console.log(`Received matching cancel request for user id: ${userId.id}`);
        matcher.dequeue(userId);
        return res.status(200).send({ message: `Matching service cancelled matching for user id: ${userId.id}` });
    });
    // --- Error Handling Middleware ---
    app.use((err, req, res, next) => {
        console.error('Error occurred:', err);
        res.status(500).send({ error: 'An unexpected error occurred.' });
    });
    app.listen(PORT, () => {
        console.log(`✅ Matching Service API is running at http://localhost:${PORT}`);
    });
}
main().catch((err) => {
    console.error('Failed to start matching service:', err);
    process.exit(1);
});
