import { component$ } from '@builder.io/qwik';
import { authClient } from '~/lib/auth';
import { useAuthSession } from '../layout';

export default component$(() => {
    const userSession = useAuthSession();

    if (!userSession.value) {
        return <div>Log in to view your profile</div>;
    }

    return (
        <div>
            <div class="bg-ctp-mantle dark:bg-ctp-surface0 p-8 px-10 flex flex-col gap-y-4">
                <div>
                    {userSession.value.user.image && (
                        <img
                            src={userSession.value.user.image}
                            alt={`${userSession.value.user.name}'s avatar`}
                            height="128"
                            width="128"
                        />
                    )}
                    <h2 class="w-max flex flex-row text-5xl text-center md:text-left md:text-4xl font-bold tracking-tight items-center gap-x-2 bg-linear-120 from-ctp-peach via-ctp-red to-ctp-mauve-800 bg-clip-text text-transparent">
                        {userSession.value.user.name}
                    </h2>
                </div>
                <ul class="grid grid-cols-1 font-mono">
                    <li>ID: {userSession.value.user.id}</li>
                    <li>Created: {userSession.value.user.createdAt.toLocaleDateString()}</li>
                </ul>
                <div>
                    <button
                        type="button"
                        class="button-danger"
                        onClick$={async () => {
                            await authClient.deleteUser({
                                fetchOptions: {
                                    onSuccess: () => {
                                        location.reload();
                                    },
                                },
                            });
                        }}
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
});
