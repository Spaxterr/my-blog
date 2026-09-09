import { component$, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import type { User } from 'better-auth';
import { authClient } from '~/lib/auth';
import SharpLogoutIcon from '~icons/ic/sharp-logout';
import SharpPersonIcon from '~icons/ic/sharp-person';

interface Props {
    user: User;
}

export const UserStatus = component$<Props>(({ user }) => {
    const navigate = useNavigate();
    const loggingOut = useSignal<boolean>(false);

    return (
        <div class="flex flex-row gap-x-2 items-center">
            {user.image ? (
                <img
                    class="w-8 h-8 rounded-full"
                    src={user.image}
                    alt={`${user.name}'s avatar`}
                    height="128"
                    width="128"
                />
            ) : (
                <span class="min-w-8 min-h-8 bg-ctp-crust rounded-full flex justify-center items-center">
                    <SharpPersonIcon class="text-ctp-subtext0" />
                </span>
            )}
            <span>{user.name}</span>
            <button
                type="button"
                title="Log out"
                disabled={loggingOut.value}
                class={`hover:cursor-pointer ${loggingOut.value ? 'opacity-30' : ''}`}
                onClick$={async () => {
                    loggingOut.value = true;
                    await authClient.signOut();
                    loggingOut.value = false;
                    navigate();
                }}
            >
                <SharpLogoutIcon />
            </button>
        </div>
    );
});
