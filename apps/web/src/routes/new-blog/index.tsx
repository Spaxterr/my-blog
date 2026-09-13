import { component$ } from '@builder.io/qwik';
import { Form, routeAction$ } from '@builder.io/qwik-city';
import { ResponseError } from '@shared/contracts';
import { apiClient } from '~/lib/api';
import { isAdmin } from '~/lib/auth';
import { useAuthSession } from '../layout';

export const useCreatePost = routeAction$(async (data, event) => {
    try {
        await apiClient.postsCreatePost(
            {
                createPostPayload: {
                    title: String(data.title),
                    summary: String(data.summary),
                    content: String(data.content),
                    tags: String(data.tags ?? '')
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
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

    if (!session.value || !isAdmin(session.value.user)) {
        return <div>You do not have permission to view the page.</div>;
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
                <label class="flex flex-col gap-y-1">
                    Tags
                    <input
                        name="tags"
                        placeholder="comma, separated"
                        class="bg-ctp-base dark:bg-ctp-mantle py-2 px-2 outline-none"
                    />
                </label>
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
