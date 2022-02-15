import { createClient, RedisClientType, RedisScripts } from 'redis';
import promiseRetry from 'promise-retry';
const { env } = process;

export class Redis {
  private static instance: Redis | null = null;
  private client!: RedisClientType<Record<string, any>, RedisScripts>;

  private constructor() {}

  public static async getInstance(): Promise<Redis> {
    if (Redis.instance === null) {
      const instance = await Redis.initInstance();
      return instance;
    }
    return Redis.instance;
  }

  private static async initInstance(): Promise<Redis> {
    const instance = new Redis();
    const client = createClient({ url: env.REDIS_URL });
    await promiseRetry(async () => await client.connect(), {
      retries: 3,
      maxTimeout: 30000,
    });

    instance.client = client;
    Redis.instance = instance;
    return Redis.instance;
  }

  private static set(key: string, id: string) {
    return env.REDIS_PREFIX + key + ':' + id;
  }

  public getKey(key: string, id: string): Promise<string | null> {
    return this.client.get(Redis.set(key, id));
  }

  public setKey(key: string, id: string, val: string): Promise<unknown> {
    return this.client.set(Redis.set(key, id), val);
  }

  public setKeyWithExpiry(
    key: string,
    id: string,
    val: string,
    exp: number
  ): Promise<unknown> {
    return this.client.set(Redis.set(key, id), val, { EX: exp });
  }

  public delKey(key: string, id: string): Promise<number> {
    return this.client.del(Redis.set(key, id));
  }
}

export default Redis;
