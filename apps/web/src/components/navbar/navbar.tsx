import { component$, useContext } from '@builder.io/qwik';
import { Separator } from '@qwik-ui/headless';
import { ThemeContext } from '~/lib/theme';
import ThemeSelect from '../theme-select/theme-select';

export const NavBar = component$(() => {
    const theme = useContext(ThemeContext);

    return (
        <nav class="flex flex-row w-full py-2 justify-between items-center md:w-2/3 mx-auto">
            <div class="flex flex-row">
                <a href="/">Home</a>
                <Separator orientation="vertical" class="mx-4 border-ctp-surface2 border-l" />
                <a href="/blog">Blog</a>
            </div>
            <ThemeSelect theme={theme} />
        </nav>
    );
});
