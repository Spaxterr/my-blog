import { component$, useSignal } from '@builder.io/qwik';
import { Form, routeAction$ } from '@builder.io/qwik-city';
import { Modal } from '@qwik-ui/headless';
import { ResponseError } from '@shared/contracts';
import TagSelect from '~/components/tag-select/tag-select';
import { apiClient } from '~/lib/api';
import { isAdmin } from '~/lib/auth';
import { useCreateTag, useTags } from '~/lib/loaders';
import { useAuthSession } from '../layout';
import NoPermission from '../no-permission';

export { useCreateTag, useTags };

export const useCreatePost = routeAction$(async (data, event) => {
    try {
        await apiClient.postsCreatePost(
            {
                createPostPayload: {
                    title: String(data.title),
                    summary: String(data.summary),
                    content: String(data.content),
                    tags: [data.tags ?? []].flat().map(String).filter(Boolean),
                    category: 'blog',
                },
            },
            {
                headers: {
                    cookie: event.request.headers.get('cookie') || '',
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (err) {
        if (err instanceof ResponseError) {
            return event.fail(err.response.status, {
                errorMessage: (await err.response.text()) || err.response.statusText,
            });
        }
        throw err;
    }

    throw event.redirect(302, '/blog');
});

export default component$(() => {
    const session = useAuthSession();
    const create = useCreatePost();
    const tags = useTags();
    const createTag = useCreateTag();
    const tagModalOpen = useSignal(false);
    const newTagLabel = useSignal('');
    const newTagColor = useSignal('#cba6f7');

    if (!session.value || !isAdmin(session.value.user)) {
        return <NoPermission />;
    }

    return (
        <div class="flex flex-col w-full gap-y-8">
            <h1 class="w-max text-5xl text-center md:text-left md:text-4xl font-bold tracking-tight bg-linear-120 from-ctp-peach via-ctp-red to-ctp-mauve-800 bg-clip-text text-transparent">
                New Blog Post
            </h1>
            <Form action={create} class="flex flex-col gap-y-4 bg-ctp-mantle dark:bg-ctp-surface0 p-8 px-10">
                <label class="flex flex-col gap-y-1">
                    Title
                    <input
                        name="title"
                        required
                        maxLength={200}
                        class="bg-ctp-base dark:bg-ctp-mantle py-2 px-2 outline-none"
                    />
                </label>
                <label class="flex flex-col gap-y-1">
                    Summary
                    <input
                        name="summary"
                        required
                        maxLength={1000}
                        class="bg-ctp-base dark:bg-ctp-mantle py-2 px-2 outline-none"
                    />
                </label>
                <div class="flex flex-col gap-y-1">
                    Tags
                    <div class="flex flex-row items-baseline gap-x-2">
                        <TagSelect tags={tags.value} />
                        <Modal.Root bind:show={tagModalOpen}>
                            <Modal.Trigger class="button-secondary">New Tag</Modal.Trigger>
                            <Modal.Panel class="modal-panel shadow-sm shadow-black/20 w-lg">
                                <Modal.Title>New Tag</Modal.Title>
                                <input
                                    bind:value={newTagLabel}
                                    placeholder="Label"
                                    class="bg-ctp-base dark:bg-ctp-surface0 py-1 px-1 outline-none"
                                />
                                <input
                                    bind:value={newTagColor}
                                    type="color"
                                    class="bg-ctp-base dark:bg-ctp-surface0 py-1 px-1 outline-none"
                                />
                                {createTag.value?.errorMessage && (
                                    <p class="text-ctp-red text-sm">{createTag.value.errorMessage}</p>
                                )}
                                <div class="flex flex-row gap-x-1 justify-end">
                                    <Modal.Close class="modal-close button-secondary">Cancel</Modal.Close>
                                    <button
                                        type="button"
                                        class="button-primary"
                                        disabled={createTag.isRunning}
                                        onClick$={async () => {
                                            if (!newTagLabel.value) return;
                                            const { value } = await createTag.submit({
                                                label: newTagLabel.value,
                                                color: newTagColor.value,
                                            });
                                            if (value.failed) return;
                                            newTagLabel.value = '';
                                            tagModalOpen.value = false;
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </Modal.Panel>
                        </Modal.Root>
                    </div>
                </div>
                <label class="flex flex-col gap-y-1">
                    Content (Markdown)
                    <textarea
                        name="content"
                        required
                        maxLength={100000}
                        rows={20}
                        class="bg-ctp-base dark:bg-ctp-mantle py-2 px-2 outline-none font-mono"
                    />
                </label>
                {create.value?.errorMessage && (
                    <p class="text-ctp-red text-sm">{create.value.errorMessage}</p>
                )}
                <div class="flex flex-row justify-end">
                    <button type="submit" class="button-primary" disabled={create.isRunning}>
                        Publish
                    </button>
                </div>
            </Form>
        </div>
    );
});
