import { component$ } from '@builder.io/qwik';
import { Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import { Tooltip } from '@qwik-ui/headless';
import { type Category, type Tag, TagMatchMode } from '@shared/contracts';
import { PAGE_SIZES, parsePostFilters } from '~/lib/blog-posts';
import SharpCloseIcon from '~icons/ic/sharp-close';
import SharpExpandMoreIcon from '~icons/ic/sharp-expand-more';
import BaselineHelpOutlineIcon from '~icons/ic/sharp-help-outline';
import SharpSearchIcon from '~icons/ic/sharp-search';
import SharpTuneIcon from '~icons/ic/sharp-tune';

interface Props {
    categories: Category[];
    tags: Tag[];
}

const pill =
    'flex items-center gap-x-1 border px-2 py-1 text-xs cursor-pointer select-none has-focus-visible:outline-2 has-focus-visible:outline-ctp-lavender';

export default component$<Props>(({ categories, tags }) => {
    const location = useLocation();
    const nav = useNavigate();
    const filters = parsePostFilters(location.url.searchParams);
    const activeCount = filters.categories.length + filters.tags.length;

    return (
        <form
            method="get"
            preventdefault:submit
            onSubmit$={(_, form) => {
                const params = new URLSearchParams();
                for (const [key, value] of new FormData(form)) {
                    if (value !== '') params.append(key, value.toString());
                }
                nav(`${location.url.pathname}?${params}`);
            }}
            onChange$={(e, form) => {
                if ((e.target as HTMLInputElement).name !== 'q') form.requestSubmit();
            }}
            class="flex flex-col gap-y-2"
        >
            <label class="flex flex-row items-center gap-x-2 px-3 bg-ctp-mantle dark:bg-ctp-surface0 focus-within:outline-2 focus-within:outline-ctp-lavender">
                <SharpSearchIcon class="text-xl text-ctp-subtext0 shrink-0" />
                <input
                    type="search"
                    minLength={3}
                    name="q"
                    value={filters.q}
                    placeholder="Search posts..."
                    aria-label="Search posts"
                    class="w-full py-3 outline-none! bg-transparent"
                    onSearch$={(_, input) => {
                        if (!input.value) input.form?.requestSubmit();
                    }}
                />
            </label>

            <details class="group bg-ctp-mantle dark:bg-ctp-surface0">
                <summary class="flex flex-row items-center gap-x-2 px-3 py-2 cursor-pointer select-none list-none text-sm text-ctp-subtext1 hover:text-ctp-text">
                    <SharpTuneIcon />
                    <span>Filters</span>
                    {activeCount > 0 && <span class="text-xs">{activeCount}</span>}
                    <SharpExpandMoreIcon class="ml-auto group-open:rotate-180" />
                </summary>

                <div class="flex flex-col gap-y-4 px-3 pb-4 pt-2 border-t border-ctp-surface0 dark:border-ctp-surface1">
                    {categories.length > 0 && (
                        <fieldset class="flex flex-col gap-y-2">
                            <legend class="text-ctp-subtext0 mb-2">Categories</legend>
                            <div class="flex flex-row flex-wrap gap-2">
                                {categories.map((c) => (
                                    <label
                                        key={c.id}
                                        class={`${pill} border-ctp-surface2 text-ctp-subtext1 hover:border-ctp-mauve has-checked:bg-ctp-mauve has-checked:border-ctp-mauve has-checked:text-ctp-base`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="categories"
                                            value={c.id}
                                            checked={filters.categories.includes(c.id)}
                                            class="sr-only"
                                        />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    {tags.length > 0 && (
                        <fieldset class="flex flex-col gap-y-2">
                            <div class="inline-flex flex-col gap-x-4 mb-2">
                                <legend class="text-ctp-subtext0 float-left">Tags</legend>
                                <div class="flex flex-row gap-x-1 items-center">
                                    <div
                                        role="radiogroup"
                                        aria-label="Tag matching"
                                        class={`flex max-w-max flex-row text-sm border border-ctp-surface2`}
                                        title="Match posts with any or all of the selected tags"
                                    >
                                        {[
                                            { value: TagMatchMode.Any, label: 'Any' },
                                            { value: TagMatchMode.All, label: 'All' },
                                        ].map((m) => (
                                            <label
                                                key={m.value}
                                                class="px-2 py-0.5 cursor-pointer text-ctp-subtext1 has-checked:bg-ctp-surface2 has-checked:text-ctp-text has-focus-visible:outline-2 has-focus-visible:outline-ctp-lavender"
                                            >
                                                <input
                                                    type="radio"
                                                    name="tag_mode"
                                                    value={m.value}
                                                    checked={filters.tagMode === m.value}
                                                    class="sr-only"
                                                />
                                                {m.label}
                                            </label>
                                        ))}
                                    </div>
                                    <div>
                                        <Tooltip.Root gutter={4} flip>
                                            <Tooltip.Trigger>
                                                <BaselineHelpOutlineIcon class="text-lg" />
                                            </Tooltip.Trigger>
                                            <Tooltip.Panel class="tooltip-panel p-2 bg-ctp-surface1 shadow-sm text-ctp-text">
                                                <ul class="p-2">
                                                    <li>
                                                        <strong>Any</strong> - Results contain at least one of
                                                        the selected tags.
                                                    </li>
                                                    <li>
                                                        <strong>All</strong> - Results contain all selected
                                                        tags.
                                                    </li>
                                                </ul>
                                            </Tooltip.Panel>
                                        </Tooltip.Root>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-row flex-wrap gap-2">
                                {tags.map((t) => (
                                    <label
                                        key={t.id}
                                        style={{ '--tag': t.color }}
                                        class={`${pill} border-(--tag) text-ctp-subtext1 hover:bg-(--tag)/20 has-checked:bg-(--tag) has-checked:text-ctp-base`}
                                    >
                                        <input
                                            type="checkbox"
                                            name="tags"
                                            value={t.id}
                                            checked={filters.tags.includes(t.id)}
                                            class="sr-only"
                                        />
                                        {t.label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    <div class="flex flex-row items-center justify-between gap-x-4 text-xs text-ctp-subtext0">
                        <label class="flex flex-row items-center gap-x-2">
                            Per page
                            <select
                                name="count"
                                class="bg-ctp-base dark:bg-ctp-mantle text-ctp-text px-2 py-1 cursor-pointer"
                            >
                                {PAGE_SIZES.map((size) => (
                                    <option key={size} selected={filters.count === size}>
                                        {String(size)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {activeCount > 0 && (
                            <Link
                                href={location.url.pathname}
                                class="flex flex-row items-center gap-x-1 hover:text-ctp-red!"
                            >
                                <SharpCloseIcon />
                                Clear filters
                            </Link>
                        )}
                    </div>
                </div>
            </details>

            <noscript>
                <button type="submit" class="bg-ctp-mauve text-ctp-base px-4 py-2 text-sm font-bold">
                    Apply filters
                </button>
            </noscript>
        </form>
    );
});
