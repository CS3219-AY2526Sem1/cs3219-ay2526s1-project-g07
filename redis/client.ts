import redis from 'redis';
import dotenv from 'dotenv';

export class RedisClient {
  static instance: ReturnType<typeof redis.createClient>;

  static async createClient(database = 0) {
    if (RedisClient.instance) {
      // Should only create one instance (singleton)
      return RedisClient.instance;
    }

    // Start redis local with `npm run redis-local`
    dotenv.config();
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const client = redis.createClient({
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

    RedisClient.instance = client;
    return client;
  }

  static async quit() {
    if (RedisClient.instance !== undefined) {
      // Clear all data of the current Redis database as matching service is stateless
      await RedisClient.instance.flushDb();
      await RedisClient.instance.quit();
      RedisClient.instance = undefined;
      console.log('✅ Redis client disconnected');
    }
  }
}
