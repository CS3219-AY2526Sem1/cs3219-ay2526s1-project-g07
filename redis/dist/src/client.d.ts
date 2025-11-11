import { createClient } from 'redis';
export declare class RedisClient {
    instance: ReturnType<typeof createClient>;
    constructor();
    init(host: string, port: number, database?: number): Promise<void>;
    private createRedisClient;
    quit(): Promise<void>;
}
