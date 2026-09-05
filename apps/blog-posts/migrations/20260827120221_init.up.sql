CREATE TABLE blog_posts (
    id uuid NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    tags text[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX search_idx ON blog_posts
USING paradedb (id, title, content, tags)
WITH (key_field='id');
