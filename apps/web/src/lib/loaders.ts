import { routeAction$, routeLoader$ } from '@builder.io/qwik-city';
import { ResponseError } from '@shared/contracts';
import { apiClient } from './api';

export const useTags = routeLoader$(async () => {
    const tags = await apiClient.tagsListTags();
    return tags;
});

export const useCreateTag = routeAction$(async (data, event) => {
    try {
        await apiClient.tagsCreateTag(
            {
                createTagPayload: {
                    label: data.label.toString(),
                    color: data.color.toString(),
                },
            },
            {
                headers: {
                    cookie: event.request.headers.get('cookie') || '',
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (err) {
        if (err instanceof ResponseError) {
            return event.fail(err.response.status, {
                errorMessage: (await err.response.text()) || err.response.statusText,
            });
        }
        throw err;
    }
});
