import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export const TopLoader = component$(() => {
    const state = useSignal<'idle' | 'loading' | 'done'>('idle');
    const loc = useLocation();

    useTask$(({ track, cleanup }) => {
        if (track(() => loc.isNavigating)) {
            state.value = 'loading';
            return;
        }
        if (state.value !== 'loading') {
            return;
        }
        state.value = 'done';
        const t = setTimeout(() => {
            state.value = 'idle';
        }, 400);
        cleanup(() => clearTimeout(t));
    });

    return <div class={['top-loader', state.value]} role="progressbar" aria-hidden={state.value === 'idle'} />;
});
