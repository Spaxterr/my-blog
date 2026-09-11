import { isServer } from '@builder.io/qwik';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';

const FALLBACK = 'http://localhost:3001';

/**
 * Resolved at runtime, not build time, so one image deploys to any environment.
 * On the server that means AUTH_HOST; in the browser it means the meta tag that
 * root.tsx renders from the same value. Both sides therefore agree, and a client
 * re-render of the head is idempotent.
 */
export function authBaseUrl(): string {
    if (isServer) {
        return process.env.AUTH_HOST ?? FALLBACK;
    }

    return document.querySelector('meta[name="auth-host"]')?.getAttribute('content') ?? FALLBACK;
}

export const authClient = createAuthClient({
    baseURL: authBaseUrl(),
    basePath: '/api/auth',
    plugins: [jwtClient()],
});
