import { component$, useContext } from '@builder.io/qwik';
import { Separator } from '@qwik-ui/headless';
import { ThemeContext } from '~/lib/theme';
import { useAuthSession } from '~/routes/layout';
import { LoginSelect } from '../login-select/login-select';
import ThemeSelect from '../theme-select/theme-select';
import { UserStatus } from '../user-status/user-status';

export const NavBar = component$(() => {
    const theme = useContext(ThemeContext);
    const authSession = useAuthSession();

    return (
        <nav class="flex flex-row w-full py-2 justify-between items-center md:w-2/3 mx-auto">
            <div class="flex flex-row">
                <a href="/">Home</a>
                <Separator orientation="vertical" class="mx-4 border-ctp-surface2 border-l" />
                <a href="/blog">Blog</a>
            </div>
            <div class="flex flex-row gap-x-8 items-center-safe">
                <ThemeSelect theme={theme} />
                {authSession.value ? <UserStatus user={authSession.value.user} /> : <LoginSelect />}
            </div>
        </nav>
    );
});
