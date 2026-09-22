import { component$, useComputed$, useSignal } from '@builder.io/qwik';
import { Select } from '@qwik-ui/headless';
import type { Tag } from '@shared/contracts';

interface Props {
    tags: Tag[];
}

export default component$<Props>(({ tags }) => {
    const displayValue = useSignal<string[]>([]);
    const value = useSignal<string[]>([]);
    const selectedTags = useComputed$(() => {
        return value.value.map((tagId) => tags.find((t) => t.id === tagId));
    });

    return (
        <Select.Root bind:displayValue={displayValue} bind:value={value} multiple loop={true}>
            <Select.Trigger class="bg-ctp-base dark:bg-ctp-mantle p-2 px-4 hover:cursor-pointer hover:brightness-125 min-w-36 w-full flex flex-row gap-x-1 items-center justify-start">
                <Select.HiddenNativeSelect multiple name="tags" value={value.value} />
                <Select.DisplayValue class="text-xs flex flex-row flex-wrap gap-x-1">
                    {selectedTags.value.map((tag) => {
                        if (tag) {
                            return (
                                <div key={tag.id} class="p-1 border" style={`border-color: ${tag.color}`}>
                                    {tag.label}
                                </div>
                            );
                        } else return null;
                    })}
                </Select.DisplayValue>
            </Select.Trigger>
            <Select.Popover class="data-open:flex flex-row flex-wrap bg-ctp-base max-w-64 shadow-sm shadow-ctp-base text-ctp-text text-xs py-4">
                {tags.map((tag) => {
                    return (
                        <Select.Item
                            key={tag.id}
                            class="px-2 py-2 aria-selected:bg-ctp-surface2 relative hover:bg-ctp-surface1 hover:cursor-pointer"
                            value={tag.id}
                        >
                            <Select.ItemLabel class="p-1 border" style={`border-color: ${tag.color}`}>
                                {tag.label}
                            </Select.ItemLabel>
                        </Select.Item>
                    );
                })}
            </Select.Popover>
        </Select.Root>
    );
});
