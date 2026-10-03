import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Modal } from '@qwik-ui/headless';
import { isAdmin } from '~/lib/auth';
import { useBlogPosts, useDeleteBlogPost } from '~/lib/blog-posts';
import { useCategories, useDeleteCategory } from '~/lib/categories';
import { useDeleteTag, useTags } from '~/lib/tags';
import SharpDeleteForeverIcon from '~icons/ic/sharp-delete-forever';
import { useAuthSession } from '../layout';
import NoPermission from '../no-permission';

export { useBlogPosts, useCategories, useDeleteBlogPost, useDeleteCategory, useDeleteTag, useTags };

export default component$(() => {
    const session = useAuthSession();
    const posts = useBlogPosts();
    const tags = useTags();
    const categories = useCategories();
    const deletePost = useDeleteBlogPost();
    const deleteTag = useDeleteTag();
    const deleteCategory = useDeleteCategory();

    if (!session.value || !isAdmin(session.value.user)) {
        return <NoPermission />;
    }

    const error =
        deletePost.value?.errorMessage ?? deleteTag.value?.errorMessage ?? deleteCategory.value?.errorMessage;

    return (
        <div class="flex flex-col w-full gap-y-8">
            <h1 class="w-max text-5xl text-center md:text-left md:text-4xl font-bold tracking-tight bg-linear-120 from-ctp-peach via-ctp-red to-ctp-mauve-800 bg-clip-text text-transparent">
                Admin
            </h1>

            <div class="flex flex-row gap-x-4">
                {[
                    ['Posts', posts.value.total],
                    ['Tags', tags.value.length],
                    ['Categories', categories.value.length],
                ].map(([label, count]) => (
                    <div key={label} class="flex flex-col flex-1 bg-ctp-mantle dark:bg-ctp-surface0 p-4">
                        <span class="text-3xl font-bold">{count}</span>
                        <span class="text-sm text-ctp-subtext0">{label}</span>
                    </div>
                ))}
            </div>

            {error && <p class="text-ctp-red text-sm">{error}</p>}

            <section class="flex flex-col gap-y-2">
                <h2 class="text-2xl font-bold">Posts</h2>
                {posts.value.posts?.map((p) => (
                    <div
                        key={p.id}
                        class="flex flex-row items-center gap-x-4 bg-ctp-mantle dark:bg-ctp-surface0 p-4"
                    >
                        <div class="flex flex-col flex-1 min-w-0">
                            <a href={`/blog/${p.id}`} class="font-bold truncate hover:text-ctp-mauve">
                                {p.title}
                            </a>
                            <span class="text-xs text-ctp-subtext0">
                                {new Date(p.createdAt * 1000).toLocaleDateString()} ·{' '}
                                {p.category?.name ?? 'no category'} ·{' '}
                                {p.tags.map((t) => t.label).join(', ') || 'no tags'}
                            </span>
                        </div>
                        <Modal.Root>
                            <Modal.Trigger class="text-ctp-red text-xl" disabled={deletePost.isRunning}>
                                <SharpDeleteForeverIcon />
                            </Modal.Trigger>
                            <Modal.Panel class="modal-panel shadow-sm shadow-black/20">
                                <Modal.Title>Delete Post</Modal.Title>
                                <Modal.Description>
                                    "{p.title}" will be permanently deleted. This is non-reversible.
                                </Modal.Description>
                                <div class="flex flex-row gap-x-1 justify-end">
                                    <Modal.Close class="modal-close button-secondary">Cancel</Modal.Close>
                                    <Modal.Close
                                        class="modal-close button-danger"
                                        onClick$={() => deletePost.submit({ id: p.id })}
                                    >
                                        Delete
                                    </Modal.Close>
                                </div>
                            </Modal.Panel>
                        </Modal.Root>
                    </div>
                ))}
            </section>

            <section class="flex flex-col gap-y-2">
                <h2 class="text-2xl font-bold">Tags</h2>
                <div class="flex flex-row flex-wrap gap-2">
                    {tags.value.map((t) => (
                        <div
                            key={t.id}
                            class="flex flex-row items-center gap-x-2 border py-1 px-2 text-sm"
                            style={{ borderColor: t.color }}
                        >
                            {t.label}
                            <Modal.Root>
                                <Modal.Trigger
                                    class="text-ctp-red cursor-pointer flex flex-row items-center gap-x-1"
                                    disabled={deleteTag.isRunning}
                                >
                                    <SharpDeleteForeverIcon />
                                </Modal.Trigger>
                                <Modal.Panel class="modal-panel shadow-sm shadow-black/20">
                                    <Modal.Title>Delete Tag</Modal.Title>
                                    <Modal.Description>
                                        <span class="border p-0.5 px-1" style={{ borderColor: t.color }}>
                                            {t.label}
                                        </span>{' '}
                                        will be removed from every post that uses it.
                                    </Modal.Description>
                                    <div class="flex flex-row gap-x-1 justify-end">
                                        <Modal.Close class="modal-close button-secondary">Cancel</Modal.Close>
                                        <Modal.Close
                                            class="modal-close button-danger"
                                            onClick$={() => deleteTag.submit({ id: t.id })}
                                        >
                                            Delete
                                        </Modal.Close>
                                    </div>
                                </Modal.Panel>
                            </Modal.Root>
                        </div>
                    ))}
                </div>
            </section>

            <section class="flex flex-col gap-y-2">
                <h2 class="text-2xl font-bold">Categories</h2>
                {categories.value.map((c) => (
                    <div
                        key={c.id}
                        class="flex flex-row items-center gap-x-4 bg-ctp-mantle dark:bg-ctp-surface0 p-4"
                    >
                        <span class="flex-1">{c.name}</span>
                        <span class="text-xs text-ctp-subtext0">
                            {posts.value.posts?.filter((p) => p.category?.id === c.id).length} posts
                        </span>
                        <Modal.Root>
                            <Modal.Trigger class="text-ctp-red text-xl" disabled={deleteCategory.isRunning}>
                                <SharpDeleteForeverIcon />
                            </Modal.Trigger>
                            <Modal.Panel class="modal-panel shadow-sm shadow-black/20">
                                <Modal.Title>Delete Category</Modal.Title>
                                <Modal.Description>
                                    {c.name} will be deleted. Its posts keep existing without a category.
                                </Modal.Description>
                                <div class="flex flex-row gap-x-1 justify-end">
                                    <Modal.Close class="modal-close button-secondary">Cancel</Modal.Close>
                                    <Modal.Close
                                        class="modal-close button-danger"
                                        onClick$={() => deleteCategory.submit({ id: c.id })}
                                    >
                                        Delete
                                    </Modal.Close>
                                </div>
                            </Modal.Panel>
                        </Modal.Root>
                    </div>
                ))}
            </section>
        </div>
    );
});

export const head: DocumentHead = {
    title: 'Kevin | Admin',
    meta: [{ name: 'robots', content: 'noindex' }],
};
