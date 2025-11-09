import redis from 'redis';
export declare class RedisClient {
    instance: ReturnType<typeof redis.createClient>;
    constructor();
    init(database?: number): Promise<void>;
    private createClient;
    quit(): Promise<void>;
}
