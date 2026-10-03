import { component$, useSignal } from '@builder.io/qwik';
import { Form } from '@builder.io/qwik-city';
import { Modal, Select } from '@qwik-ui/headless';
import TagSelect from '~/components/tag-select/tag-select';
import { isAdmin } from '~/lib/auth';
import { useCreatePost } from '~/lib/blog-posts';
import { useCreateCategory } from '~/lib/categories';
import { useCreateTag, useTags } from '~/lib/tags';
import { useCategories } from '../admin';
import { useAuthSession } from '../layout';
import NoPermission from '../no-permission';

export { useCategories, useCreateCategory, useCreatePost, useCreateTag, useTags };

const TAG_COLORS = [
    '#f2d5cf',
    '#eebebe',
    '#f4b8e4',
    '#ca9ee6',
    '#e78284',
    '#ea999c',
    '#ef9f76',
    '#e5c890',
    '#a6d189',
    '#81c8be',
    '#99d1db',
    '#85c1dc',
    '#8caaee',
    '#babbf1',
];

export default component$(() => {
    const session = useAuthSession();
    const create = useCreatePost();
    const tags = useTags();
    const categories = useCategories();

    const createTag = useCreateTag();
    const tagModalOpen = useSignal(false);
    const newTagLabel = useSignal('');
    const newTagColor = useSignal('#ca9ee6');

    const createCategory = useCreateCategory();
    const categoryModalOpen = useSignal(false);
    const newCategoryName = useSignal('');
    const selectedCategory = useSignal('');

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
                <div class="flex flex-row gap-x-2 items-end">
                    <Select.Root name="category" bind:displayValue={selectedCategory}>
                        <Select.Label>Category</Select.Label>
                        <Select.HiddenNativeSelect />
                        <Select.Trigger
                            type="button"
                            class="bg-ctp-base dark:bg-ctp-mantle p-2 px-4 hover:cursor-pointer hover:brightness-125 min-w-36 flex flex-row gap-x-1 items-center justify-start h-8"
                        >
                            <Select.DisplayValue>{selectedCategory.value}</Select.DisplayValue>
                        </Select.Trigger>
                        <Select.Popover class="data-open:flex flex-row flex-wrap bg-ctp-base w-36 shadow-sm shadow-ctp-base text-ctp-text py-4">
                            {categories.value.map((c) => {
                                return (
                                    <Select.Item
                                        key={c.id}
                                        class="hover:bg-ctp-surface1 hover:cursor-pointer w-full"
                                        value={c.id}
                                    >
                                        <Select.ItemLabel class="p-1">{c.name}</Select.ItemLabel>
                                    </Select.Item>
                                );
                            })}
                        </Select.Popover>
                    </Select.Root>
                    <Modal.Root bind:show={categoryModalOpen}>
                        <Modal.Trigger class="button-secondary">New Category</Modal.Trigger>
                        <Modal.Panel class="modal-panel shadow-sm shadow-black/20 w-lg">
                            <Modal.Title>New Category</Modal.Title>
                            <input
                                bind:value={newCategoryName}
                                placeholder="Name"
                                class="bg-ctp-base dark:bg-ctp-surface0 py-1 px-1 outline-none"
                            />
                            {createCategory.value?.errorMessage && (
                                <p class="text-ctp-red text-sm">{createCategory.value.errorMessage}</p>
                            )}
                            <div class="flex flex-row gap-x-1 justify-end">
                                <Modal.Close class="modal-close button-secondary">Cancel</Modal.Close>
                                <button
                                    type="button"
                                    class="button-primary"
                                    disabled={createCategory.isRunning}
                                    onClick$={async () => {
                                        if (!newCategoryName.value) return;
                                        const { value } = await createCategory.submit({
                                            name: newCategoryName.value,
                                        });
                                        if (value?.failed) return;
                                        newCategoryName.value = '';
                                        categoryModalOpen.value = false;
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </Modal.Panel>
                    </Modal.Root>
                </div>
                <div class="flex flex-col gap-y-1">
                    Tags
                    <div class="flex flex-row items-center gap-x-2">
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
                                    inlist="tag-colors"
                                    class="bg-ctp-base dark:bg-ctp-surface0 py-1 px-1 outline-none"
                                />
                                <datalist id="tag-colors">
                                    {TAG_COLORS.map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
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
