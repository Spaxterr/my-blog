import { Configuration, DefaultApi } from '@shared/contracts';

const config = new Configuration({
    basePath: 'http://localhost:3000',
});

export const apiClient = new DefaultApi(config);
