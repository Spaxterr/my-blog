import { component$ } from '@builder.io/qwik';
import SharpSearchIcon from '~icons/ic/sharp-search';

const Search = component$<{ value?: string }>(({ value }) => (
    <form class="flex flex-row px-1 bg-ctp-mantle items-center gap-x-2">
        <SharpSearchIcon class="text-xl" />
        <input
            type="search"
            name="q"
            value={value}
            placeholder="Search"
            class="w-full py-2 px-1 outline-none"
        />
    </form>
));

export default Search;
