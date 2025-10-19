import redis from 'redis';
import dotenv from 'dotenv';

export class RedisClient {
  static async createClient() {
    // Remember to set the .env variables in the root of this service
    // Start redis local with `npm run redis-local`
    dotenv.config();
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const client = redis.createClient({
      socket: {
        host: host || '127.0.0.1',
        port: port ? parseInt(port) : 6379,
      },
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();

    console.log('✅ Redis client connected to ', `${host}:${port}`);

    const pong = await client.ping();
    console.log('Redis PING:', pong);

    return client;
  }
}
