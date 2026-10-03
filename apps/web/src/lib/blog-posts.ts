import { routeAction$, routeLoader$ } from '@builder.io/qwik-city';
import { ResponseError, TagMatchMode } from '@shared/contracts';
import { apiClient } from './api';

export const PAGE_SIZES = [4, 10, 20, 50];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads the post filters from the URL, dropping anything the API would reject. */
export const parsePostFilters = (params: URLSearchParams) => {
    const count = Number(params.get('count'));
    return {
        q: params.get('q')?.trim() ?? '',
        categories: params.getAll('categories').filter((id) => UUID_RE.test(id)),
        tags: params.getAll('tags').filter((id) => UUID_RE.test(id)),
        tagMode: params.get('tag_mode') === TagMatchMode.All ? TagMatchMode.All : TagMatchMode.Any,
        page: Math.max(1, Math.floor(Number(params.get('page'))) || 1),
        count: PAGE_SIZES.includes(count) ? count : PAGE_SIZES[0],
    };
};

export const useBlogPosts = routeLoader$(async (e) => {
    try {
        const { q, categories, tags, tagMode, page, count } = parsePostFilters(e.url.searchParams);

        const resp = await apiClient.postsListPostsRaw({
            q: q || undefined,
            categories: categories.length ? categories : undefined,
            tags: tags.length ? tags : undefined,
            tagMode: tags.length ? tagMode : undefined,
            count,
            page,
        });
        const posts = await resp.value();
        const total = Number(resp.raw.headers.get('X-Total-Posts'));

        return { posts: posts, total: total };
    } catch (err) {
        if (err instanceof ResponseError) {
            return e.fail(err.response.status, {
                errorMessage: (await err.response.text()) || err.response.statusText,
            });
        }
        throw err;
    }
});

export const useCreatePost = routeAction$(async (data, event) => {
    try {
        await apiClient.postsCreatePost(
            {
                createPostPayload: {
                    title: String(data.title),
                    summary: String(data.summary),
                    content: String(data.content),
                    tags: [data.tags ?? []].flat().map(String).filter(Boolean),
                    category: String(data.category),
                },
            },
            {
                headers: {
                    cookie: event.request.headers.get('cookie') || '',
                    'Content-Type': 'application/json',
                },
            },
        );
        return { success: true };
    } catch (err) {
        if (err instanceof ResponseError) {
            return event.fail(err.response.status, {
                errorMessage: (await err.response.text()) || err.response.statusText,
            });
        }
        throw err;
    }
});

export const useDeleteBlogPost = routeAction$(async (data, event) => {
    try {
        await apiClient.postsDeletePost(
            { id: data.id.toString() },
            { headers: { cookie: event.request.headers.get('cookie') || '' } },
        );
        return { success: true };
    } catch (err) {
        if (err instanceof ResponseError) {
            return event.fail(err.response.status, {
                errorMessage: (await err.response.text()) || err.response.statusText,
            });
        }
        throw err;
    }
});
