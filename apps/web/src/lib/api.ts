import { Configuration, DefaultApi } from '~/generated';

const config = new Configuration({
    basePath: 'http://localhost:3000',
});

export const apiClient = new DefaultApi(config);
