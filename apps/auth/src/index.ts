import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import pino from 'pino';
import { appConfig, auth } from './auth.config.js';

const app = new Hono();
const logger = pino({
    level: appConfig.loggingLevel,
});

app.use(
    '/api/auth/*',
    cors({
        origin: process.env.WEB_HOST ?? 'http://localhost:5173',
        credentials: true,
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
    }),
);

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
    return auth.handler(c.req.raw);
});

serve(
    {
        fetch: app.fetch,
        port: 3001,
    },
    (info) => {
        logger.info(`Server is running on http://localhost:${info.port}`);
    },
);
