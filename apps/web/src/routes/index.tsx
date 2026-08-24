import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import BaselineWorkIcon from '~icons/ic/baseline-work';
import SharpLocationOnIcon from '~icons/ic/sharp-location-on';

export default component$(() => {
    return (
        <div class="flex flex-1 flex-col items-center justify-center">
            <section class="flex flex-col gap-4 bg-ctp-surface0/50 p-6 px-8 inset-ring-ctp-blue-400 shadow-black/40 shadow-sm">
                <h1 class="text-5xl text-center md:text-left md:text-4xl font-bold tracking-tight text-ctp-text">
                    Hi, I'm Kevin
                </h1>
                <div class="flex flex-row gap-x-3 items-center justify-center md:justify-start text-sm text-ctp-text/50">
                    <span class="flex flex-row items-center gap-x-1">
                        <BaselineWorkIcon /> Full-stack Developer
                    </span>
                    <span class="flex flex-row items-center gap-x-1">
                        <SharpLocationOnIcon /> Sweden
                    </span>
                </div>
                <p class="max-w-2xl leading-relaxed text-ctp-subtext0">
                    I'm a software developer with over 8 years of experience in building web applications,
                    developer tooling and cybersecurity solutions. Welcome to my personal website.
                </p>
                <span class="text-ctp-surface2 border-l-3 border-l-ctp-blue-500 p-2">
                    “An idiot admires complexity, a genius admires simplicity" - Terry A. Davis
                </span>
                <div class="mt-2 flex flex-wrap gap-3"></div>
            </section>
        </div>
    );
});

export const head: DocumentHead = {
    title: 'Kevin | Developer',
    meta: [
        {
            name: 'description',
            content:
                'Personal site and blog of Kevin, a software developer building fast, type-safe things for the web.',
        },
    ],
};
