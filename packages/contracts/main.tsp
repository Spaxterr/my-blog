import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{ title: "Blog API" })
namespace BlogApi;

@format("uuid")
scalar uuid extends string;

@doc("A 6-digit hex color code.")
@pattern("^#([0-9a-fA-F]{6})$", "Must be a valid 6-digit hex code.")
@example("#3b82f6")
scalar HexColor extends string;

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
    id: uuid;
    title: string;
    content: string;
    tags: Tag[];
    category: Category | null;
    created_at: int64;
}

model Tag {
    id: uuid;
    label: string;
    color: HexColor;
}

model Category {
    id: uuid;
    name: string;
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
    category: uuid;
    @maxItems(20) tags: Array<uuid>;
}

model CreateTagPayload {
    ...OmitProperties<Tag, "id">;
}

model CreateCategoryPayload {
    ...OmitProperties<Category, "id">;
}

enum TagMatchMode {
    /** Posts with at least one of the given tags. */
    ANY,

    /** Posts with every one of the given tags. */
    ALL,
}

// -- Routes

@route("/posts")
interface Posts {
    @get listPosts(
        @query q?: string,

        /** Only posts in any of these categories. */
        @query categories?: uuid[],

        /** Only posts with these tags, matched according to `tag_mode`. */
        @query tags?: uuid[],

        @query tag_mode?: TagMatchMode = TagMatchMode.ANY,
        @query @minValue(1) page: int32,

        @query
        @minValue(1)
        @maxValue(100)
        count: int32,
    ): {
        @statusCode code: 200;
        @body posts: SummarizedPost[];
        @header `X-Total-Posts`: int32;
    };

    @get getPost(
        @path @format("uuid") id: uuid,
        @query content_type: PostContentType,
        @query theme: Theme,
    ): {
        @statusCode code: 200;
        @body post: Post;
    };

    @useAuth(BearerAuth) @post createPost(
        @header contentType: "application/json",
        @body payload: CreatePostPayload,
    ): {
        @statusCode code: 201;
    };

    @useAuth(BearerAuth) @delete deletePost(@path @format("uuid") id: uuid): {
        @statusCode code: 204;
    };
}

@route("/tags")
interface Tags {
    @get listTags(@query q?: string): {
        @statusCode code: 200;
        @body tags: Array<Tag>;
    };

    @useAuth(BearerAuth) @post createTag(
        @header contentType: "application/json",
        @body payload: CreateTagPayload,
    ): {
        @statusCode code: 201;
    };

    @useAuth(BearerAuth) @delete deleteTag(@path @format("uuid") id: uuid): {
        @statusCode code: 204;
    };
}

@route("/categories")
interface Categories {
    @get listCategories(@query q?: string): {
        @statusCode code: 200;
        @body categories: Array<Category>;
    };

    @useAuth(BearerAuth) @post createCategory(
        @header contentType: "application/json",
        @body payload: CreateCategoryPayload,
    ): {
        @statusCode code: 201;
    };

    @useAuth(BearerAuth) @delete deleteCategory(
        @path @format("uuid") id: uuid,
    ): {
        @statusCode code: 204;
    };
}
