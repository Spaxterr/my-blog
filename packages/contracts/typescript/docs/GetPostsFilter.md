
# GetPostsFilter


## Properties

Name | Type
------------ | -------------
`search` | string
`categories` | Array&lt;string&gt;
`tags` | [GetPostsFilterTags](GetPostsFilterTags.md)

## Example

```typescript
import type { GetPostsFilter } from ''

// TODO: Update the object below with actual values
const example = {
  "search": null,
  "categories": null,
  "tags": null,
} satisfies GetPostsFilter

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetPostsFilter
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


