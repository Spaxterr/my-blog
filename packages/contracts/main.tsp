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

model CreatePostPayload {
    title: string;
    content: string;
    tags: string[];
}

// -- Routes

@route("/posts")
interface Posts {
    @get listPosts(@query q?: string): {
        @statusCode code: 200;
        @body posts: Post[];
    };
    @get getPost(@path id: string, @query content_type: PostContentType, @query theme: Theme): {
        @statusCode code: 200;
        @body post: Post;
    };
    @post @useAuth(BearerAuth) createPost(@body payload: CreatePostPayload): {
        @statusCode code: 201;
    };
}
