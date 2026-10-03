import { routeAction$, routeLoader$ } from '@builder.io/qwik-city';
import { ResponseError } from '@shared/contracts';
import { apiClient } from './api';

export const useBlogPosts = routeLoader$(async (e) => {
    try {
        const q = e.url.searchParams.get('q');
        const page = Number(e.url.searchParams.get('page')) || 1;
        const count = Number(e.url.searchParams.get('count')) || 4;

        const resp = await apiClient.postsListPostsRaw({
            q: q ? encodeURIComponent(q) : undefined,
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
