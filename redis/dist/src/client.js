"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
const redis_1 = require("redis");
class RedisClient {
    instance;
    constructor() {
        this.instance = {};
    }
    async init(host, port, database = 0) {
        this.instance = await this.createRedisClient(host, port, database);
    }
    async createRedisClient(host, port, database = 0) {
        try {
            const client = (0, redis_1.createClient)({
                socket: {
                    host: host || '127.0.0.1',
                    port: port || 6379,
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
        catch (error) {
            console.error('Failed to connect to Redis server:', error);
            throw error;
        }
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
