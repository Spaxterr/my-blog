import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{ title: "Blog API" })
namespace BlogApi;

// -- Models

enum PostContentType {
    MARKDOWN,
    HTML,
}

enum Theme {
    Latte,
    Frappe,
    Macchiato,
    Mocha,
}

model Post {
    id: string;
    title: string;
    content: string;
    tags: string[];
    created_at: int64;
}

/** Represents a blog post without content, instead containing a summary. */
model SummarizedPost {
    ...OmitProperties<Post, "content">;
    summary: string;
}

model CreatePostPayload {
    @minLength(1) @maxLength(200) title: string;
    @minLength(1) @maxLength(100000) content: string;
    @minLength(1) @maxLength(1000) summary: string;
    @maxItems(20) tags: Array<string>;
}

// -- Routes

@route("/posts")
interface Posts {
    @get listPosts(@query q?: string): {
        @statusCode code: 200;
        @body posts: SummarizedPost[];
    };
    @get getPost(
        @path @format("uuid") id: string,
        @query content_type: PostContentType,
        @query theme: Theme,
    ): {
        @statusCode code: 200;
        @body post: Post;
    };
    @useAuth(BearerAuth) @post createPost(@header contentType: "application/json", @body payload: CreatePostPayload): {
        @statusCode code: 201;
    };
}
