import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { PostContentType, ResponseError } from '@shared/contracts';
import { BackButton } from '~/components/back-button/back-button';
import { apiClient } from '~/lib/api';
import { API_THEME, themeFromCookie } from '~/lib/theme';

export const useBlogPost = routeLoader$(async (event) => {
    try {
        const resp = await apiClient.postsGetPost({
            id: event.params.id,
            contentType: PostContentType.Html,
            theme: API_THEME[themeFromCookie(event.cookie)],
        });
        return {
            ...resp,
            content: resp.content,
        };
    } catch (err) {
        if (err instanceof ResponseError) {
            return event.fail(err.response.status, {
                errorMessage: err.response.statusText,
            });
        } else {
            throw err;
        }
    }
});

export default component$(() => {
    const blog = useBlogPost();

    if (blog.value.errorMessage) {
        return <div>{blog.value.errorMessage}</div>;
    }

    return (
        <div class="bg-ctp-mantle dark:bg-ctp-surface0 p-8 px-10">
            <BackButton to="/blog" />
            <article class="flex flex-col items-center gap-y-4 w-full overflow-auto">
                <div class="flex flex-col justify-between w-full items-center gap-y-2">
                    <h1 class="w-max text-5xl text-center md:text-left md:text-4xl font-bold tracking-tight flex flex-row items-center gap-x-2 bg-linear-120 from-ctp-peach via-ctp-red to-ctp-mauve-800 bg-clip-text text-transparent">
                        {blog?.value?.title}
                    </h1>
                    <span class="text-sm text-ctp-subtext0">
                        Posted{' '}
                        {blog.value.createdAt && new Date(blog.value.createdAt * 1000).toLocaleDateString()}
                    </span>
                </div>
                {/** biome-ignore lint/security/noDangerouslySetInnerHtml: Always renders trusted HTML content from controlled API endpoint */}
                <div class="prose-catppuccin defer-paint" dangerouslySetInnerHTML={blog?.value.content}></div>
            </article>
        </div>
    );
});
