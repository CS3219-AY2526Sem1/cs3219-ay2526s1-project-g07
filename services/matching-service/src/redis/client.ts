import redis from 'redis';

export class RedisClient {
  static async createClient() {
    const client = redis.createClient();

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();

    console.log('✅ Redis client connected');

    const pong = await client.ping();
    console.log('Redis PING:', pong);

    return client;
  }
}
