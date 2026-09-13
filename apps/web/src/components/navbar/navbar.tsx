import { component$, useContext } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Separator } from '@qwik-ui/headless';
import { isAdmin } from '~/lib/auth';
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
            <div class="flex flex-row gap-x-4">
                <Link class="p-2" href="/">
                    Home
                </Link>
                <Separator orientation="vertical" class="border-ctp-surface2 border-l" />
                <Link class="p-2" href="/blog/">
                    Blog
                </Link>
                {isAdmin(authSession.value?.user) && (
                    <Link prefetch={false} class="p-2" href="/new-blog/">
                        New Blog
                    </Link>
                )}
            </div>
            <div class="flex flex-row gap-x-8 items-center-safe">
                <ThemeSelect theme={theme} />
                {authSession.value ? <UserStatus user={authSession.value.user} /> : <LoginSelect />}
            </div>
        </nav>
    );
});
