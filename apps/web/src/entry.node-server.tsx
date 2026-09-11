import { createServer } from 'node:http';
import { getRequestEvent } from '@builder.io/qwik-city';
import { createQwikCity } from '@builder.io/qwik-city/middleware/node';
import qwikCityPlan from '@qwik-city-plan';
import render from './entry.ssr';

const PORT = process.env.PORT ?? 3004;

const { router, notFound, staticFile } = createQwikCity({
    render,
    qwikCityPlan,
    static: {
        cacheControl: 'public, max-age=31536000, immutable',
    },
});

const server = createServer();

process.on('uncaughtExceptionMonitor', (error, origin) => {
    const requestEv = getRequestEvent();
    if (requestEv) {
        console.error('Unhandled exception during request', {
            origin,
            method: requestEv.method,
            url: requestEv.url.href,
            headersSent: requestEv.headersSent,
            error,
        });
        return;
    }

    console.error('Unhandled exception outside request', { origin, error });
});

server.on('request', (req, res) => {
    staticFile(req, res, () => {
        router(req, res, () => {
            notFound(req, res, () => {});
        });
    });
});

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    // biome-ignore lint/suspicious/noConsole: Node entry point, need a log to see it working
    console.info(`Node server listening on http://localhost:${PORT}`);
});
