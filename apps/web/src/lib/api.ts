import { Configuration, DefaultApi } from '@shared/contracts';

const config = new Configuration({
    basePath: process.env.BLOG_POSTS_HOST ?? 'http://localhost:3000',
});

export const apiClient = new DefaultApi(config);
