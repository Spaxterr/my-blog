import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import BaselineWorkIcon from '~icons/ic/baseline-work';
import SharpLocationOnIcon from '~icons/ic/sharp-location-on';

export default component$(() => {
    const cat = `  ／l、
（ﾟ､ ｡ ７
  l  ~ヽ
  じしf_,)ノ`;

    return (
        <>
            <div class="flex flex-1 flex-col items-center justify-center">
                <section class="flex flex-col gap-4 bg-ctp-base dark:bg-ctp-surface0 p-8 relative">
                    <pre class="flex items-center md:flex-none md:absolute md:right-12 md:top-5 overflow-visible whitespace-pre ">
                        <code class="mx-auto md:mx-0 text-sm font-mono font-medium bg-linear-120 from-ctp-peach via-ctp-red-400 to-ctp-mauve-900 bg-clip-text text-transparent">
                            {cat}
                        </code>
                    </pre>
                    <h1 class="w-max flex flex-row text-5xl text-center md:text-left md:text-4xl font-bold tracking-tight items-center gap-x-2 bg-linear-120 from-ctp-peach via-ctp-red to-ctp-mauve-800 bg-clip-text text-transparent">
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
                    <p class="max-w-2xl leading-relaxed text-ctp-subtext0 md:text-left text-center">
                        I'm a software developer with over 8 years of experience in building web applications,
                        video game addons, developer tooling and cybersecurity solutions.
                    </p>
                    <span class="text-ctp-subtext0/70 border-l-2 border-l-ctp-surface2 p-2 max-w-3xl">
                        "There are only two types of companies: those that have been hacked, and those that
                        will be."
                        <br />- Robert Mueller - FBI Director 2012
                    </span>
                    <div class="mt-2 flex flex-wrap gap-3"></div>
                </section>
            </div>
            <section class="text-sm text-ctp-surface2 justify-self-end text-center">
                Theme colors by{' '}
                <a
                    href="https://catppuccin.com/"
                    rel="noopener"
                    target="_blank"
                    class="bg-linear-120 text-ctp-mauve-800 hover:brightness-125"
                >
                    Catppuccin
                </a>
            </section>
        </>
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
