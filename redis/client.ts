import redis from 'redis';
import dotenv from 'dotenv';

export class RedisClient {
  instance: ReturnType<typeof redis.createClient>;

  constructor () {
    this.instance = {} as ReturnType<typeof redis.createClient>;
  }
  
  async init(database = 0) {
    this.instance = await this.createClient(database);
  }

  private async createClient(database = 0) {
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
    
    return client;
  }

  async quit() {
    // Clear all data of the current Redis database as matching service is stateless
    await this.instance.flushDb();
    await this.instance.quit();
    console.log('✅ Redis client disconnected');
  }
}
