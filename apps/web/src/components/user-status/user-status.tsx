import { component$, useSignal } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Modal } from '@qwik-ui/headless';
import type { User } from 'better-auth';
import { authClient } from '~/lib/auth';
import SharpLogoutIcon from '~icons/ic/sharp-logout';
import SharpPersonIcon from '~icons/ic/sharp-person';

interface Props {
    user: User;
}

export const UserStatus = component$<Props>(({ user }) => {
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
            <Link href="/profile/">{user.name}</Link>
            <Modal.Root class="flex flex-row gap-x-2 items-center">
                <Modal.Trigger
                    class={`hover:cursor-pointer hover:text-ctp-mauve-400 ${loggingOut.value ? 'opacity-30' : ''}`}
                    title="Log out"
                >
                    <div>
                        <SharpLogoutIcon />
                    </div>
                </Modal.Trigger>
                <Modal.Panel class="modal-panel shadow-sm shadow-black/20">
                    <Modal.Title>Log Out?</Modal.Title>
                    <Modal.Description>
                        Please confirm that you want to sign out of your account.
                    </Modal.Description>
                    <div class="flex flex-row gap-x-1 justify-end">
                        <Modal.Close class="modal-close button-secondary">Cancel</Modal.Close>
                        <Modal.Close
                            class="modal-close button-primary"
                            onClick$={async () => {
                                loggingOut.value = true;
                                await authClient.signOut({
                                    fetchOptions: {
                                        onSuccess: () => {
                                            loggingOut.value = false;
                                            location.reload();
                                        },
                                        onError: () => {
                                            loggingOut.value = false;
                                        },
                                    },
                                });
                            }}
                        >
                            Log Out
                        </Modal.Close>
                    </div>
                </Modal.Panel>
            </Modal.Root>
        </div>
    );
});
