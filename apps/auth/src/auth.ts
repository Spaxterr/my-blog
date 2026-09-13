import { createHash, randomUUIDv7 } from 'node:crypto';
import { redisStorage } from '@better-auth/redis-storage';
import { type BetterAuthPlugin, betterAuth } from 'better-auth';
import { admin, bearer, openAPI } from 'better-auth/plugins';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import type { AppConfig } from './config.js';

const hashEmail = (profile: { email?: string | null }) => ({
    email: `${createHash('sha256')
        .update(profile.email ?? '')
        .digest('hex')}@invalid`,
});

const plugins: BetterAuthPlugin[] = [bearer(), admin()];
if (process.env.NODE_ENV === 'development') {
    plugins.push(openAPI());
}

export function setupAuth(config: AppConfig) {
    const redis = new Redis(config.redisUrl);

    const auth = betterAuth({
        baseURL: config.baseUrl,
        trustedOrigins: [config.webOrigin],
        socialProviders: {
            discord: {
                clientId: config.discordClientId,
                clientSecret: config.discordClientSecret,
                mapProfileToUser: hashEmail,
            },
            github: {
                clientId: config.githubClientId,
                clientSecret: config.githubClientSecret,
                mapProfileToUser: hashEmail,
            },
        },
        user: {
            deleteUser: {
                enabled: true,
            },
        },
        database: new Pool({
            connectionString: config.databaseUrl,
        }),
        secret: config.secret,
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
        plugins: plugins,
    });

    return auth;
}
