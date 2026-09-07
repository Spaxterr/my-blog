import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import BaselineKeyboardArrowLeftIcon from '~icons/ic/baseline-keyboard-arrow-left';

interface Props {
    to: string;
}

export const BackButton = component$<Props>(({ to }) => {
    return (
        <Link class="p-2 flex flex-row items-center gap-x-1 hover:text-ctp-mauve-500" href={to}>
            <BaselineKeyboardArrowLeftIcon class="text-3xl md:text-lg" />
            <span>Back</span>
        </Link>
    );
});
