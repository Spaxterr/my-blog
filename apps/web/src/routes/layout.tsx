import { component$, isServer, Slot, useContextProvider, useTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { NavBar } from '~/components/navbar/navbar';
import { DEFAULT_THEME, isTheme, ThemeContext } from '~/lib/theme';

export const useInitialTheme = routeLoader$((event) => {
    const theme = event.cookie.get('theme')?.value;
    if (isTheme(theme)) {
        return theme;
    } else {
        return DEFAULT_THEME;
    }
});

export default component$(() => {
    const theme = useInitialTheme();
    useContextProvider(ThemeContext, theme);

    useTask$(({ track }) => {
        const current = track(theme);
        if (isServer) {
            return;
        }
        document.cookie = `theme=${current};path=/;max-age=31536000;samesite=lax`;
    });

    return (
        <div class={[theme.value, 'flex min-h-screen flex-col bg-linear-to-br bg-ctp-base text-ctp-text']}>
            <NavBar />
            <main class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:py-14">
                <Slot />
            </main>
        </div>
    );
});
