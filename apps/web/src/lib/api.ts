import { Configuration, DefaultApi } from '@shared/contracts';

// ponytail: routeLoader$-only, so a runtime env read is fine and the internal host never ships to a browser
const config = new Configuration({
    basePath: process.env.BLOG_POSTS_HOST ?? 'http://localhost:3000',
});

export const apiClient = new DefaultApi(config);
