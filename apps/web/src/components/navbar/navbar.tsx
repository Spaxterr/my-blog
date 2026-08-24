import { component$ } from '@builder.io/qwik';
import { Separator } from '@qwik-ui/headless';

export const NavBar = component$(() => {
    return (
        <nav class="flex flex-row w-full py-2 px-96 justify-between items-center">
            <div class="flex flex-row">
                <a href="/">Home</a>
                <Separator orientation="vertical" class="mx-4 border-ctp-surface2 border-l" />
                <a href="/blog">Blog</a>
            </div>
        </nav>
    );
});
