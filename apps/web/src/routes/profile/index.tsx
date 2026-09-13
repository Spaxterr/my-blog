import { component$ } from '@builder.io/qwik';
import { Modal } from '@qwik-ui/headless';
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
                    <li>Role: {userSession.value.user.role ?? 'None'}</li>
                </ul>
                <div>
                    <Modal.Root>
                        <Modal.Trigger class="button-danger">Delete Account</Modal.Trigger>
                        <Modal.Panel class="modal-panel shadow-sm shadow-black/20">
                            <Modal.Title>Delete Account</Modal.Title>
                            <Modal.Description>
                                Deleting your account will remove all associated data and is non-reversable.
                                Signing in again will create a new account.
                            </Modal.Description>
                            <div class="flex flex-row gap-x-1 justify-end">
                                <Modal.Close class="modal-close button-secondary">Cancel</Modal.Close>
                                <Modal.Close
                                    class="modal-close button-danger"
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
                                </Modal.Close>
                            </div>
                        </Modal.Panel>
                    </Modal.Root>
                </div>
            </div>
        </div>
    );
});
