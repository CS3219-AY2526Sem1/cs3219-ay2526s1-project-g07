"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
const redis_1 = __importDefault(require("redis"));
const dotenv_1 = __importDefault(require("dotenv"));
class RedisClient {
    constructor() {
        this.instance = {};
    }
    async init(database = 0) {
        this.instance = await this.createClient(database);
    }
    async createClient(database = 0) {
        // Start redis local with `npm run redis-local`
        dotenv_1.default.config();
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT;
        const client = redis_1.default.createClient({
            socket: {
                host: host || '127.0.0.1',
                port: port ? parseInt(port) : 6379,
            },
            database: database,
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
        console.log('✅ Redis client connected to ', `${host}:${port}`);
        const pong = await client.ping();
        console.log('Redis PING:', pong);
        return client;
    }
    async quit() {
        // Clear all data of the current Redis database as matching service is stateless
        await this.instance.flushDb();
        await this.instance.quit();
        console.log('✅ Redis client disconnected');
    }
}
exports.RedisClient = RedisClient;
