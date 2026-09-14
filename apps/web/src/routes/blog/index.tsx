import { component$ } from '@builder.io/qwik';
import { Link, routeLoader$, useLocation, useNavigate } from '@builder.io/qwik-city';
import { Pagination } from '@qwik-ui/headless';
import Search from '~/components/search/search';
import { apiClient } from '~/lib/api';
import SharpCircleIcon from '~icons/ic/sharp-circle';
import SharpKeyboardArrowLeftIcon from '~icons/ic/sharp-keyboard-arrow-left';
import SharpKeyboardArrowRightIcon from '~icons/ic/sharp-keyboard-arrow-right';

export const useBlogPosts = routeLoader$(async (e) => {
    const q = e.url.searchParams.get('q');
    const page = Number(e.url.searchParams.get('page')) || 1;
    const count = Number(e.url.searchParams.get('count')) || 4;

    const resp = await apiClient.postsListPostsRaw({ q: q ? encodeURIComponent(q) : undefined, count, page });

    return { posts: await resp.value(), total: resp.raw.headers.get('X-Total-Posts') };
});

export default component$(() => {
    const posts = useBlogPosts();
    const location = useLocation();
    const nav = useNavigate();
    const q = location.url.searchParams.get('q') || undefined;
    const page = Number(location.url.searchParams.get('page')) || 1;
    const count = Number(location.url.searchParams.get('count')) || 4;
    const totalPages = Math.max(1, Math.ceil(Number(posts.value?.total ?? 0) / count));

    return (
        <div class="flex flex-col w-full gap-y-8">
            <h1 class="w-max text-5xl text-center md:text-left md:text-4xl font-bold tracking-tight bg-linear-120 from-ctp-peach via-ctp-red to-ctp-mauve-800 bg-clip-text text-transparent">
                Blog Posts
            </h1>
            <Search value={q} />
            <div class="flex flex-col w-full gap-y-4">
                {posts.value?.posts.map((p) => {
                    return (
                        <Link
                            href={`/blog/${p.id}`}
                            key={p.id}
                            class="flex flex-col p-4 bg-ctp-mantle dark:bg-ctp-surface0 hover:brightness-125"
                        >
                            <h2 class="text-2xl font-bold">{p.title}</h2>
                            <p class="text-sm font-thin text-ctp-subtext0">{p.summary}</p>
                            <div class="flex flex-row gap-x-2 items-center mt-4">
                                <div class="text-ctp-subtext0 text-xs">
                                    <span>{new Date(p.createdAt * 1000).toLocaleDateString()}</span>
                                </div>
                                <div class="text-[0.3rem] text-ctp-surface2">
                                    <SharpCircleIcon />
                                </div>
                                <div class="flex flex-row gap-x-1 items-center">
                                    {p.tags.map((tag, i) => {
                                        return (
                                            <div
                                                class="text-ctp-subtext1 border border-ctp-surface1 py-0.5 px-1 text-xs"
                                                key={`${i}`}
                                            >
                                                {tag}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Link>
                    );
                })}
                <div class="mx-auto">
                    {totalPages > 1 && (
                        <Pagination
                            selectedPage={page}
                            totalPages={totalPages}
                            onPageChange$={(newPage: number) => {
                                const url = new URL(location.url);
                                url.searchParams.set('page', newPage.toString());
                                nav(url.pathname + url.search);
                            }}
                            customArrowTexts={{ previous: '', next: '' }}
                            class="pagination-wrapper flex flex-row gap-x-2 items-center justify-start w-full"
                            selectedClass="text-ctp-mauve border border-ctp-mauve px-1"
                            defaultClass="hover:text-ctp-mauve-700 px-1 cursor-pointer"
                            prevButtonClass="hover:text-ctp-mauve-700 cursor-pointer px-2 font-bold"
                            nextButtonClass="hover:text-ctp-mauve-700 cursor-pointer px-2 font-bold"
                        >
                            <span q:slot="prefix">
                                <SharpKeyboardArrowLeftIcon />
                            </span>
                            <span q:slot="suffix">
                                <SharpKeyboardArrowRightIcon />
                            </span>
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    );
});
