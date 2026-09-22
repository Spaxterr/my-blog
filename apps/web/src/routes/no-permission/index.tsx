import { component$ } from '@builder.io/qwik';
import SharpLockIcon from '~icons/ic/sharp-lock';
import { useAuthSession } from '../layout';

export default component$(() => {
    const session = useAuthSession();

    if (!session.value) {
        return <div class="mt-64 mx-auto bg-ctp-surface0 p-8">You must be signed in to view this page</div>;
    }

    return (
        <div class="flex flex-col items-center text-ctp-flamingo-400 gap-y-4 mt-64 bg-ctp-surface0 p-4 py-8">
            <SharpLockIcon class="text-4xl" />
            <div class="max-w-2/3 text-center text-ctp-subtext0">
                You do not have the necessary permissions to view this page. If you believe this is false,
                please try signing out and back in again to refresh your permission state.
            </div>
        </div>
    );
});
