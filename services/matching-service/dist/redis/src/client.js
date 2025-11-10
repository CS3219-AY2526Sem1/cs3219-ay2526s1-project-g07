"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
class RedisClient {
    constructor() {
        this.instance = {};
    }
    async init(database = 0) {
        this.instance = await this.createRedisClient(database);
    }
    async createRedisClient(database = 0) {
        // Start redis local with `npm run redis-local`
        dotenv_1.default.config({
            path: path_1.default.resolve(__dirname, '../.env'),
        });
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT;
        const client = (0, redis_1.createClient)({
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
        if (this.instance && this.instance.isOpen) {
            await this.instance.quit();
            console.log('Redis client safely closed.');
        }
        else {
            console.log('Redis client already closed or not initialized.');
        }
        if (!this.instance.isOpen) {
            console.log('Redis client already disconnected');
            return;
        }
        // Clear all data of the current Redis database as matching service is stateless
        await this.instance.flushDb();
        await this.instance.quit();
        console.log('✅ Redis client disconnected');
    }
}
exports.RedisClient = RedisClient;
