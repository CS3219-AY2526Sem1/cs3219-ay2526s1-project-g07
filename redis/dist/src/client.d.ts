import { createClient } from 'redis';
export declare class RedisClient {
    instance: ReturnType<typeof createClient>;
    constructor();
    init(database?: number): Promise<void>;
    private createRedisClient;
    quit(): Promise<void>;
}
