import type { RequestHandler } from '@builder.io/qwik-city';

const robotsContent = `
User-agent: *
Allow: /
Disallow: /profile
Disallow: /new-blog
Disallow: /gift-pit
Sitemap: {origin}/sitemap.xml
`;

export const onGet: RequestHandler = ({ url, send }) => {
    const content = robotsContent.replace('{origin}', url.origin);
    send(new Response(content.trim(), { headers: { 'Content-Type': 'text/plain' } }));
};
