import { component$, type Signal } from '@builder.io/qwik';
import { Select } from '@qwik-ui/headless';
import { THEMES, type Theme } from '~/lib/theme';
import SharpPaletteIcon from '~icons/ic/sharp-palette';

interface Props {
    theme: Signal<Theme>;
}

export default component$<Props>(({ theme }) => {
    return (
        <Select.Root bind:value={theme} loop={true}>
            <Select.Trigger class="border border-ctp-surface2 bg-ctp-surface1 p-2 px-4 hover:cursor-pointer hover:brightness-125 w-auto md:w-36 flex flex-row gap-x-1 items-center justify-start">
                <SharpPaletteIcon />
                <Select.DisplayValue />
            </Select.Trigger>
            <Select.Popover class="data-open:flex flex-col px-2 bg-ctp-surface0 shadow-sm shadow-ctp-base text-ctp-text w-32">
                {Object.entries(THEMES).map(([value, label], i) => {
                    return (
                        <Select.Item
                            key={i}
                            class="flex flex-row gap-x-1 items-center justify-start px-2 py-2 aria-selected:bg-ctp-surface2 relative hover:bg-ctp-surface1 hover:cursor-pointer"
                            value={value}
                        >
                            <div
                                class="min-w-4 min-h-4 rounded-full"
                                style={`background-color: ${label.color}`}
                            ></div>
                            <Select.ItemLabel>{label.name}</Select.ItemLabel>
                        </Select.Item>
                    );
                })}
            </Select.Popover>
        </Select.Root>
    );
});
