import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = ({ url, send }) => {
    send(
        new Response(
            `User-agent: *\nAllow: /\nDisallow: /profile\nDisallow: /new-blog\n\nSitemap: ${url.origin}/sitemap.xml\n`,
            { headers: { 'Content-Type': 'text/plain' } },
        ),
    );
};
