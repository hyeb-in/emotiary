import { createClient } from 'redis';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  legacyMode: false,
});

redisClient.connect().then();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));
export const setValue = (userId: string, refreshToken: string) =>
  redisClient.set(String(userId), refreshToken, { EX: 60 * 60 });

export const getValue = (userId: string) => redisClient.get(String(userId));
export const deleteValue = (key: string) => redisClient.del(String(key));
