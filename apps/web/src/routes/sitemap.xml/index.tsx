import type { RequestHandler } from '@builder.io/qwik-city';
import { apiClient } from '~/lib/api';

// NOTE: Includes up to 1000 blog posts. If posts ever outgrow that, this needs refactoring.
export const onGet: RequestHandler = async ({ url, send, headers }) => {
    const posts = await apiClient.postsListPosts({ count: 1000, page: 1 });

    const urls = [
        `<url><loc>${url.origin}/</loc></url>`,
        `<url><loc>${url.origin}/blog/</loc></url>`,
        ...posts.map(
            (p) =>
                `<url><loc>${url.origin}/blog/${p.id}/</loc><lastmod>${new Date(p.createdAt * 1000).toISOString()}</lastmod></url>`,
        ),
    ].join('');

    headers.set('Cache-Control', 'public, max-age=3600');
    send(
        new Response(
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
            {
                headers: { 'Content-Type': 'application/xml' },
            },
        ),
    );
};
