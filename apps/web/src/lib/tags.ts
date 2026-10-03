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

export const useDeleteTag = routeAction$(async (data, event) => {
    try {
        await apiClient.tagsDeleteTag(
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
