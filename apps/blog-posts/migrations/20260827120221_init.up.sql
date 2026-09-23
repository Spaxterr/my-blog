CREATE TABLE categories (
    id uuid NOT NULL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    deleted boolean NOT NULL DEFAULT false
);

CREATE TABLE blog_posts (
    id uuid NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    summary text,
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    deleted boolean NOT NULL DEFAULT false
);

CREATE TABLE tags (
    id uuid NOT NULL PRIMARY KEY,
    label text NOT NULL,
    color text NOT NULL,
    deleted boolean NOT NULL DEFAULT false
);

-- Join Tables

CREATE TABLE blog_post_tags (
    blog_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, tag_id)
);

-- Search index

CREATE INDEX search_idx ON blog_posts
USING paradedb (
    id,
    (title::pdb.edge_ngram(3,20)),
    (content::pdb.edge_ngram(3,20)),
    (summary::pdb.edge_ngram(3,20))
)
WITH (key_field='id');
