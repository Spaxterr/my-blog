import { routeAction$, routeLoader$ } from '@builder.io/qwik-city';
import { ResponseError } from '@shared/contracts';
import { apiClient } from './api';

export const useCategories = routeLoader$(() => apiClient.categoriesListCategories({}));

export const useCreateCategory = routeAction$(async (data, event) => {
    try {
        await apiClient.categoriesCreateCategory(
            {
                createCategoryPayload: {
                    name: data.name.toString(),
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

export const useDeleteCategory = routeAction$(async (data, event) => {
    try {
        await apiClient.categoriesDeleteCategory(
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
