import { randomUUIDv7 } from 'node:crypto';
import { redisStorage } from '@better-auth/redis-storage';
import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import type { AppConfig } from './config.js';

export function setupAuth(config: AppConfig) {
    const redis = new Redis(config.redisUrl);

    const auth = betterAuth({
        baseURL: 'http://localhost:3001',
        trustedOrigins: ['http://localhost:5173'],
        socialProviders: {
            discord: {
                clientId: config.discordClientId,
                clientSecret: config.discordClientSecret,
                // ponytail: default redirectURI (baseURL + /api/auth/callback/discord) is the correct one
            },
            github: {
                clientId: config.githubClientId,
                clientSecret: config.githubClientSecret,
            },
        },
        database: new Pool({
            connectionString: config.databaseUrl,
        }),
        advanced: {
            database: {
                joins: true,
                generateId: () => {
                    return randomUUIDv7();
                },
            },
        },
        secondaryStorage: redisStorage({
            client: redis,
            keyPrefix: 'better-auth:',
        }),
        plugins: [bearer()],
    });

    return auth;
}
