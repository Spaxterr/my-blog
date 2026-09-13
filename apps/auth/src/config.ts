import fs from 'node:fs/promises';
import path from 'node:path';
import type pino from 'pino';

export interface AppConfig {
    databaseUrl: string;
    redisUrl: string;
    discordClientId: string;
    discordClientSecret: string;
    githubClientId: string;
    githubClientSecret: string;
    loggingLevel: pino.Level;
    secret: string;
    baseUrl: string;
    webOrigin: string;
}

export async function getConfig(): Promise<AppConfig> {
    return {
        databaseUrl: await readSecret('DATABASE_URL', true),
        redisUrl: await readSecret('REDIS_URL', true),
        discordClientId: await readSecret('DISCORD_CLIENT_ID', true),
        discordClientSecret: await readSecret('DISCORD_CLIENT_SECRET', true),
        githubClientId: await readSecret('GITHUB_CLIENT_ID', true),
        githubClientSecret: await readSecret('GITHUB_CLIENT_SECRET', true),
        loggingLevel: ((await readSecret('LOG_LEVEL')) ?? 'info') as pino.Level,
        secret: await readSecret('SECRET', true),
        baseUrl: (await readSecret('BETTER_AUTH_URL')) || 'http://localhost:3001',
        webOrigin: (await readSecret('WEB_HOST')) || 'http://localhost:5173',
    };
}

async function readSecret(key: string, required: boolean = false): Promise<string> {
    const secretPath = path.join('/run/secrets', key.toLowerCase());
    try {
        const data = await fs.readFile(secretPath, 'utf8');
        return data.trim();
    } catch {
        const fallbackValue = process.env[key];
        if (!fallbackValue) {
            if (required) {
                throw new Error(`${key} secret not found in Docker secrets or environment`);
            } else {
                return '';
            }
        }
        return fallbackValue;
    }
}
