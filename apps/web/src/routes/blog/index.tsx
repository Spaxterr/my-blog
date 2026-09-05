import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { apiClient } from '~/lib/api';
import SharpCircleIcon from '~icons/ic/sharp-circle';

export const useBlogPosts = routeLoader$(async () => {
    const resp = await apiClient.postsListPosts({});
    return resp;
});

export default component$(() => {
    const posts = useBlogPosts();

    return (
        <div class="flex flex-row items-center w-full justify-evenly">
            <div class="flex flex-col w-full">
                {posts.value?.map((p) => {
                    return (
                        <a
                            href={`/blog/${p.id}`}
                            key={p.id}
                            class="flex flex-col p-4 bg-ctp-surface0 hover:brightness-125"
                        >
                            <h2 class="text-2xl font-bold">{p.title}</h2>
                            <p class="text-ctp-subtext0 text-xs">{p.id}</p>
                            <div class="flex flex-row gap-x-2 items-center mt-4">
                                <div class="text-ctp-subtext0 text-xs">
                                    <span>{new Date(p.createdAt * 1000).toLocaleDateString()}</span>
                                </div>
                                <div class="text-[0.3rem] text-ctp-surface2">
                                    <SharpCircleIcon />
                                </div>
                                <div class="flex flex-row">
                                    {p.tags.map((tag, i) => {
                                        return (
                                            <span
                                                class="text-ctp-subtext1 border border-ctp-surface1 p-1 text-xs"
                                                key={`${i}`}
                                            >
                                                {tag}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
});
