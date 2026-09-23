import { component$ } from '@builder.io/qwik';
import type { Tag } from '@shared/contracts';

interface Props {
    tag: Tag;
}

export const TagDisplay = component$<Props>(({ tag }) => {
    return (
        <div key={tag.id} class="p-1 border" style={`border-color: ${tag.color}`}>
            {tag.label}
        </div>
    );
});
