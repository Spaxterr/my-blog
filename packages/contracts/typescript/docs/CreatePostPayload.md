
# CreatePostPayload


## Properties

Name | Type
------------ | -------------
`title` | string
`content` | string
`summary` | string
`category` | string
`tags` | Array&lt;string&gt;

## Example

```typescript
import type { CreatePostPayload } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "content": null,
  "summary": null,
  "category": null,
  "tags": null,
} satisfies CreatePostPayload

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreatePostPayload
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


