# DefaultApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**categoriesCreateCategory**](DefaultApi.md#categoriescreatecategory) | **POST** /categories |  |
| [**categoriesDeleteCategory**](DefaultApi.md#categoriesdeletecategory) | **DELETE** /categories/{id} |  |
| [**categoriesListCategories**](DefaultApi.md#categorieslistcategories) | **GET** /categories |  |
| [**postsCreatePost**](DefaultApi.md#postscreatepost) | **POST** /posts |  |
| [**postsDeletePost**](DefaultApi.md#postsdeletepost) | **DELETE** /posts/{id} |  |
| [**postsGetPost**](DefaultApi.md#postsgetpost) | **GET** /posts/{id} |  |
| [**postsListPosts**](DefaultApi.md#postslistposts) | **GET** /posts |  |
| [**tagsCreateTag**](DefaultApi.md#tagscreatetag) | **POST** /tags |  |
| [**tagsDeleteTag**](DefaultApi.md#tagsdeletetag) | **DELETE** /tags/{id} |  |
| [**tagsListTags**](DefaultApi.md#tagslisttags) | **GET** /tags |  |



## categoriesCreateCategory

> categoriesCreateCategory(createCategoryPayload)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CategoriesCreateCategoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: BearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreateCategoryPayload
    createCategoryPayload: ...,
  } satisfies CategoriesCreateCategoryRequest;

  try {
    const data = await api.categoriesCreateCategory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createCategoryPayload** | [CreateCategoryPayload](CreateCategoryPayload.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The request has succeeded and a new resource has been created as a result. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## categoriesDeleteCategory

> categoriesDeleteCategory(id)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CategoriesDeleteCategoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: BearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CategoriesDeleteCategoryRequest;

  try {
    const data = await api.categoriesDeleteCategory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | There is no content to send for this request, but the headers may be useful.  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## categoriesListCategories

> Array&lt;Category&gt; categoriesListCategories(q)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CategoriesListCategoriesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string (optional)
    q: q_example,
  } satisfies CategoriesListCategoriesRequest;

  try {
    const data = await api.categoriesListCategories(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Category&gt;**](Category.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## postsCreatePost

> postsCreatePost(createPostPayload)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { PostsCreatePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: BearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreatePostPayload
    createPostPayload: ...,
  } satisfies PostsCreatePostRequest;

  try {
    const data = await api.postsCreatePost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createPostPayload** | [CreatePostPayload](CreatePostPayload.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The request has succeeded and a new resource has been created as a result. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## postsDeletePost

> postsDeletePost(id)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { PostsDeletePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: BearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies PostsDeletePostRequest;

  try {
    const data = await api.postsDeletePost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | There is no content to send for this request, but the headers may be useful.  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## postsGetPost

> Post postsGetPost(id, contentType, theme)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { PostsGetPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // PostContentType
    contentType: ...,
    // Theme
    theme: ...,
  } satisfies PostsGetPostRequest;

  try {
    const data = await api.postsGetPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **contentType** | `PostContentType` |  | [Defaults to `undefined`] [Enum: MARKDOWN, HTML] |
| **theme** | `Theme` |  | [Defaults to `undefined`] [Enum: Latte, Frappe, Macchiato, Mocha] |

### Return type

[**Post**](Post.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## postsListPosts

> Array&lt;SummarizedPost&gt; postsListPosts(page, count, q, categories, tags, tagMode)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { PostsListPostsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // number
    page: 56,
    // number
    count: 56,
    // string (optional)
    q: q_example,
    // Array<string> | Only posts in any of these categories. (optional)
    categories: ...,
    // Array<string> | Only posts with these tags, matched according to `tag_mode`. (optional)
    tags: ...,
    // TagMatchMode (optional)
    tagMode: ...,
  } satisfies PostsListPostsRequest;

  try {
    const data = await api.postsListPosts(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **page** | `number` |  | [Defaults to `undefined`] |
| **count** | `number` |  | [Defaults to `undefined`] |
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **categories** | `Array<string>` | Only posts in any of these categories. | [Optional] |
| **tags** | `Array<string>` | Only posts with these tags, matched according to &#x60;tag_mode&#x60;. | [Optional] |
| **tagMode** | `TagMatchMode` |  | [Optional] [Defaults to `undefined`] [Enum: ANY, ALL] |

### Return type

[**Array&lt;SummarizedPost&gt;**](SummarizedPost.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  * x-total-posts -  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## tagsCreateTag

> tagsCreateTag(createTagPayload)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { TagsCreateTagRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: BearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreateTagPayload
    createTagPayload: ...,
  } satisfies TagsCreateTagRequest;

  try {
    const data = await api.tagsCreateTag(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createTagPayload** | [CreateTagPayload](CreateTagPayload.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The request has succeeded and a new resource has been created as a result. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## tagsDeleteTag

> tagsDeleteTag(id)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { TagsDeleteTagRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: BearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies TagsDeleteTagRequest;

  try {
    const data = await api.tagsDeleteTag(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | There is no content to send for this request, but the headers may be useful.  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## tagsListTags

> Array&lt;Tag&gt; tagsListTags(q)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { TagsListTagsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string (optional)
    q: q_example,
  } satisfies TagsListTagsRequest;

  try {
    const data = await api.tagsListTags(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Tag&gt;**](Tag.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

