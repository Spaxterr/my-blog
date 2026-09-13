import { component$, isServer, Slot, useContextProvider, useSignal, useTask$ } from '@builder.io/qwik';
import { routeLoader$, useNavigate } from '@builder.io/qwik-city';
import { NavBar } from '~/components/navbar/navbar';
import { authClient } from '~/lib/auth';
import { ThemeContext, themeFromCookie } from '~/lib/theme';

export const useInitialTheme = routeLoader$((event) => themeFromCookie(event.cookie));

export const useAuthSession = routeLoader$(async (event) => {
    try {
        const { data } = await authClient.getSession({
            fetchOptions: {
                headers: {
                    cookie: event.request.headers.get('cookie') || '',
                },
            },
        });

        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
});

export default component$(() => {
    const initialTheme = useInitialTheme();
    const theme = useSignal(initialTheme.value);
    useContextProvider(ThemeContext, theme);
    const nav = useNavigate();

    useTask$(async ({ track }) => {
        const current = track(theme);
        if (isServer) {
            return;
        }

        await cookieStore.set({
            name: 'theme',
            value: current,
            path: '/',
            expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
        });

        if (current !== initialTheme.value) {
            nav(undefined, { forceReload: true });
        }
    });

    return (
        <div
            class={[
                theme.value,
                'flex min-h-screen flex-col dark:bg-ctp-base bg-ctp-surface0 text-ctp-text',
                'corner-lines',
            ]}
        >
            <NavBar />
            <main class="mx-auto flex w-full max-w-4xl md:max-w-6xl flex-1 flex-col px-4 py-10 sm:py-14 animated-item">
                <Slot />
            </main>
        </div>
    );
});
