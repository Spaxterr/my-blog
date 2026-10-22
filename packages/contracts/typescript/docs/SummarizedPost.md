
# SummarizedPost

Represents a blog post without content, instead containing a summary.

## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`tags` | [Array&lt;Tag&gt;](Tag.md)
`category` | [Category](Category.md)
`createdAt` | number
`summary` | string

## Example

```typescript
import type { SummarizedPost } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "tags": null,
  "category": null,
  "createdAt": null,
  "summary": null,
} satisfies SummarizedPost

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SummarizedPost
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


