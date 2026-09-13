import { isServer } from '@builder.io/qwik';
import { createAuthClient } from 'better-auth/client';
import { adminClient, jwtClient } from 'better-auth/client/plugins';

const FALLBACK = 'http://localhost:3001';
const ADMIN_ROLE_NAME = 'admin';

export function authBaseUrl(): string {
    if (isServer) {
        return process.env.AUTH_INTERNAL_HOST ?? process.env.AUTH_HOST ?? FALLBACK;
    }

    return document.querySelector('meta[name="auth-host"]')?.getAttribute('content') ?? FALLBACK;
}

export function publicAuthHost(): string {
    return isServer ? (process.env.AUTH_HOST ?? FALLBACK) : authBaseUrl();
}

export const authClient = createAuthClient({
    baseURL: authBaseUrl(),
    basePath: '/api/auth',
    plugins: [jwtClient(), adminClient()],
});

export function isAdmin(session: { role?: string | undefined | null }): boolean {
    return session.role === ADMIN_ROLE_NAME;
}
